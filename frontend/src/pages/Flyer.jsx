import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api/client";

export default function Flyer() {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    Promise.all([
      api.getTournament(tournamentId),
      api.getTeams(tournamentId),
    ]).then(([t, te]) => {
      setTournament(t);
      setTeams(te);
    });
  }, [tournamentId]);

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gsite-muted">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-2xl relative">
        {/* Flyer Card */}
        <div className="relative bg-gsite-card border border-gsite-border rounded-3xl overflow-hidden">
          {/* Top gradient bar */}
          <div className="h-2 bg-gradient-to-r from-gsite-accent via-gsite-cyan to-gsite-accent" />

          {/* Decorative grid background */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(244,63,94,0.5) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(244,63,94,0.5) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />

          {/* Radial glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gsite-accent/8 rounded-full blur-[120px]" />

          <div className="relative p-10">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gsite-accent/30 bg-gsite-accent/5 mb-6">
                <span className="w-2 h-2 bg-gsite-accent rounded-full" />
                <span className="text-gsite-accent text-xs font-semibold tracking-widest uppercase">
                  Tournament
                </span>
              </div>

              <h1 className="font-display font-bold text-5xl text-white leading-tight mb-3">
                {tournament.name}
              </h1>

              <p className="text-gsite-muted text-lg">
                Compete. Dominate. Win.
              </p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-gsite-bg/60 border border-gsite-border/50 rounded-2xl p-5 text-center">
                <div className="text-gsite-muted text-xs uppercase tracking-widest mb-2">
                  Game
                </div>
                <div className="text-white font-display font-bold text-xl">
                  {tournament.game}
                </div>
              </div>
              <div className="bg-gsite-bg/60 border border-gsite-border/50 rounded-2xl p-5 text-center">
                <div className="text-gsite-muted text-xs uppercase tracking-widest mb-2">
                  Format
                </div>
                <div className="text-white font-display font-bold text-xl">
                  {tournament.format}
                </div>
              </div>
              <div className="bg-gsite-bg/60 border border-gsite-border/50 rounded-2xl p-5 text-center">
                <div className="text-gsite-muted text-xs uppercase tracking-widest mb-2">
                  Date
                </div>
                <div className="text-white font-display font-bold text-xl">
                  {tournament.event_date || "TBA"}
                </div>
              </div>
              <div className="bg-gsite-bg/60 border border-gsite-border/50 rounded-2xl p-5 text-center">
                <div className="text-gsite-muted text-xs uppercase tracking-widest mb-2">
                  Prize Pool
                </div>
                <div className="text-gsite-accent font-display font-bold text-xl">
                  {tournament.prize_pool || "TBA"}
                </div>
              </div>
            </div>

            {/* Matches + Teams */}
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-display font-bold text-white">
                  {tournament.num_matches}
                </div>
                <div className="text-gsite-muted text-xs uppercase tracking-wider">
                  Matches
                </div>
              </div>
              <div className="w-px h-10 bg-gsite-border" />
              <div className="text-center">
                <div className="text-3xl font-display font-bold text-white">
                  {teams.length}
                </div>
                <div className="text-gsite-muted text-xs uppercase tracking-wider">
                  Teams
                </div>
              </div>
              <div className="w-px h-10 bg-gsite-border" />
              <div className="text-center">
                <div className="text-3xl font-display font-bold text-white">
                  {teams.length * 3}
                </div>
                <div className="text-gsite-muted text-xs uppercase tracking-wider">
                  Players
                </div>
              </div>
            </div>

            {/* Contact / CTA */}
            <div className="text-center">
              {tournament.contact ? (
                <div className="mb-6">
                  <div className="text-gsite-muted text-xs uppercase tracking-widest mb-2">
                    Register via
                  </div>
                  <div className="text-gsite-cyan font-semibold text-lg">
                    {tournament.contact}
                  </div>
                </div>
              ) : null}

              <div className="inline-block px-10 py-4 bg-gsite-accent text-white font-display font-bold text-lg rounded-2xl glow-red">
                Register Now
              </div>
            </div>
          </div>

          {/* Bottom gradient bar */}
          <div className="h-2 bg-gradient-to-r from-gsite-accent via-gsite-cyan to-gsite-accent" />
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-gsite-muted/40 text-xs uppercase tracking-widest">
          G-SITE Tournament Platform
        </div>
      </div>
    </div>
  );
}
