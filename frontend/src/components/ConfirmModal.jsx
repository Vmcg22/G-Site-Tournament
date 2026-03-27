import { useEffect } from "react";

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      onClick={onCancel}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md bg-gsite-card border border-gsite-border rounded-2xl overflow-hidden shadow-2xl animate-[modalIn_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent */}
        <div className="h-1 bg-gradient-to-r from-red-500 via-gsite-accent to-red-500" />

        <div className="p-6">
          {/* Icon */}
          <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <svg
              className="w-7 h-7 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-xl text-white text-center mb-2">
            {title}
          </h3>

          {/* Message */}
          <p className="text-gsite-muted text-sm text-center leading-relaxed">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-gsite-border text-gsite-text hover:text-white hover:border-gsite-muted font-display font-semibold rounded-xl transition-all text-sm"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-display font-bold rounded-xl transition-all text-sm shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
