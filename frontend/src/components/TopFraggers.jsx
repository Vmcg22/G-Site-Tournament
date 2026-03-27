import { useState, useEffect } from "react";
import { api } from "../api/client";

export default function TopFraggers({ tournamentId }) {
  const [fraggers, setFraggers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await api.getTopFraggers(tournamentId);
      setFraggers(data);
    } catch {
      setFraggers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [tournamentId]);

  // Expose reload for parent
  useEffect(() => {
    window.__reloadFraggers = load;
    return () => delete window.__reloadFraggers;
  }, [tournamentId]);

  if (loading) return null;

  if (fraggers.length === 0 || fraggers.every((f) => f.total_kills === 0)) {
    return null;
  }

  const medalColors = [
    "from-yellow-400 to-amber-600",
    "from-gray-300 to-gray-500",
    "from-amber-600 to-amber-800",
    "from-gsite-border to-gsite-muted",
    "from-gsite-border to-gsite-muted",
  ];

  const bgColors = [
    "bg-yellow-500/5 border-yellow-500/20",
    "bg-gray-400/5 border-gray-400/20",
    "bg-amber-600/5 border-amber-600/20",
    "bg-gsite-card border-gsite-border",
    "bg-gsite-card border-gsite-border",
  ];

  return (
    <div className="bg-gsite-card border border-gsite-border rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gsite-border flex items-center gap-3">
        <div className="w-8 h-8 bg-gsite-accent/10 rounded-lg flex items-center justify-center">
          <span className="text-gsite-accent text-sm font-bold">#</span>
        </div>
        <div>
          <h3 className="font-display font-bold text-white">Top Fraggers</h3>
          <p className="text-gsite-muted text-xs">
            Top 5 players by kills across all matches
          </p>
        </div>
      </div>

      <div className="p-4 space-y-2">
        {fraggers.map((player, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 rounded-xl border p-4 transition-all hover:scale-[1.01] ${bgColors[i]}`}
          >
            {/* Rank */}
            <div
              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${medalColors[i]} flex items-center justify-center font-display font-bold text-white text-lg shrink-0`}
            >
              {player.rank}
            </div>

            {/* Player Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`font-display font-semibold truncate ${
                    i === 0 ? "text-yellow-400 text-lg" : "text-white"
                  }`}
                >
                  {player.player_name}
                </span>
                {player.gamertag && player.gamertag !== player.player_name && (
                  <span className="text-gsite-muted text-xs">
                    ({player.gamertag})
                  </span>
                )}
              </div>
              <div className="text-gsite-muted text-xs mt-0.5">
                {player.team_name} — {player.matches_played} match
                {player.matches_played !== 1 ? "es" : ""}
              </div>
            </div>

            {/* Kills */}
            <div className="text-right shrink-0">
              <div
                className={`font-display font-bold text-xl ${
                  i === 0 ? "shimmer-gold" : "text-white"
                }`}
              >
                {player.total_kills}
              </div>
              <div className="text-gsite-muted text-[10px] uppercase tracking-wider">
                kills
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
