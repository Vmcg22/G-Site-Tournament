from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, case, literal
from sqlalchemy.orm import selectinload
import uuid

from app.database import get_db
from app.models import Tournament, Team, Player, Match, MatchResult
from app.schemas import (
    TournamentCreate, TournamentOut,
    TeamCreate, TeamOut,
    MatchResultCreate, MatchResultBulk, MatchResultOut, MatchOut,
    LeaderboardEntry, LeaderboardOut,
    TopFraggerEntry,
)
from app.scoring import calculate_placement_points, calculate_score
from app.websocket import manager

app = FastAPI(title="G-SITE Tournament API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────── Health ────────────────────────────

@app.get("/api/health")
async def health():
    return {"status": "ok"}


# ──────────────────────────── Tournament ────────────────────────

@app.post("/api/tournaments", response_model=TournamentOut)
async def create_tournament(data: TournamentCreate, db: AsyncSession = Depends(get_db)):
    tournament = Tournament(**data.model_dump())
    db.add(tournament)
    # Auto-create matches
    for i in range(1, data.num_matches + 1):
        db.add(Match(tournament_id=tournament.id, match_number=i))
    await db.commit()
    await db.refresh(tournament)
    return tournament


@app.get("/api/tournaments", response_model=list[TournamentOut])
async def list_tournaments(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tournament).order_by(Tournament.created_at.desc()))
    return result.scalars().all()


@app.get("/api/tournaments/{tournament_id}", response_model=TournamentOut)
async def get_tournament(tournament_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tournament).where(Tournament.id == tournament_id))
    tournament = result.scalar_one_or_none()
    if not tournament:
        raise HTTPException(404, "Tournament not found")
    return tournament


@app.delete("/api/tournaments/{tournament_id}")
async def delete_tournament(tournament_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tournament).where(Tournament.id == tournament_id))
    tournament = result.scalar_one_or_none()
    if not tournament:
        raise HTTPException(404, "Tournament not found")
    await db.delete(tournament)
    await db.commit()
    return {"status": "deleted"}


# ──────────────────────────── Teams ─────────────────────────────

@app.post("/api/tournaments/{tournament_id}/teams", response_model=TeamOut)
async def register_team(tournament_id: uuid.UUID, data: TeamCreate, db: AsyncSession = Depends(get_db)):
    # Verify tournament exists
    result = await db.execute(select(Tournament).where(Tournament.id == tournament_id))
    if not result.scalar_one_or_none():
        raise HTTPException(404, "Tournament not found")

    team = Team(tournament_id=tournament_id, name=data.name)
    db.add(team)
    await db.flush()

    for p in data.players:
        db.add(Player(team_id=team.id, name=p.name, gamertag=p.gamertag))

    await db.commit()

    # Reload with players
    result = await db.execute(
        select(Team).options(selectinload(Team.players)).where(Team.id == team.id)
    )
    return result.scalar_one()


@app.get("/api/tournaments/{tournament_id}/teams", response_model=list[TeamOut])
async def list_teams(tournament_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Team)
        .options(selectinload(Team.players))
        .where(Team.tournament_id == tournament_id)
        .order_by(Team.name)
    )
    return result.scalars().all()


# ──────────────────────────── Matches ───────────────────────────

@app.get("/api/tournaments/{tournament_id}/matches")
async def list_matches(tournament_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Match)
        .options(selectinload(Match.results).selectinload(MatchResult.team))
        .where(Match.tournament_id == tournament_id)
        .order_by(Match.match_number)
    )
    matches = result.scalars().all()
    out = []
    for m in matches:
        results_out = []
        for r in m.results:
            results_out.append(MatchResultOut(
                id=r.id,
                team_id=r.team_id,
                team_name=r.team.name if r.team else None,
                placement=r.placement,
                kills=r.kills,
                placement_points=r.placement_points,
                score=r.score,
                status=r.status,
                warnings=r.warnings if r.warnings else [],
            ))
        out.append({
            "id": str(m.id),
            "match_number": m.match_number,
            "is_locked": m.is_locked,
            "results": [r.model_dump() for r in results_out],
        })
    return out


# ──────────────────────── Match Results ─────────────────────────

