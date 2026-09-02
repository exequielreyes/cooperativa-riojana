"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export function AccionesInscripcion({ inscripcionId }: { inscripcionId: string }) {
  const router = useRouter();
  const [cargando, setCargando] = useState<"CONFIRMADO" | "CANCELADO" | null>(null);
  const [confirmando, setConfirmando] = useState<"CONFIRMADO" | "CANCELADO" | null>(null);

  async function cambiarEstado(estado: "CONFIRMADO" | "CANCELADO") {
    setCargando(estado);
    await fetch(`/api/inscripciones/${inscripcionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    setCargando(null);
    setConfirmando(null);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        className="text-xs text-status-success hover:underline disabled:opacity-50"
        disabled={cargando !== null || confirmando !== null}
        onClick={() => setConfirmando("CONFIRMADO")}
      >
        {cargando === "CONFIRMADO" ? "Confirmando..." : "Confirmar"}
      </button>
      <button
        className="text-xs text-status-danger hover:underline disabled:opacity-50"
        disabled={cargando !== null || confirmando !== null}
        onClick={() => setConfirmando("CANCELADO")}
      >
        {cargando === "CANCELADO" ? "Rechazando..." : "Rechazar"}
      </button>

      {confirmando === "CONFIRMADO" && (
        <ConfirmModal
          open
          title="¿Aprobar inscripción?"
          description="El socio será inscripto al taller y ocupará un cupo."
          confirmLabel="Sí, aprobar"
          tone="default"
          loading={cargando === "CONFIRMADO"}
          onConfirm={() => cambiarEstado("CONFIRMADO")}
          onCancel={() => setConfirmando(null)}
        />
      )}

      {confirmando === "CANCELADO" && (
        <ConfirmModal
          open
          title="¿Rechazar inscripción?"
          description="La inscripción será cancelada y no ocupará cupo en el taller."
          confirmLabel="Sí, rechazar"
          tone="danger"
          loading={cargando === "CANCELADO"}
          onConfirm={() => cambiarEstado("CANCELADO")}
          onCancel={() => setConfirmando(null)}
        />
      )}
    </div>
  );
}
