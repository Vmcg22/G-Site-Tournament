import { useState, useEffect } from "react";
import { api } from "../api/client";

function AddTeamModal({ open, onClose, onSubmit }) {
  const [teamName, setTeamName] = useState("");
  const [players, setPlayers] = useState(["", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  // Reset form when opening
  useEffect(() => {
    if (open) {
      setTeamName("");
      setPlayers(["", "", ""]);
      setError(null);
    }
  }, [open]);

  const handlePlayerChange = (index, value) => {
    setPlayers((prev) => prev.map((p, i) => (i === index ? value : p)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamName.trim() || players.some((p) => !p.trim())) {
      setError("Please fill in the team name and all 3 player names");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: teamName,
        players: players.map((name) => ({ name, gamertag: name })),
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-gsite-card border border-gsite-border rounded-2xl overflow-hidden shadow-2xl animate-[modalIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-gsite-cyan via-gsite-accent to-gsite-cyan" />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-xl text-white">
              Register New Team
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gsite-bg border border-gsite-border flex items-center justify-center text-gsite-muted hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Team Name */}
            <div>
              <label className="text-gsite-muted text-xs uppercase tracking-wider block mb-2">
                Team Name
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
                autoFocus
                className="w-full bg-gsite-bg border border-gsite-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gsite-cyan transition-colors"
              />
            </div>

            {/* Players */}
            <div>
              <label className="text-gsite-muted text-xs uppercase tracking-wider block mb-2">
                Players
              </label>
              <div className="space-y-2">
                {players.map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-gsite-bg border border-gsite-border flex items-center justify-center text-gsite-muted text-xs font-display font-bold shrink-0">
                      {i + 1}
                    </span>
                    <input
                      type="text"
                      value={p}
                      onChange={(e) => handlePlayerChange(i, e.target.value)}
                      placeholder={`Player ${i + 1} gamertag`}
                      className="flex-1 bg-gsite-bg border border-gsite-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gsite-cyan transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 border border-gsite-border text-gsite-text hover:text-white hover:border-gsite-muted font-display font-semibold rounded-xl transition-all text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-gsite-accent hover:bg-gsite-accentHover text-white font-display font-bold rounded-xl transition-all text-sm disabled:opacity-50 shadow-[0_0_20px_rgba(244,63,94,0.2)]"
              >
                {submitting ? "Registering..." : "Register Team"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function TeamRegistration({ tournamentId, teams, onUpdate }) {
  const [showModal, setShowModal] = useState(false);

  const handleRegister = async (data) => {
    await api.registerTeam(tournamentId, data);
    onUpdate();
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-bold text-lg text-white">
            Registered Teams
          </h3>
          <p className="text-gsite-muted text-sm mt-0.5">
            {teams.length} team{teams.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 bg-gsite-accent hover:bg-gsite-accentHover text-white font-display font-bold rounded-xl transition-all text-sm glow-red"
        >
          + Add Team
        </button>
      </div>

      {/* Teams Grid */}
      {teams.length === 0 ? (
        <div className="bg-gsite-card border border-gsite-border rounded-2xl p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gsite-accent/10 border border-gsite-accent/30 flex items-center justify-center">
            <svg className="w-8 h-8 text-gsite-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
            </svg>
          </div>
          <p className="text-gsite-muted text-lg mb-2">No teams registered yet</p>
          <p className="text-gsite-muted/60 text-sm">
            Click "+ Add Team" to register your first squad
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team, index) => (
            <div
              key={team.id}
              className="bg-gsite-card border border-gsite-border rounded-2xl overflow-hidden hover:border-gsite-cyan/30 transition-all group"
            >
              {/* Team header */}
              <div className="px-5 py-4 border-b border-gsite-border/50 bg-gsite-bg/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gsite-accent/10 border border-gsite-accent/30 flex items-center justify-center font-display font-bold text-gsite-accent text-sm group-hover:bg-gsite-accent/20 transition-colors">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-display font-bold text-white">
                      {team.name}
                    </div>
                    <div className="text-gsite-muted text-xs">
                      {team.players.length} players
                    </div>
                  </div>
                </div>
              </div>

              {/* Players */}
              <div className="p-4 space-y-2">
                {team.players.map((p, i) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 px-3 py-2 bg-gsite-bg/40 rounded-lg"
                  >
                    <span className="w-5 h-5 rounded-full bg-gsite-border flex items-center justify-center text-gsite-muted text-[10px] font-display font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-gsite-text text-sm font-medium">
                      {p.name}
                    </span>
                    {p.gamertag && p.gamertag !== p.name && (
                      <span className="text-gsite-muted text-xs ml-auto">
                        {p.gamertag}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Team Modal */}
      <AddTeamModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleRegister}
      />
    </div>
  );
}
