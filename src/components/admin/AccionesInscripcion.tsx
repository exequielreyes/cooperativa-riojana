"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AccionesInscripcion({ inscripcionId }: { inscripcionId: string }) {
  const router = useRouter();
  const [cargando, setCargando] = useState<"CONFIRMADO" | "CANCELADO" | null>(null);

  async function accionar(estado: "CONFIRMADO" | "CANCELADO") {
    setCargando(estado);
    await fetch(`/api/inscripciones/${inscripcionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado }),
    });
    setCargando(null);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        className="text-xs text-status-success hover:underline disabled:opacity-50"
        disabled={cargando !== null}
        onClick={() => accionar("CONFIRMADO")}
      >
        {cargando === "CONFIRMADO" ? "Confirmando..." : "Confirmar"}
      </button>
      <button
        className="text-xs text-status-danger hover:underline disabled:opacity-50"
        disabled={cargando !== null}
        onClick={() => accionar("CANCELADO")}
      >
        {cargando === "CANCELADO" ? "Rechazando..." : "Rechazar"}
      </button>
    </div>
  );
}
