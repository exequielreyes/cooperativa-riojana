"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MarcarPagadoEfectivo({ cuotaId }: { cuotaId: string }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  async function marcar() {
    if (!confirm("¿Confirmás que este socio pagó esta cuota en efectivo?")) return;
    setCargando(true);
    await fetch(`/api/cuotas/${cuotaId}/marcar-pagado`, { method: "POST" });
    setCargando(false);
    router.refresh();
  }

  return (
    <button className="btn-secondary text-xs" disabled={cargando} onClick={marcar}>
      {cargando ? "Guardando..." : "Marcar Pagado (Efectivo)"}
    </button>
  );
}
