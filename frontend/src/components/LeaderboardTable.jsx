export default function LeaderboardTable({ entries }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="bg-gsite-card border border-gsite-border rounded-2xl p-12 text-center">
        <p className="text-gsite-muted text-lg">
          No results yet. Submit match results to see the leaderboard.
        </p>
      </div>
    );
  }

  const getRankStyle = (rank) => {
    if (rank === 1)
      return "bg-gsite-gold/10 text-gsite-gold border-gsite-gold/30 glow-gold";
    if (rank === 2) return "bg-gray-400/10 text-gray-300 border-gray-500/30";
    if (rank === 3)
      return "bg-amber-700/10 text-amber-500 border-amber-700/30";
    return "bg-gsite-card text-gsite-muted border-gsite-border";
  };

  return (
    <div className="bg-gsite-card border border-gsite-border rounded-2xl overflow-hidden scanlines relative">
      {/* Table Header */}
      <div className="grid grid-cols-[60px_1fr_100px_120px_100px_100px] gap-4 px-6 py-4 border-b border-gsite-border bg-gsite-bg/50 text-gsite-muted text-xs uppercase tracking-wider font-medium">
        <span>Rank</span>
        <span>Team</span>
        <span className="text-right">Kills</span>
        <span className="text-right">Placement Pts</span>
        <span className="text-right">Score</span>
        <span className="text-right">Played</span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gsite-border/50">
        {entries.map((entry) => (
          <div
            key={entry.team_id}
            className={`grid grid-cols-[60px_1fr_100px_120px_100px_100px] gap-4 px-6 py-4 table-row-hover ${
              entry.has_disputed ? "disputed" : ""
            }`}
          >
            {/* Rank */}
            <div className="flex items-center">
              <span
                className={`w-9 h-9 rounded-lg border flex items-center justify-center font-display font-bold text-sm ${getRankStyle(
                  entry.rank
                )}`}
              >
                {entry.rank}
              </span>
            </div>

            {/* Team Name */}
            <div className="flex items-center gap-3">
              <span
                className={`font-display font-semibold ${
                  entry.rank <= 3 ? "text-white text-lg" : "text-gsite-text"
                }`}
              >
                {entry.team_name}
              </span>
              {entry.has_disputed && (
                <span className="px-2 py-0.5 bg-gsite-accent/10 border border-gsite-accent/30 text-gsite-accent text-[10px] uppercase tracking-wider rounded-full">
                  Disputed
                </span>
              )}
            </div>

            {/* Kills */}
            <div className="flex items-center justify-end">
              <span className="font-mono text-gsite-text">
                {entry.total_kills}
              </span>
            </div>

            {/* Placement Points */}
            <div className="flex items-center justify-end">
              <span className="font-mono text-gsite-cyan">
                {entry.placement_points}
              </span>
            </div>

            {/* Total Score */}
            <div className="flex items-center justify-end">
              <span
                className={`font-display font-bold text-lg ${
                  entry.rank === 1 ? "shimmer-gold" : "text-white"
                }`}
              >
                {entry.total_score}
              </span>
            </div>

            {/* Matches Played */}
            <div className="flex items-center justify-end">
              <span className="font-mono text-gsite-muted">
                {entry.matches_played}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
