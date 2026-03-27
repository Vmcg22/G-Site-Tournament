import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { api, connectWS } from "../api/client";

const RANK_COLORS = [
  { main: "#f43f5e", light: "rgba(244,63,94,0.15)", text: "text-rose-400", border: "border-rose-500/50", glow: "shadow-[0_0_30px_rgba(244,63,94,0.3)]" },
  { main: "#06b6d4", light: "rgba(6,182,212,0.15)", text: "text-cyan-400", border: "border-cyan-500/50", glow: "" },
  { main: "#a78bfa", light: "rgba(167,139,250,0.15)", text: "text-violet-400", border: "border-violet-500/50", glow: "" },
  { main: "#fbbf24", light: "rgba(251,191,36,0.15)", text: "text-amber-400", border: "border-amber-500/50", glow: "" },
  { main: "#22c55e", light: "rgba(34,197,94,0.15)", text: "text-green-400", border: "border-green-500/50", glow: "" },
];

export default function TopFraggersPage() {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [fraggers, setFraggers] = useState([]);
  const [matches, setMatches] = useState([]);
  const wsRef = useRef(null);

  const load = async () => {
    const [t, f, m] = await Promise.all([
      api.getTournament(tournamentId),
      api.getTopFraggers(tournamentId),
      api.getMatches(tournamentId),
    ]);
    setTournament(t);
    setFraggers(f);
    setMatches(m);
  };

  useEffect(() => {
    load();

    wsRef.current = connectWS(tournamentId, (msg) => {
      if (msg.type === "leaderboard_update") {
        // Reload fraggers on any update
        api.getTopFraggers(tournamentId).then(setFraggers);
      }
    });

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [tournamentId]);

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gsite-muted">Loading...</div>
      </div>
    );
  }

  const completedMatches = matches.filter((m) => m.results?.length > 0).length;
  const hasKills = fraggers.some((f) => f.total_kills > 0);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-gsite-accent via-gsite-cyan to-gsite-accent" />

      {/* Header */}
      <div className="text-center pt-10 pb-8 px-6 relative">
        <h1 className="font-display font-bold text-5xl md:text-6xl text-white tracking-wider">
          TOP KILL LEADERS
        </h1>
        <p className="text-gsite-muted text-lg mt-2">{tournament.name}</p>

        {completedMatches > 0 && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <span className="px-4 py-1.5 bg-gsite-accent/10 border border-gsite-accent/30 text-gsite-accent text-sm font-display font-semibold rounded-full">
              After Match {completedMatches}
            </span>
            <div className="flex items-center gap-2 text-gsite-cyan text-sm">
              <span className="w-2 h-2 bg-gsite-cyan rounded-full pulse-live" />
              Live
            </div>
          </div>
        )}

      </div>

      {/* Cards Grid */}
      <div className="flex-1 px-6 pb-10 max-w-7xl mx-auto w-full">
        {!hasKills ? (
          <div className="text-center text-gsite-muted text-lg py-20">
            No kills reported yet. Submit match results to see top fraggers.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 min-h-[60vh]">
            {fraggers.map((player, i) => {
              const color = RANK_COLORS[i] || RANK_COLORS[4];
              const isFirst = i === 0;

              return (
                <div
                  key={i}
                  className={`relative flex flex-col rounded-2xl border overflow-hidden transition-all hover:scale-[1.02] ${
                    color.border
                  } ${isFirst ? color.glow : ""}`}
                  style={{ background: "#111827" }}
                >
                  {/* Avatar area */}
                  <div
                    className="flex-1 flex flex-col items-center justify-center p-6 relative"
                    style={{
                      background: `radial-gradient(circle at 50% 60%, ${color.light}, transparent 70%)`,
                    }}
                  >
                    {/* Rank badge */}
                    <div
                      className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-white text-sm border-2"
                      style={{
                        borderColor: color.main,
                        background: `${color.light}`,
                      }}
                    >
                      {player.rank}
                    </div>

                    {/* Player icon */}
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center font-display font-bold text-4xl text-white border-3 mb-4"
                      style={{
                        borderColor: color.main,
                        background: `linear-gradient(135deg, ${color.light}, rgba(17,24,39,0.8))`,
                        borderWidth: "3px",
                      }}
                    >
                      {player.player_name.charAt(0).toUpperCase()}
                    </div>

                    {/* Team name */}
                    <span className="text-gsite-muted text-xs uppercase tracking-wider">
                      {player.team_name}
                    </span>
                  </div>

                  {/* Name bar */}
                  <div
                    className={`px-4 py-3 text-center ${
                      isFirst ? "bg-gsite-accent" : "bg-gsite-bg/80"
                    }`}
                  >
                    <span
                      className={`font-display font-bold uppercase tracking-wide text-sm ${
                        isFirst ? "text-white" : color.text
                      }`}
                    >
                      {player.player_name}
                    </span>
                    {player.gamertag &&
                      player.gamertag !== player.player_name && (
                        <div className="text-gsite-muted text-[10px] mt-0.5">
                          {player.gamertag}
                        </div>
                      )}
                  </div>

                  {/* Kills bar */}
                  <div
                    className={`px-4 py-4 text-center ${
                      isFirst
                        ? "bg-gsite-accent/80"
                        : "bg-gsite-bg/60 border-t border-gsite-border/30"
                    }`}
                  >
                    <span
                      className={`font-display font-bold text-3xl ${
                        isFirst ? "text-white" : "text-white"
                      }`}
                    >
                      {player.total_kills}
                    </span>
                    <div
                      className={`text-[10px] uppercase tracking-widest mt-0.5 ${
                        isFirst ? "text-white/70" : "text-gsite-muted"
                      }`}
                    >
                      kills
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="h-1 bg-gradient-to-r from-gsite-accent via-gsite-cyan to-gsite-accent" />
    </div>
  );
}
