"use client";

import { useEffect, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "danger";
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  /** Contenido adicional entre la descripción y los botones (ej: un textarea). */
  children?: ReactNode;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "default",
  loading = false,
  onConfirm,
  onCancel,
  children,
}: ConfirmModalProps) {
  // Cerrar con Escape (salvo que haya una acción en curso)
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      onClick={() => !loading && onCancel()}
    >
      <div className="card w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3">
          {tone === "danger" && (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-status-danger/10 text-status-danger">
              <AlertTriangle size={18} />
            </div>
          )}
          <div className="w-full">
            <h2 id="confirm-modal-title" className="font-medium text-primary-dark">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
            {children && <div className="mt-3">{children}</div>}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            className="btn-secondary text-sm disabled:opacity-50"
            disabled={loading}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            className={`rounded-lg px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 ${
              tone === "danger" ? "bg-status-danger" : "bg-primary"
            }`}
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? "Procesando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}