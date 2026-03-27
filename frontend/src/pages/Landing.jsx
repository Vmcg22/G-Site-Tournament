import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";

export default function Landing() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSeedAndGo = async () => {
    setLoading(true);
    try {
      const res = await api.seed();
      navigate(`/admin/${res.tournament_id}`);
    } catch (err) {
      const list = await api.getTournaments();
      if (list.length > 0) {
        navigate(`/admin/${list[0].id}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(244,63,94,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(244,63,94,0.5) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gsite-accent/10 rounded-full blur-[150px]" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gsite-accent/30 bg-gsite-accent/5 mb-8">
            <span className="w-2 h-2 bg-gsite-accent rounded-full pulse-live" />
            <span className="text-gsite-accent text-sm font-medium tracking-wide uppercase">
              Season 1 — Now Live
            </span>
          </div>

          {/* Title */}
          <h1 className="font-display font-bold text-5xl md:text-7xl text-white leading-tight mb-6">
            G-SITE
            <br />
            <span className="text-gsite-accent">WARZONE</span> SHOWDOWN
          </h1>

          <p className="text-gsite-muted text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Compete in a 3-match Call of Duty custom tournament. Trios format.
            Real-time leaderboard. Prove your squad is the best.
          </p>

          {/* Info Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-12">
            {[
              { label: "Game", value: "Call of Duty" },
              { label: "Format", value: "Trios Custom" },
              { label: "Date", value: "April 5, 2026" },
              { label: "Prize Pool", value: "$500 USD" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-gsite-card/60 backdrop-blur-sm border border-gsite-border rounded-xl p-4"
              >
                <div className="text-gsite-muted text-xs uppercase tracking-wider mb-1">
                  {item.label}
                </div>
                <div className="text-white font-display font-semibold text-lg">
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleSeedAndGo}
              disabled={loading}
              className="px-8 py-4 bg-gsite-accent hover:bg-gsite-accentHover text-white font-display font-bold text-lg rounded-xl transition-all glow-red disabled:opacity-50"
            >
              {loading ? "Setting up..." : "Register Now"}
            </button>
            <button
              onClick={() => navigate("/tournaments")}
              className="px-8 py-4 border border-gsite-border hover:border-gsite-cyan text-gsite-text hover:text-gsite-cyan font-display font-semibold text-lg rounded-xl transition-all"
            >
              View Tournaments
            </button>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="relative py-20 px-6 border-t border-gsite-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-bold text-3xl text-white text-center mb-12">
            How It <span className="text-gsite-accent">Works</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Register Your Squad",
                desc: "Form a trio and register your team with 3 players. Lock in your gamertags.",
              },
              {
                step: "02",
                title: "Play 3 Matches",
                desc: "Compete across 3 custom lobby matches. Kills and placement both count.",
              },
              {
                step: "03",
                title: "Climb the Board",
                desc: "Watch the real-time leaderboard update as results come in. Top score wins.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-gsite-card/40 border border-gsite-border rounded-2xl p-6 hover:border-gsite-accent/40 transition-colors group"
              >
                <span className="font-display font-bold text-4xl text-gsite-accent/20 group-hover:text-gsite-accent/40 transition-colors">
                  {item.step}
                </span>
                <h3 className="font-display font-semibold text-xl text-white mt-3 mb-2">
                  {item.title}
                </h3>
                <p className="text-gsite-muted text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scoring Breakdown */}
      <section className="relative py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display font-bold text-3xl text-white text-center mb-12">
            Scoring <span className="text-gsite-cyan">System</span>
          </h2>
          <div className="bg-gsite-card border border-gsite-border rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gsite-border">
              <p className="text-gsite-text text-center">
                <span className="text-gsite-cyan font-display font-bold text-lg">
                  Score
                </span>{" "}
                = Kills + Placement Points
              </p>
            </div>
            <div className="divide-y divide-gsite-border">
              {[
                { place: "1st", pts: 10, color: "text-gsite-gold" },
                { place: "2nd", pts: 7, color: "text-gray-300" },
                { place: "3rd", pts: 5, color: "text-amber-600" },
                { place: "4th", pts: 3, color: "text-gsite-text" },
                { place: "5th+", pts: 1, color: "text-gsite-muted" },
              ].map((r) => (
                <div
                  key={r.place}
                  className="flex items-center justify-between px-6 py-3"
                >
                  <span className={`font-display font-semibold ${r.color}`}>
                    {r.place}
                  </span>
                  <span className="text-white font-mono">
                    +{r.pts} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gsite-border py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-gsite-muted text-sm">
          <span>G-SITE Tournament Platform</span>
          <span>Built for competition.</span>
        </div>
      </footer>
    </div>
  );
}
