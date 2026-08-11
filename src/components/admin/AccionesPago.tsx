"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AccionesPago({ pagoId }: { pagoId: string }) {
  const router = useRouter();
  const [cargando, setCargando] = useState<"APROBAR" | "RECHAZAR" | null>(null);

  async function accionar(accion: "APROBAR" | "RECHAZAR") {
    setCargando(accion);
    await fetch(`/api/pagos/${pagoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion }),
    });
    setCargando(null);
    router.refresh();
  }

  return (
    <div className="flex gap-2">
      <button
        className="text-xs text-status-success hover:underline disabled:opacity-50"
        disabled={cargando !== null}
        onClick={() => accionar("APROBAR")}
      >
        {cargando === "APROBAR" ? "Aprobando..." : "Aprobar"}
      </button>
      <button
        className="text-xs text-status-danger hover:underline disabled:opacity-50"
        disabled={cargando !== null}
        onClick={() => accionar("RECHAZAR")}
      >
        {cargando === "RECHAZAR" ? "Rechazando..." : "Rechazar"}
      </button>
    </div>
  );
}