@app.post("/api/matches/{match_id}/results")
async def submit_results(match_id: uuid.UUID, data: MatchResultBulk, db: AsyncSession = Depends(get_db)):
    # Check match exists and is not locked
    result = await db.execute(select(Match).where(Match.id == match_id))
    match = result.scalar_one_or_none()
    if not match:
        raise HTTPException(404, "Match not found")
    if match.is_locked:
        raise HTTPException(403, "Match is locked and cannot be edited")

    # Detect duplicate placements
    placements = [r.placement for r in data.results if r.placement is not None]
    dup_placements = {p for p in placements if placements.count(p) > 1}

    all_warnings = []

    for entry in data.results:
        warnings = []

        # Handle missing kills -> default to 0 with warning
        kills = entry.kills if entry.kills is not None else 0
        if entry.kills is None:
            warnings.append("Kills data missing — defaulted to 0")

        # Handle missing placement
        if entry.placement is None:
            warnings.append("Placement missing — no placement points awarded")

        # Handle duplicate placements
        if entry.placement in dup_placements:
            warnings.append(f"Duplicate placement ({entry.placement}) — points still awarded")

        pp = calculate_placement_points(entry.placement)
        score = calculate_score(kills, entry.placement)

        # Upsert: update if exists, create if not
        existing = await db.execute(
            select(MatchResult).where(
                MatchResult.match_id == match_id,
                MatchResult.team_id == entry.team_id,
            )
        )
        existing_result = existing.scalar_one_or_none()

        if existing_result:
            existing_result.placement = entry.placement
            existing_result.kills = kills
            existing_result.placement_points = pp
            existing_result.score = score
            existing_result.warnings = warnings
        else:
            db.add(MatchResult(
                match_id=match_id,
                team_id=entry.team_id,
                placement=entry.placement,
                kills=kills,
                placement_points=pp,
                score=score,
                warnings=warnings,
            ))

        if warnings:
            all_warnings.extend(warnings)

    await db.commit()

    # Check missing teams
    team_count = await db.execute(
        select(func.count(Team.id)).where(Team.tournament_id == match.tournament_id)
    )
    total_teams = team_count.scalar()
    submitted_teams = len(data.results)
    missing_note = None
    if submitted_teams < total_teams:
        missing_note = f"{total_teams - submitted_teams} team(s) have no results for this match"

    # Broadcast leaderboard update
    leaderboard = await _build_leaderboard(match.tournament_id, db)
    await manager.broadcast(str(match.tournament_id), {
        "type": "leaderboard_update",
        "leaderboard": [e.model_dump() for e in leaderboard],
    })

    return {
        "status": "ok",
        "warnings": all_warnings,
        "missing_teams": missing_note,
    }


# ──────────────────── Lock / Dispute ────────────────────────────

@app.put("/api/matches/{match_id}/lock")
async def toggle_lock(match_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Match).where(Match.id == match_id))
    match = result.scalar_one_or_none()
    if not match:
        raise HTTPException(404, "Match not found")
    match.is_locked = not match.is_locked
    await db.commit()
    return {"match_id": str(match_id), "is_locked": match.is_locked}


@app.put("/api/match-results/{result_id}/dispute")
async def toggle_dispute(result_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MatchResult).where(MatchResult.id == result_id))
    mr = result.scalar_one_or_none()
    if not mr:
        raise HTTPException(404, "Result not found")

    # Check if match is locked
    match_res = await db.execute(select(Match).where(Match.id == mr.match_id))
    match = match_res.scalar_one()
    if match.is_locked:
        raise HTTPException(403, "Cannot dispute a locked match")

    mr.status = "disputed" if mr.status == "confirmed" else "confirmed"
    await db.commit()

    # Broadcast update
    leaderboard = await _build_leaderboard(match.tournament_id, db)
    await manager.broadcast(str(match.tournament_id), {
        "type": "leaderboard_update",
        "leaderboard": [e.model_dump() for e in leaderboard],
    })

    return {"result_id": str(result_id), "status": mr.status}


# ──────────────────────── Leaderboard ───────────────────────────

