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
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const load = async () => {
    const [t, te, m] = await Promise.all([
      api.getTournament(tournamentId),
      api.getTeams(tournamentId),
      api.getMatches(tournamentId),
    ]);
    setTournament(t);
    setTeams(te);
    setMatches(m);
    if (!selectedMatch && m.length > 0) {
      const unlocked = m.find((x) => !x.is_locked);
      setSelectedMatch(unlocked || m[0]);
    } else if (selectedMatch) {
      const updated = m.find((x) => x.id === selectedMatch.id);
      if (updated) setSelectedMatch(updated);
    }
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
    { id: "settings", label: "Settings" },
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
            {editingName ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (nameInput.trim()) {
                    await api.updateTournament(tournamentId, {
                      name: nameInput.trim(),
                      game: tournament.game,
                      format: tournament.format,
                      prize_pool: tournament.prize_pool,
                      event_date: tournament.event_date,
                      contact: tournament.contact,
                    });
                    await load();
                  }
                  setEditingName(false);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  autoFocus
                  onBlur={() => setEditingName(false)}
                  className="font-display font-bold text-3xl text-white bg-gsite-bg border border-gsite-border rounded-lg px-3 py-1 focus:outline-none focus:border-gsite-cyan"
                />
              </form>
            ) : (
              <h1
                className="font-display font-bold text-3xl text-white cursor-pointer hover:text-gsite-cyan transition-colors group flex items-center gap-2"
                onClick={() => {
                  setNameInput(tournament.name);
                  setEditingName(true);
                }}
              >
                {tournament.name}
                <svg className="w-4 h-4 text-gsite-muted opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
              </h1>
            )}
            <p className="text-gsite-muted mt-1">
              {tournament.game} — {tournament.format} — {tournament.num_matches}{" "}
              Matches
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href={`/leaderboard/${tournamentId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gsite-cyan/10 border border-gsite-cyan/30 text-gsite-cyan font-display font-semibold rounded-xl hover:bg-gsite-cyan/20 transition-all"
            >
              Leaderboard →
            </a>
            <a
              href={`/top-fraggers/${tournamentId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gsite-gold/10 border border-gsite-gold/30 text-gsite-gold font-display font-semibold rounded-xl hover:bg-gsite-gold/20 transition-all"
            >
              Top Fraggers →
            </a>
          </div>
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

        {activeTab === "settings" && (
          <TournamentSettings tournament={tournament} tournamentId={tournamentId} onUpdate={load} />
        )}
      </div>
    </div>
  );
}

function TournamentSettings({ tournament, tournamentId, onUpdate }) {
  const [form, setForm] = useState({
    name: tournament.name || "",
    game: tournament.game || "Call of Duty",
    format: tournament.format || "Trios Custom",
    prize_pool: tournament.prize_pool || "",
    event_date: tournament.event_date || "",
    contact: tournament.contact || "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await api.updateTournament(tournamentId, {
      ...form,
      prize_pool: form.prize_pool || null,
      event_date: form.event_date || null,
      contact: form.contact || null,
    });
    await onUpdate();
    setSaving(false);
    setSaved(true);
  };

  const fields = [
    { key: "name", label: "Tournament Name", placeholder: "e.g. G-SITE Warzone Showdown" },
    { key: "game", label: "Game", placeholder: "e.g. Call of Duty" },
    { key: "format", label: "Format", placeholder: "e.g. Trios Custom" },
    { key: "prize_pool", label: "Prize Pool", placeholder: "e.g. $500 USD" },
    { key: "event_date", label: "Date / Time", placeholder: "e.g. April 5, 2026 — 7:00 PM EST" },
    { key: "contact", label: "Contact / Registration", placeholder: "e.g. Discord: discord.gg/gsite or @GSITEGG on X" },
  ];

  return (
    <div className="max-w-2xl">
      <div className="bg-gsite-card border border-gsite-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gsite-border">
          <h3 className="font-display font-bold text-lg text-white">
            Tournament Settings
          </h3>
          <p className="text-gsite-muted text-sm mt-0.5">
            Configure tournament details shown on the flyer and display views.
          </p>
        </div>

        <div className="p-6 space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="text-gsite-muted text-xs uppercase tracking-wider block mb-2">
                {f.label}
              </label>
              <input
                type="text"
                value={form[f.key]}
                onChange={(e) => handleChange(f.key, e.target.value)}
                placeholder={f.placeholder}
                className="w-full bg-gsite-bg border border-gsite-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gsite-cyan transition-colors"
              />
            </div>
          ))}

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-gsite-accent hover:bg-gsite-accentHover text-white font-display font-bold rounded-xl transition-all disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
            <a
              href={`/flyer/${tournamentId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-gsite-cyan/10 border border-gsite-cyan/30 text-gsite-cyan font-display font-semibold rounded-xl hover:bg-gsite-cyan/20 transition-all"
            >
              View Flyer →
            </a>
            {saved && (
              <span className="text-green-400 text-sm">Settings saved</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
