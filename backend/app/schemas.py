from __future__ import annotations
import uuid
from pydantic import BaseModel, Field


# --- Tournament ---
class TournamentCreate(BaseModel):
    name: str
    game: str = "Call of Duty"
    format: str = "Trios Custom"
    num_matches: int = 3
    prize_pool: str | None = None
    event_date: str | None = None
    contact: str | None = None


class TournamentOut(BaseModel):
    id: uuid.UUID
    name: str
    game: str
    format: str
    num_matches: int
    prize_pool: str | None
    event_date: str | None
    contact: str | None
    status: str

    model_config = {"from_attributes": True}


# --- Player ---
class PlayerCreate(BaseModel):
    name: str
    gamertag: str | None = None


class PlayerOut(BaseModel):
    id: uuid.UUID
    name: str
    gamertag: str | None

    model_config = {"from_attributes": True}


# --- Team ---
class TeamCreate(BaseModel):
    name: str
    players: list[PlayerCreate] = Field(min_length=1, max_length=10)


class TeamOut(BaseModel):
    id: uuid.UUID
    name: str
    players: list[PlayerOut]

    model_config = {"from_attributes": True}


# --- Match ---
class MatchOut(BaseModel):
    id: uuid.UUID
    match_number: int
    is_locked: bool
    results: list[MatchResultOut] = []

    model_config = {"from_attributes": True}


# --- Match Result ---
class MatchResultCreate(BaseModel):
    team_id: uuid.UUID
    placement: int | None = None
    kills: int | None = None


class MatchResultOut(BaseModel):
    id: uuid.UUID
    team_id: uuid.UUID
    team_name: str | None = None
    placement: int | None
    kills: int
    placement_points: int
    score: int
    status: str
    warnings: list

    model_config = {"from_attributes": True}


class MatchResultBulk(BaseModel):
    results: list[MatchResultCreate]


# --- Leaderboard ---
class LeaderboardEntry(BaseModel):
    rank: int
    team_id: uuid.UUID
    team_name: str
    players: list[str] = []
    total_kills: int
    placement_points: int
    total_score: int
    matches_played: int
    has_disputed: bool = False


class LeaderboardOut(BaseModel):
    tournament_id: uuid.UUID
    tournament_name: str
    entries: list[LeaderboardEntry]


# --- Top Fraggers ---
class TopFraggerEntry(BaseModel):
    rank: int
    player_name: str
    gamertag: str | None
    team_name: str
    total_kills: int
    matches_played: int


# Forward ref resolution
MatchOut.model_rebuild()
