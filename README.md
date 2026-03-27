# G-SITE Tournament

A tournament management system built for Call of Duty custom lobbies. Create tournaments, register teams, report match results, and watch the leaderboard update in real time.

**Built with:** FastAPI, React, PostgreSQL, WebSockets, Docker

## Live Demo

http://31.220.20.173:5175

## How to Run Locally

```bash
docker compose up --build
```

Then open http://localhost:5175 and click "Create Your Tournament" to get started with demo data (6 teams, 3 matches ready to go).

---

## 1. How the Data is Organized

The system has 5 main pieces:

- **Tournaments** — Each tournament has a name, game, format, number of matches, prize pool, date, and contact info
- **Teams** — Each team belongs to a tournament and has 3 players
- **Players** — Each player has a name and gamertag
- **Matches** — Each tournament has a set number of matches (default 3). Matches can be locked so results can't be changed
- **Match Results** — Each result ties a team to a match with their placement, kills, and calculated score. If something looks off, results include warnings about the data

Everything cascades — if you delete a tournament, all its teams, matches, and results go with it.

---

## 2. What I Prioritized and Why

I focused on what matters most for actually running a tournament:

1. **Scoring that works exactly as specified** — Score = Kills + Placement Points (1st: 10, 2nd: 7, 3rd: 5, 4th: 3, 5th+: 1)

2. **Handling messy data** — In real tournaments, data is never perfect. Teams disconnect, kills get missed, placements get reported wrong. Instead of crashing or rejecting everything, the system:
   - Accepts missing kills (defaults to 0, shows a warning)
   - Accepts partial results when not all teams report
   - Blocks duplicate placements on the frontend so admins catch mistakes before submitting

3. **Real-time leaderboard** — When an admin submits results, everyone watching the leaderboard sees it update instantly through WebSockets. No need to refresh.

4. **Both integrity features** — I built the Lock System AND the Dispute Flag since they solve different problems. Lock prevents accidental edits on finalized matches. Dispute lets admins flag questionable results.

5. **Landing page / Flyer** — A promotional view with tournament name, game, format, date, prize pool, and a Register CTA. Configurable from the admin settings.

6. **Match History** — A clean view to review what happened in each match, organized by tabs.

**Other decisions:**
- No authentication — it wasn't in the spec and would have added complexity without adding value for this task
- One-click demo setup — creates a tournament with 6 teams instantly so reviewers don't have to set up data manually

---

## 3. What I Chose NOT to Build

| Feature | Reasoning |
|---------|-----------|
| User login / auth | Not in the spec — would add complexity without value here |
| Bracket / elimination system | The format is Trios Custom (all teams play all matches), not elimination |
| Individual player kill tracking | Kills are tracked per team as specified. Player-level tracking would be a next step |
| Team editing / deletion | Kept registration simple and one-way for this scope |
| Mobile responsive design | Focused on desktop for admin operations first |

---

## 4. What Would Break First at Scale

1. **Leaderboard calculation** — Right now it recalculates everything on each request. With hundreds of teams and thousands of matches, this would slow down. Solution: cache the results and only recalculate when new data comes in.

2. **Real-time connections** — The WebSocket system works great on one server, but if you add a second server, updates only reach people connected to the same one. Solution: use a message broker like Redis to sync between servers.

3. **Database connections** — Under heavy load during a live tournament (everyone watching the leaderboard at once), the database connections could run out. Solution: add connection pooling.

4. **No rate limiting** — Nothing stops someone from spamming the API with fake results. Solution: add rate limiting on admin endpoints.

---

## 5. What I Would Build Next

1. **Admin login** — So only authorized people can submit results and manage tournaments
2. **Audit log** — Track who changed what and when (important for tournament integrity)
3. **Player-level stats** — Track kills per player instead of per team, with MVP awards
4. **Match scheduling** — Set start times, countdown timers, auto-lock after a deadline
5. **Discord integration** — Send result announcements and leaderboard updates to a Discord channel
6. **Export standings** — Download final results as PDF/CSV for social media and records
7. **Mobile support** — So admins can enter results from their phone during a live event

---

## How Imperfect Data is Handled

Real tournaments have messy data. The system handles it gracefully:

| What happens | What the system does | Why |
|---|---|---|
| Kills are missing | Defaults to 0 and shows a warning | Better to have partial data than lose the whole result |
| Placement is missing | No placement points given, warning shown | Team still gets credit for their kills |
| Two teams have same placement | Blocked on the frontend | Prevents mistakes before they reach the database |
| Not all teams reported | Accepts what's there, tells you how many are missing | Don't hold up results because one team didn't show |

Warnings are saved and visible in the Match History tab so nothing gets lost.
