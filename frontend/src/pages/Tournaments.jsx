import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import ConfirmModal from "../components/ConfirmModal";

export default function Tournaments() {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadTournaments = () => {
    api.getTournaments().then((list) => {
      setTournaments(list);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await api.seed();
      navigate(`/admin/${res.tournament_id}`);
    } catch {
      loadTournaments();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display font-bold text-4xl text-white mb-2">
              Tournaments
            </h1>
            <p className="text-gsite-muted">
              Browse active and past tournaments. Select one to manage or view
              its leaderboard.
            </p>
          </div>
          <button
            onClick={handleCreate}
            disabled={creating}
            className="px-6 py-3 bg-gsite-accent hover:bg-gsite-accentHover text-white font-display font-bold rounded-xl transition-all glow-red disabled:opacity-50 shrink-0"
          >
            {creating ? "Creating..." : "+ New Tournament"}
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-gsite-muted text-center py-20">
            Loading tournaments...
          </div>
        ) : tournaments.length === 0 ? (
          <div className="bg-gsite-card border border-gsite-border rounded-2xl p-12 text-center">
            <p className="text-gsite-muted text-lg mb-4">
              No tournaments created yet.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-gsite-accent hover:bg-gsite-accentHover text-white font-display font-semibold rounded-xl transition-all"
            >
              Go to Home
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tournaments.map((t) => (
              <div
                key={t.id}
                className="bg-gsite-card border border-gsite-border rounded-2xl p-6 hover:border-gsite-cyan/40 transition-all group cursor-pointer"
                onClick={() => navigate(`/admin/${t.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display font-bold text-xl text-white group-hover:text-gsite-cyan transition-colors">
                      {t.name}
                    </h2>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="px-3 py-1 bg-gsite-bg border border-gsite-border rounded-full text-gsite-text text-xs">
                        {t.game}
                      </span>
                      <span className="px-3 py-1 bg-gsite-bg border border-gsite-border rounded-full text-gsite-text text-xs">
                        {t.format}
                      </span>
                      <span className="px-3 py-1 bg-gsite-bg border border-gsite-border rounded-full text-gsite-text text-xs">
                        {t.num_matches} Matches
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          t.status === "active"
                            ? "bg-green-500/10 border border-green-500/30 text-green-400"
                            : "bg-gsite-muted/10 border border-gsite-border text-gsite-muted"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/top-fraggers/${t.id}`);
                      }}
                      className="px-5 py-2.5 bg-gsite-gold/10 border border-gsite-gold/30 text-gsite-gold font-display font-semibold rounded-xl hover:bg-gsite-gold/20 transition-all text-sm"
                    >
                      Top Fraggers
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/leaderboard/${t.id}`);
                      }}
                      className="px-5 py-2.5 bg-gsite-cyan/10 border border-gsite-cyan/30 text-gsite-cyan font-display font-semibold rounded-xl hover:bg-gsite-cyan/20 transition-all text-sm"
                    >
                      Leaderboard
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/${t.id}`);
                      }}
                      className="px-5 py-2.5 bg-gsite-accent/10 border border-gsite-accent/30 text-gsite-accent font-display font-semibold rounded-xl hover:bg-gsite-accent/20 transition-all text-sm"
                    >
                      Manage
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(t);
                      }}
                      className="px-5 py-2.5 bg-red-900/20 border border-red-800/40 text-red-400 font-display font-semibold rounded-xl hover:bg-red-900/40 transition-all text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Tournament"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.name}"? All teams, matches, and results will be permanently removed.`
            : ""
        }
        confirmLabel="Delete Tournament"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          await api.deleteTournament(deleteTarget.id);
          setDeleteTarget(null);
          loadTournaments();
        }}
      />
    </div>
  );
}
