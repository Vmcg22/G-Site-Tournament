import { useState, useEffect } from "react";
import { api } from "../api/client";

export default function MatchReportForm({ match, teams, onSubmit }) {
  const [results, setResults] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [errors, setErrors] = useState([]);

  // Reset form when switching to a different match
  useEffect(() => {
    setFeedback(null);
    setErrors([]);
  }, [match.id]);

  // Sync form with match data (including after submit refresh)
  useEffect(() => {
    setResults(
      teams.map((t) => {
        const existing = match.results?.find((r) => r.team_id === t.id);
        return {
          team_id: t.id,
          team_name: t.name,
          placement: existing?.placement ?? "",
          kills: existing?.kills ?? "",
        };
      })
    );
  }, [match.id, match.results, teams]);

  const maxPlacement = teams.length;

  const handleChange = (teamId, field, value) => {
    setResults((prev) =>
      prev.map((r) => {
        if (r.team_id !== teamId) return r;
        let parsed = value === "" ? "" : parseInt(value);
        if (isNaN(parsed)) parsed = "";

        // Clamp placement to max teams
        if (field === "placement" && parsed !== "" && parsed > maxPlacement) {
          parsed = maxPlacement;
        }
        if (field === "placement" && parsed !== "" && parsed < 1) {
          parsed = 1;
        }

        return { ...r, [field]: parsed };
      })
    );
    setErrors([]);
  };

  const validate = () => {
    const errs = [];
    const placements = results
      .filter((r) => r.placement !== "")
      .map((r) => r.placement);

    // Check duplicate placements
    const seen = new Set();
    for (const p of placements) {
      if (seen.has(p)) {
        errs.push(`Placement ${p} is assigned to more than one team`);
        break;
      }
      seen.add(p);
    }

    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    setFeedback(null);
    setErrors([]);
    try {
      const payload = results
        .filter((r) => r.placement !== "" || r.kills !== "")
        .map((r) => ({
          team_id: r.team_id,
          placement: r.placement === "" ? null : r.placement,
          kills: r.kills === "" ? null : r.kills,
        }));

      const res = await api.submitResults(match.id, payload);
      setFeedback(res);
      onSubmit();
    } catch (err) {
      setFeedback({ error: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLock = async () => {
    await api.toggleLock(match.id);
    onSubmit();
  };

  return (
    <div className="bg-gsite-card border border-gsite-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gsite-border">
        <div>
          <h3 className="font-display font-bold text-lg text-white">
            Match {match.match_number}
          </h3>
          <p className="text-gsite-muted text-sm">
            {match.is_locked
              ? "This match is locked — results cannot be edited"
              : `Enter placement (1–${maxPlacement}) and kills for each team`}
          </p>
        </div>
        <button
          onClick={handleLock}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            match.is_locked
              ? "bg-gsite-gold/10 border border-gsite-gold/30 text-gsite-gold hover:bg-gsite-gold/20"
              : "bg-gsite-card border border-gsite-border text-gsite-muted hover:text-white hover:border-gsite-accent"
          }`}
        >
          {match.is_locked ? "Unlock Match" : "Lock Match"}
        </button>
      </div>

      {/* Form Grid */}
      <div className="p-6">
        <div className="grid grid-cols-[1fr_120px_120px] gap-3 mb-2 px-2 text-gsite-muted text-xs uppercase tracking-wider">
          <span>Team</span>
          <span>Placement</span>
          <span>Kills</span>
        </div>

        <div className="space-y-2">
          {results.map((r) => {
            // Check if this placement is duplicated
            const isDup =
              r.placement !== "" &&
              results.filter((o) => o.placement === r.placement).length > 1;

            return (
              <div
                key={r.team_id}
                className="grid grid-cols-[1fr_120px_120px] gap-3 items-center bg-gsite-bg/50 rounded-xl px-4 py-3 border border-gsite-border/50"
              >
                <span className="font-display font-semibold text-white">
                  {r.team_name}
                </span>
                <input
                  type="number"
                  min="1"
                  max={maxPlacement}
                  placeholder="—"
                  value={r.placement}
                  onChange={(e) =>
                    handleChange(r.team_id, "placement", e.target.value)
                  }
                  disabled={match.is_locked}
                  className={`bg-gsite-card border rounded-lg px-3 py-2 text-white text-center font-mono focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
                    isDup
                      ? "border-gsite-accent focus:border-gsite-accent"
                      : "border-gsite-border focus:border-gsite-cyan"
                  }`}
                />
                <input
                  type="number"
                  min="0"
                  placeholder="—"
                  value={r.kills}
                  onChange={(e) =>
                    handleChange(r.team_id, "kills", e.target.value)
                  }
                  disabled={match.is_locked}
                  className="bg-gsite-card border border-gsite-border rounded-lg px-3 py-2 text-white text-center font-mono focus:outline-none focus:border-gsite-cyan disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>
            );
          })}
        </div>

        {/* Validation errors */}
        {errors.length > 0 && (
          <div className="mt-4 bg-gsite-accent/10 border border-gsite-accent/30 text-gsite-accent rounded-lg p-3 text-sm">
            {errors.map((e, i) => (
              <div key={i}>{e}</div>
            ))}
          </div>
        )}

        {/* Submit */}
        {!match.is_locked && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="mt-6 w-full py-3 bg-gsite-accent hover:bg-gsite-accentHover text-white font-display font-bold rounded-xl transition-all disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Results"}
          </button>
        )}

        {/* Feedback */}
        {feedback && (
          <div className="mt-4 space-y-2">
            {feedback.error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg p-3 text-sm">
                {feedback.error}
              </div>
            )}
            {feedback.warnings?.length > 0 && (
              <div className="bg-gsite-gold/10 border border-gsite-gold/30 text-gsite-gold rounded-lg p-3 text-sm">
                <div className="font-medium mb-1">Warnings:</div>
                <ul className="list-disc list-inside space-y-0.5">
                  {feedback.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
            {feedback.missing_teams && (
              <div className="bg-gsite-cyan/10 border border-gsite-cyan/30 text-gsite-cyan rounded-lg p-3 text-sm">
                {feedback.missing_teams}
              </div>
            )}
            {feedback.status === "ok" && !feedback.warnings?.length && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg p-3 text-sm">
                Results submitted successfully
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
