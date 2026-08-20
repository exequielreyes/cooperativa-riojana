"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export function MarcarPagadoEfectivo({ cuotaId }: { cuotaId: string }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  async function marcar() {
    setCargando(true);
    await fetch(`/api/cuotas/${cuotaId}/marcar-pagado`, { method: "POST" });
    setCargando(false);
    setConfirmando(false);
    router.refresh();
  }

  return (
    <>
      <button className="btn-secondary text-xs" disabled={cargando} onClick={() => setConfirmando(true)}>
        {cargando ? "Guardando..." : "Marcar Pagado (Efectivo)"}
      </button>

      <ConfirmModal
        open={confirmando}
        title="¿Confirmar pago en efectivo?"
        description="Se registrará el pago como recibido en efectivo y la cuota pasará a estado Pagado. Esta acción no se puede deshacer."
        confirmLabel="Sí, marcar como pagado"
        loading={cargando}
        onConfirm={marcar}
        onCancel={() => setConfirmando(false)}
      />
    </>
  );
}