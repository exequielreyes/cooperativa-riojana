"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CancelarInscripcionButton({ inscripcionId }: { inscripcionId: string }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancelar() {
    if (!confirm("¿Seguro que querés darte de baja de este taller?")) return;
    setCargando(true);
    setError(null);

    const res = await fetch(`/api/inscripciones/${inscripcionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: "CANCELADO" }),
    });

    setCargando(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "No se pudo cancelar la inscripción.");
      return;
    }

    router.refresh();
  }

  return (
    <div className="text-right">
      <button
        className="text-xs text-status-danger hover:underline disabled:opacity-50"
        disabled={cargando}
        onClick={cancelar}
      >
        {cargando ? "Cancelando..." : "Darme de baja"}
      </button>
      {error && <p className="mt-1 max-w-[160px] text-xs text-status-danger">{error}</p>}
    </div>
  );
}
