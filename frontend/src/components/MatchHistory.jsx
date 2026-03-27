import { useState } from "react";
import { api } from "../api/client";

export default function MatchHistory({ matches, onUpdate }) {
  const [selectedMatch, setSelectedMatch] = useState(
    matches?.length > 0 ? matches[0] : null
  );

  const handleDispute = async (resultId) => {
    await api.toggleDispute(resultId);
    onUpdate();
  };

  if (!matches || matches.length === 0) {
    return (
      <div className="bg-gsite-card border border-gsite-border rounded-2xl p-12 text-center">
        <p className="text-gsite-muted">No matches available.</p>
      </div>
    );
  }

  // Keep selectedMatch in sync with fresh data
  const match = matches.find((m) => m.id === selectedMatch?.id) || matches[0];

  return (
    <div>
      {/* Match tabs */}
      <div className="flex gap-3 mb-6">
        {matches.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMatch(m)}
            className={`relative px-5 py-3 rounded-xl border font-display font-semibold transition-all ${
              match.id === m.id
                ? "bg-gsite-accent/10 border-gsite-accent text-gsite-accent"
                : "bg-gsite-card border-gsite-border text-gsite-muted hover:text-white"
            }`}
          >
            Match {m.match_number}
            {m.is_locked && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-gsite-gold rounded-full flex items-center justify-center text-[10px]">
                🔒
              </span>
            )}
            {m.results?.length > 0 && !m.is_locked && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Selected match results */}
      <div className="bg-gsite-card border border-gsite-border rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gsite-border bg-gsite-bg/30">
          <div className="flex items-center gap-3">
            <h3 className="font-display font-bold text-white">
              Match {match.match_number}
            </h3>
            {match.is_locked && (
              <span className="px-2 py-0.5 bg-gsite-gold/10 border border-gsite-gold/30 text-gsite-gold text-[10px] uppercase tracking-wider rounded-full">
                Locked
              </span>
            )}
          </div>
          <span className="text-gsite-muted text-sm">
            {match.results?.length || 0} results
          </span>
        </div>

        {/* Results table */}
        {match.results?.length > 0 ? (
          <div>
            <div className="grid grid-cols-[1fr_80px_80px_100px_80px] gap-4 px-6 py-3 text-gsite-muted text-xs uppercase tracking-wider border-b border-gsite-border/50">
              <span>Team</span>
              <span className="text-center">Place</span>
              <span className="text-center">Kills</span>
              <span className="text-center">Plc. Pts</span>
              <span className="text-center">Score</span>
            </div>
            <div className="divide-y divide-gsite-border/30">
              {[...match.results]
                .sort((a, b) => (a.placement || 99) - (b.placement || 99))
                .map((r) => (
                  <div
                    key={r.id}
                    className={`grid grid-cols-[1fr_80px_80px_100px_80px] gap-4 px-6 py-3 items-center ${
                      r.status === "disputed" ? "disputed" : ""
                    }`}
                  >
                    <span className="font-medium text-white">
                      {r.team_name || "Unknown"}
                    </span>
                    <span className="text-center font-mono text-gsite-text">
                      {r.placement ?? "—"}
                    </span>
                    <span className="text-center font-mono text-gsite-text">
                      {r.kills}
                    </span>
                    <span className="text-center font-mono text-gsite-cyan">
                      {r.placement_points}
                    </span>
                    <span className="text-center font-display font-bold text-white">
                      {r.score}
                    </span>
                  </div>
                ))}
            </div>

            {/* Warnings */}
            {match.results.some((r) => r.warnings?.length > 0) && (
              <div className="px-6 py-3 border-t border-gsite-border/50 bg-gsite-gold/5">
                <div className="text-gsite-gold text-xs font-medium mb-1">
                  Data Warnings:
                </div>
                {match.results
                  .filter((r) => r.warnings?.length > 0)
                  .flatMap((r) =>
                    r.warnings.map((w, i) => (
                      <div
                        key={`${r.id}-${i}`}
                        className="text-gsite-gold/70 text-xs"
                      >
                        • {r.team_name}: {w}
                      </div>
                    ))
                  )}
              </div>
            )}
          </div>
        ) : (
          <div className="px-6 py-8 text-center text-gsite-muted text-sm">
            No results reported yet
          </div>
        )}
      </div>
    </div>
  );
}
