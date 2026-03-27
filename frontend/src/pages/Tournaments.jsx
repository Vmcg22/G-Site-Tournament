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
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="font-display font-bold text-4xl text-white mb-1">
              Tournaments
            </h1>
            <p className="text-gsite-muted text-sm">
              Manage your tournaments, view leaderboards and top fraggers.
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

        {/* Content */}
        {loading ? (
          <div className="text-gsite-muted text-center py-20">
            Loading tournaments...
          </div>
        ) : tournaments.length === 0 ? (
          <div className="bg-gsite-card border border-gsite-border rounded-2xl p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gsite-accent/10 border border-gsite-accent/30 flex items-center justify-center">
              <svg className="w-8 h-8 text-gsite-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.023 6.023 0 01-2.77.896m5.25-6.624V2.721" />
              </svg>
            </div>
            <p className="text-gsite-muted text-lg mb-2">No tournaments yet</p>
            <p className="text-gsite-muted/60 text-sm mb-6">
              Create your first tournament to get started
            </p>
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-6 py-3 bg-gsite-accent hover:bg-gsite-accentHover text-white font-display font-semibold rounded-xl transition-all"
            >
              {creating ? "Creating..." : "+ New Tournament"}
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {tournaments.map((t) => (
              <div
                key={t.id}
                className="bg-gsite-card border border-gsite-border rounded-2xl overflow-hidden hover:border-gsite-cyan/30 transition-all group"
              >
                {/* Card top accent */}
                <div className="h-1 bg-gradient-to-r from-gsite-accent via-gsite-cyan to-gsite-accent opacity-50 group-hover:opacity-100 transition-opacity" />

                {/* Card body */}
                <div className="p-5">
                  {/* Title + status */}
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="font-display font-bold text-xl text-white group-hover:text-gsite-cyan transition-colors leading-tight">
                      {t.name}
                    </h2>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider shrink-0 ml-3 ${
                        t.status === "active"
                          ? "bg-green-500/10 border border-green-500/30 text-green-400"
                          : "bg-gsite-muted/10 border border-gsite-border text-gsite-muted"
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex items-center gap-2 mb-5 text-gsite-muted text-sm">
                    <span>{t.game}</span>
                    <span className="text-gsite-border">|</span>
                    <span>{t.format}</span>
                    <span className="text-gsite-border">|</span>
                    <span>{t.num_matches} Matches</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/admin/${t.id}`)}
                      className="flex-1 py-2.5 bg-gsite-accent/10 border border-gsite-accent/30 text-gsite-accent font-display font-semibold rounded-xl hover:bg-gsite-accent/20 transition-all text-sm"
                    >
                      Manage
                    </button>
                    <a
                      href={`/leaderboard/${t.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 bg-gsite-cyan/10 border border-gsite-cyan/30 text-gsite-cyan font-display font-semibold rounded-xl hover:bg-gsite-cyan/20 transition-all text-sm text-center"
                    >
                      Leaderboard
                    </a>
                    <a
                      href={`/top-fraggers/${t.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 bg-gsite-gold/10 border border-gsite-gold/30 text-gsite-gold font-display font-semibold rounded-xl hover:bg-gsite-gold/20 transition-all text-sm text-center"
                    >
                      Top Fraggers
                    </a>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => setDeleteTarget(t)}
                    className="w-full mt-2 py-2 text-gsite-muted/40 hover:text-red-400 text-xs transition-colors"
                  >
                    Delete tournament
                  </button>
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