async def _build_leaderboard(tournament_id: uuid.UUID, db: AsyncSession) -> list[LeaderboardEntry]:
    # Get all teams for this tournament
    teams_result = await db.execute(
        select(Team).where(Team.tournament_id == tournament_id).order_by(Team.name)
    )
    teams = teams_result.scalars().all()

    entries = []
    for team in teams:
        results_q = await db.execute(
            select(MatchResult).where(MatchResult.team_id == team.id)
        )
        results = results_q.scalars().all()

        total_kills = sum(r.kills for r in results)
        placement_points = sum(r.placement_points for r in results)
        total_score = sum(r.score for r in results)
        matches_played = len(results)
        has_disputed = any(r.status == "disputed" for r in results)

        entries.append(LeaderboardEntry(
            rank=0,
            team_id=team.id,
            team_name=team.name,
            total_kills=total_kills,
            placement_points=placement_points,
            total_score=total_score,
            matches_played=matches_played,
            has_disputed=has_disputed,
        ))

    # Sort: total_score desc, total_kills desc, team_name asc
    entries.sort(key=lambda e: (-e.total_score, -e.total_kills, e.team_name.lower()))

    # Assign ranks
    for i, entry in enumerate(entries):
        entry.rank = i + 1

    return entries


@app.get("/api/tournaments/{tournament_id}/leaderboard", response_model=LeaderboardOut)
async def get_leaderboard(tournament_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tournament).where(Tournament.id == tournament_id))
    tournament = result.scalar_one_or_none()
    if not tournament:
        raise HTTPException(404, "Tournament not found")

    entries = await _build_leaderboard(tournament_id, db)

    return LeaderboardOut(
        tournament_id=tournament.id,
        tournament_name=tournament.name,
        entries=entries,
    )


# ──────────────────────── Top Fraggers ──────────────────────────

@app.get("/api/tournaments/{tournament_id}/top-fraggers", response_model=list[TopFraggerEntry])
async def get_top_fraggers(tournament_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """Top 5 players by kills. Kills are split evenly among team members per match."""
    # Get all teams with players
    teams_result = await db.execute(
        select(Team)
        .options(selectinload(Team.players))
        .where(Team.tournament_id == tournament_id)
    )
    teams = teams_result.scalars().all()

    player_stats = {}  # player_id -> {name, gamertag, team_name, kills, matches}

    for team in teams:
        # Get team results
        results_q = await db.execute(
            select(MatchResult).where(MatchResult.team_id == team.id)
        )
        results = results_q.scalars().all()

        num_players = len(team.players) or 1
        for player in team.players:
            total_kills = 0
            matches_played = 0
            for r in results:
                total_kills += r.kills // num_players
                matches_played += 1
            # Give remainder kills to first player
            if player == team.players[0]:
                for r in results:
                    total_kills += r.kills % num_players

            player_stats[player.id] = {
                "player_name": player.name,
                "gamertag": player.gamertag,
                "team_name": team.name,
                "total_kills": total_kills,
                "matches_played": matches_played,
            }

    # Sort by kills desc, take top 5
    sorted_players = sorted(player_stats.values(), key=lambda p: -p["total_kills"])[:5]

    return [
        TopFraggerEntry(rank=i + 1, **p)
        for i, p in enumerate(sorted_players)
    ]


# ──────────────────────── WebSocket ─────────────────────────────

@app.websocket("/ws/tournament/{tournament_id}")
async def tournament_ws(websocket: WebSocket, tournament_id: str):
    await manager.connect(tournament_id, websocket)
    try:
        while True:
            # Keep connection alive, client just listens
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(tournament_id, websocket)


# ──────────────────────── Seed Endpoint ─────────────────────────

@app.post("/api/seed")
async def seed_data(db: AsyncSession = Depends(get_db)):
    """Seed a tournament with 6 teams for demo purposes."""
    # Create tournament
    t = Tournament(name="G-SITE Warzone Showdown", game="Call of Duty", format="Trios Custom", num_matches=3)
    db.add(t)
    await db.flush()

    # Create 3 matches
    for i in range(1, 4):
        db.add(Match(tournament_id=t.id, match_number=i))

    # 6 teams with 3 players each
    team_data = [
        ("Falcons", ["Hisoka", "Dongy", "Newbs"]),
        ("Corillos", ["Amir", "zDark", "CriminalGod"]),
        ("TwisMinds", ["Shifty", "Almond", "zSmit"]),
        ("G2 Esports", ["Cythe", "Anziery", "Bigman"]),
        ("Virtus Pro", ["Grimey", "Destroy", "Adrian"]),
        ("Gen.G Esports", ["Rated", "Aydan", "Lenun"]),
    ]

    for team_name, players in team_data:
        team = Team(tournament_id=t.id, name=team_name)
        db.add(team)
        await db.flush()
        for pname in players:
            db.add(Player(team_id=team.id, name=pname, gamertag=pname))

    await db.commit()
    return {"status": "seeded", "tournament_id": str(t.id)}
