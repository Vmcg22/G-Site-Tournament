# G-SITE Tournament Operations Module

A lightweight tournament operations system for a Call of Duty custom tournament with real-time leaderboard updates.

**Stack:** FastAPI (Python) · React 18 · PostgreSQL 16 · WebSockets · Docker

## Quick Start

```bash
docker compose up --build
```

- **Frontend:** http://localhost:5175
- **Backend API:** http://localhost:8002
- **API Docs:** http://localhost:8002/docs

Click "Register Now" on the landing page to seed demo data (6 teams, 3 matches), or use the API directly.

---

## 1. Data Structure

```
tournaments
  ├── id (UUID PK)
  ├── name, game, format, num_matches, status
  │
  ├── teams (1:N)
  │     ├── id (UUID PK), name
  │     └── players (1:N)
  │           └── id, name, gamertag
  │
  └── matches (1:N)
        ├── id (UUID PK), match_number, is_locked
        └── match_results (1:N)
              ├── team_id (FK)
              ├── placement, kills
              ├── placement_points, score (computed)
              ├── status: 'confirmed' | 'disputed'
              └── warnings (JSONB array)
```

**Why this structure:**
- **UUIDs** over auto-increment: safer for exposed IDs, no enumeration attacks
- **Flat results**: each `match_result` row = one team's result in one match. Simple to aggregate for leaderboard
- **`warnings` as JSONB**: flexible storage for data quality issues without separate tables
- **`is_locked` on match**: single boolean, enforced at API level — prevents edits after finalization
- **`status` on result**: per-result dispute flagging, independent of other results in the same match

---

## 2. What I Prioritized and Why

### Built (in priority order):
1. **Scoring system** — Core business logic. Exact spec: `Score = Kills + Placement Points` with the defined point table (10/7/5/3/1)
2. **Imperfect data handling** — This is what the challenge really tests. Strategy:
   - *Missing kills*: default to 0, add warning. Better to have partial data than crash
   - *Missing teams*: accept partial results, inform admin how many teams are missing
   - *Duplicate placements*: accept with warning, both teams get the same points. In real CoD lobbies, ties and disconnects happen
3. **Leaderboard with correct sorting** — total score → total kills → alphabetical
4. **Both integrity features** — Lock System AND Dispute Flag. They cost ~40 extra lines combined and complement each other: Lock prevents accidental edits, Dispute communicates problems
5. **Real-time WebSocket updates** — Leaderboard updates instantly when results are submitted. No polling
6. **Landing page (Part 2)** — Promotional section with tournament info, scoring breakdown, and CTA
7. **Match History** — Visual review of all match results with data warnings displayed

### Design decisions:
- **No authentication**: not required by the spec, and it would add complexity without demonstrating anything relevant to tournament operations
- **Seed endpoint**: one-click demo setup — respects the reviewer's time
- **Upsert on results**: submitting results for a team that already has results updates them (unless locked). Prevents duplicates, simplifies admin workflow

---

## 3. What I Intentionally Did NOT Build

| Feature | Why Not |
|---------|---------|
| User authentication | Not in spec. Would add JWT/session complexity without value for this task |
| Team deletion/editing | Out of scope. Registration is one-way for a single tournament |
| Bracket/elimination system | The format is "Trios Custom" (all teams play all matches), not an elimination bracket |
| Multi-tournament management | Spec asks for one tournament. The schema supports many, but UI focuses on one |
| Player-level kill tracking | Spec tracks kills per team, not per player. Schema has players for registration only |
| Deployment/CI-CD | "Local setup is fine" per the guidelines |
| Mobile-responsive design | Desktop-first for admin operations. Would prioritize this in a follow-up |

---

## 4. What Would Break First at Scale

1. **Leaderboard computation** — Currently computed on every request by iterating all teams and their results. With 100+ teams and thousands of matches, this becomes a bottleneck. **Fix:** materialized view or Redis cache, invalidated on result submission

2. **WebSocket connections** — Single-server in-memory connection manager. If we add a second server, broadcasts only reach clients on the same instance. **Fix:** Redis pub/sub as WebSocket message broker

3. **Database connection pool** — Async SQLAlchemy with default pool settings. Under high concurrent load during a live tournament (everyone watching the leaderboard), connections would exhaust. **Fix:** connection pooling with PgBouncer

4. **No rate limiting** — Admin endpoints have no throttling. A script could spam result submissions. **Fix:** rate limiting middleware or API gateway

---

## 5. What I Would Build Next

1. **Admin authentication** — Role-based access (admin vs viewer) with JWT
2. **Audit log** — Track who changed what and when (critical for tournament integrity)
3. **Match scheduling** — Start times, countdown timers, auto-lock after deadline
4. **Player-level stats** — Individual kill tracking with MVP awards
5. **Export** — CSV/PDF export of final standings for social media and records
6. **Notification system** — Discord webhook integration for result announcements
7. **Mobile responsive** — Full mobile support for on-the-go result entry

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/tournaments` | Create tournament |
| `GET` | `/api/tournaments` | List tournaments |
| `GET` | `/api/tournaments/:id` | Get tournament |
| `POST` | `/api/tournaments/:id/teams` | Register team with players |
| `GET` | `/api/tournaments/:id/teams` | List teams |
| `GET` | `/api/tournaments/:id/matches` | List matches with results |
| `POST` | `/api/matches/:id/results` | Submit/update results (bulk) |
| `PUT` | `/api/matches/:id/lock` | Toggle match lock |
| `PUT` | `/api/match-results/:id/dispute` | Toggle dispute flag |
| `GET` | `/api/tournaments/:id/leaderboard` | Get computed leaderboard |
| `WS` | `/ws/tournament/:id` | Real-time leaderboard updates |
| `POST` | `/api/seed` | Seed demo data |

---

## Imperfect Data Handling

The system accepts imperfect data gracefully instead of rejecting it:

| Scenario | Behavior | Rationale |
|----------|----------|-----------|
| Missing kills | Defaults to 0, adds warning | Partial data > no data |
| Missing placement | No placement points, adds warning | Team still gets kill credit |
| Duplicate placements | Both teams get same points, adds warning | Real lobbies have ties/disconnects |
| Missing teams in match | Accepts partial, notes how many missing | Don't block results for absent teams |

All warnings are stored in the `warnings` JSONB field and displayed in the Match History view.
# G-Site-Tournament
# G-Site-Tournament
# G-Site-Tournament
