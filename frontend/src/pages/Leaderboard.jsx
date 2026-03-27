import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { api, connectWS } from "../api/client";

export default function Leaderboard() {
  const { tournamentId } = useParams();
  const [leaderboard, setLeaderboard] = useState(null);
  const [matches, setMatches] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const wsRef = useRef(null);

  const load = async () => {
    const [lb, m] = await Promise.all([
      api.getLeaderboard(tournamentId),
      api.getMatches(tournamentId),
    ]);
    setLeaderboard(lb);
    setMatches(m);
    setLastUpdate(new Date());
  };

  useEffect(() => {
    load();

    wsRef.current = connectWS(tournamentId, (msg) => {
      if (msg.type === "leaderboard_update") {
        setLeaderboard((prev) => ({
          ...prev,
          entries: msg.leaderboard,
        }));
        setLastUpdate(new Date());
      }
    });

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [tournamentId]);

  if (!leaderboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gsite-muted">Loading leaderboard...</div>
      </div>
    );
  }

  const entries = leaderboard.entries || [];
  const mid = Math.ceil(entries.length / 2);
  const leftCol = entries.slice(0, mid);
  const rightCol = entries.slice(mid);

  // Count how many matches have results
  const completedMatches = matches.filter((m) => m.results?.length > 0).length;

  const rankColors = {
    1: { text: "text-gsite-accent", border: "border-gsite-accent/50", bg: "bg-gsite-accent/5" },
  };

  const renderRow = (entry) => {
    const style = rankColors[entry.rank] || {
      text: "text-gsite-muted",
      border: "border-gsite-border",
      bg: "",
    };
    const isFirst = entry.rank === 1;

    return (
      <div
        key={entry.team_id}
        className={`flex items-center justify-between px-5 py-3 rounded-xl border transition-all ${
          style.border
        } ${style.bg} ${isFirst ? "glow-red" : "hover:bg-white/[0.02]"} ${
          entry.has_disputed ? "disputed" : ""
        }`}
      >
        <div className="flex items-center gap-4 min-w-0">
          {/* Rank */}
          <span
            className={`font-display font-bold text-2xl w-8 text-center shrink-0 ${style.text}`}
          >
            {entry.rank}
          </span>

          {/* Team info */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`font-display font-bold uppercase tracking-wide truncate ${
                  isFirst ? "text-white text-lg" : "text-gsite-text"
                }`}
              >
                {entry.team_name}
              </span>
              {entry.has_disputed && (
                <span className="px-2 py-0.5 bg-gsite-accent/10 border border-gsite-accent/30 text-gsite-accent text-[9px] uppercase tracking-wider rounded-full shrink-0">
                  Disputed
                </span>
              )}
            </div>
            {entry.players?.length > 0 && (
              <div className="text-gsite-muted/70 text-xs mt-0.5">
                {entry.players.join(" · ")}
              </div>
            )}
            <div className="text-gsite-muted text-xs mt-0.5">
              {entry.total_kills} kills — {entry.placement_points} plc pts —{" "}
              {entry.matches_played} played
            </div>
          </div>
        </div>

        {/* Score */}
        <span
          className={`font-display font-bold text-2xl shrink-0 ml-4 ${
            isFirst ? "shimmer-gold" : "text-white"
          }`}
        >
          {entry.total_score}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-gsite-accent via-gsite-cyan to-gsite-accent" />

      {/* Header */}
      <div className="text-center pt-10 pb-8 px-6 relative">
        <h1 className="font-display font-bold text-5xl md:text-6xl text-white tracking-wider">
          STANDINGS
        </h1>
        <p className="text-gsite-muted text-lg mt-2">
          {leaderboard.tournament_name}
        </p>

        {/* Badge */}
        <div className="flex items-center justify-center gap-4 mt-4">
          {completedMatches > 0 && (
            <span className="px-4 py-1.5 bg-gsite-accent/10 border border-gsite-accent/30 text-gsite-accent text-sm font-display font-semibold rounded-full">
              After Match {completedMatches}
            </span>
          )}
          <span className="px-4 py-1.5 bg-gsite-cyan/10 border border-gsite-cyan/30 text-gsite-cyan text-sm font-display font-semibold rounded-full">
            {entries.length} Teams
          </span>
          <div className="flex items-center gap-2 text-gsite-cyan text-sm">
            <span className="w-2 h-2 bg-gsite-cyan rounded-full pulse-live" />
            Live
          </div>
        </div>

        {lastUpdate && (
          <div className="text-gsite-muted/50 text-xs mt-3">
            Updated {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Two-column standings */}
      <div className="flex-1 px-6 pb-10 max-w-7xl mx-auto w-full">
        {entries.length === 0 ? (
          <div className="text-center text-gsite-muted text-lg py-20">
            No results yet. Submit match results to see standings.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left column */}
            <div>
              <div className="flex items-center justify-between px-5 mb-3 text-gsite-muted text-xs uppercase tracking-wider font-medium">
                <span>Team</span>
                <span>Points</span>
              </div>
              <div className="space-y-2">{leftCol.map(renderRow)}</div>
            </div>

            {/* Right column */}
            <div>
              <div className="flex items-center justify-between px-5 mb-3 text-gsite-muted text-xs uppercase tracking-wider font-medium">
                <span>Team</span>
                <span>Points</span>
              </div>
              <div className="space-y-2">{rightCol.map(renderRow)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="h-1 bg-gradient-to-r from-gsite-accent via-gsite-cyan to-gsite-accent" />
    </div>
  );
}
