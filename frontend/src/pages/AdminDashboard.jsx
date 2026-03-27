import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";
import MatchReportForm from "../components/MatchReportForm";
import MatchHistory from "../components/MatchHistory";
import TeamRegistration from "../components/TeamRegistration";

export default function AdminDashboard() {
  const { tournamentId } = useParams();
  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [activeTab, setActiveTab] = useState("results");
  const [selectedMatch, setSelectedMatch] = useState(null);

  const load = async () => {
    const [t, te, m] = await Promise.all([
      api.getTournament(tournamentId),
      api.getTeams(tournamentId),
      api.getMatches(tournamentId),
    ]);
    setTournament(t);
    setTeams(te);
    setMatches(m);
    if (!selectedMatch && m.length > 0) setSelectedMatch(m[0]);
  };

  useEffect(() => {
    load();
  }, [tournamentId]);

  if (!tournament) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-gsite-muted">Loading tournament...</div>
      </div>
    );
  }

  const tabs = [
    { id: "results", label: "Report Results" },
    { id: "teams", label: "Teams" },
    { id: "history", label: "Match History" },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-gsite-muted text-sm uppercase tracking-wider mb-1">
              Admin Panel
            </div>
            <h1 className="font-display font-bold text-3xl text-white">
              {tournament.name}
            </h1>
            <p className="text-gsite-muted mt-1">
              {tournament.game} — {tournament.format} — {tournament.num_matches}{" "}
              Matches
            </p>
          </div>
          <Link
            to={`/leaderboard/${tournamentId}`}
            className="px-6 py-3 bg-gsite-cyan/10 border border-gsite-cyan/30 text-gsite-cyan font-display font-semibold rounded-xl hover:bg-gsite-cyan/20 transition-all"
          >
            View Leaderboard →
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-gsite-card rounded-xl p-1 border border-gsite-border w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-gsite-accent text-white"
                  : "text-gsite-muted hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "results" && (
          <div>
            {/* Match selector */}
            <div className="flex gap-3 mb-6">
              {matches.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMatch(m)}
                  className={`relative px-5 py-3 rounded-xl border font-display font-semibold transition-all ${
                    selectedMatch?.id === m.id
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

            {selectedMatch && (
              <MatchReportForm
                match={selectedMatch}
                teams={teams}
                onSubmit={load}
              />
            )}
          </div>
        )}

        {activeTab === "teams" && (
          <TeamRegistration
            tournamentId={tournamentId}
            teams={teams}
            onUpdate={load}
          />
        )}

        {activeTab === "history" && (
          <MatchHistory matches={matches} onUpdate={load} />
        )}
      </div>
    </div>
  );
}
