"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface MarcarPagadoEfectivoProps {
  cuotaId: string;
  disabled?: boolean;
  motivoDisabled?: string;
}

export function MarcarPagadoEfectivo({
  cuotaId,
  disabled = false,
  motivoDisabled,
}: MarcarPagadoEfectivoProps) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  async function marcar() {
    setCargando(true);
    try {
      const res = await fetch(`/api/cuotas/${cuotaId}/marcar-pagado`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "No se pudo marcar como pagado.");
        setCargando(false);
        setConfirmando(false);
        return;
      }
      setCargando(false);
      setConfirmando(false);
      router.refresh();
    } catch {
      alert("Error de conexión al marcar la cuota como pagada.");
      setCargando(false);
      setConfirmando(false);
    }
  }

  return (
    <>
      <span title={disabled ? motivoDisabled : undefined} className="inline-block">
        <button
          className={
            disabled
              ? "btn-secondary text-xs opacity-40 cursor-not-allowed bg-gray-100 text-gray-400 hover:bg-gray-100 border-gray-200 shadow-none pointer-events-none"
              : "btn-secondary text-xs"
          }
          disabled={cargando || disabled}
          onClick={() => {
            if (!disabled) setConfirmando(true);
          }}
        >
          {cargando ? "Guardando..." : "Marcar Pagado (Efectivo)"}
        </button>
      </span>

      {!disabled && (
        <ConfirmModal
          open={confirmando}
          title="¿Confirmar pago en efectivo?"
          description="Se registrará el pago como recibido en efectivo y la cuota pasará a estado Pagado. Esta acción no se puede deshacer."
          confirmLabel="Sí, marcar como pagado"
          loading={cargando}
          onConfirm={marcar}
          onCancel={() => setConfirmando(false)}
        />
      )}
    </>
  );
}