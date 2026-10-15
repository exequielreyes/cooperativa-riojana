"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export function AccionesPago({
  pagoId,
  pagoIds,
  cantidadCuotas = 1,
  cuotasTexto,
}: {
  pagoId: string;
  pagoIds?: string[];
  cantidadCuotas?: number;
  cuotasTexto?: string;
}) {
  const router = useRouter();
  const [cargando, setCargando] = useState<"APROBAR" | "RECHAZAR" | null>(null);
  const [confirmando, setConfirmando] = useState<"APROBAR" | "RECHAZAR" | null>(null);
  const [notaRechazo, setNotaRechazo] = useState("");

  const esGrupal = cantidadCuotas > 1;

  async function accionar(accion: "APROBAR" | "RECHAZAR") {
    setCargando(accion);
    await fetch(`/api/pagos/${pagoId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accion,
        pagoIds,
        ...(accion === "RECHAZAR" && notaRechazo.trim() && { notaRechazo: notaRechazo.trim() }),
      }),
    });
    setCargando(null);
    setConfirmando(null);
    setNotaRechazo("");
    router.refresh();
  }

  return (
    <>
      <div className="flex gap-2">
        <button
          className="text-xs text-status-success hover:underline disabled:opacity-50"
          disabled={cargando !== null}
          onClick={() => setConfirmando("APROBAR")}
        >
          {cargando === "APROBAR" ? "Aprobando..." : "Aprobar"}
        </button>
        <button
          className="text-xs text-status-danger hover:underline disabled:opacity-50"
          disabled={cargando !== null}
          onClick={() => setConfirmando("RECHAZAR")}
        >
          {cargando === "RECHAZAR" ? "Rechazando..." : "Rechazar"}
        </button>
      </div>

      <ConfirmModal
        open={confirmando === "APROBAR"}
        title={esGrupal ? `¿Aprobar pago de ${cantidadCuotas} cuotas?` : "¿Aprobar este pago?"}
        description={
          esGrupal
            ? `El comprobante quedará validado y las ${cantidadCuotas} cuotas asociadas (${cuotasTexto || ""}) pasarán a estado Pagado. Esta acción no se puede deshacer.`
            : "El comprobante quedará validado y la cuota asociada pasará a estado Pagado. Esta acción no se puede deshacer."
        }
        confirmLabel="Sí, aprobar"
        loading={cargando === "APROBAR"}
        onConfirm={() => accionar("APROBAR")}
        onCancel={() => setConfirmando(null)}
      />

      <ConfirmModal
        open={confirmando === "RECHAZAR"}
        title={esGrupal ? `¿Rechazar pago de ${cantidadCuotas} cuotas?` : "¿Rechazar este pago?"}
        description={
          esGrupal
            ? `El comprobante quedará marcado como rechazado y las ${cantidadCuotas} cuotas seguirán pendientes. El socio deberá volver a reportar el pago.`
            : "El comprobante quedará marcado como rechazado y la cuota seguirá pendiente. El socio deberá volver a reportar el pago."
        }
        confirmLabel="Sí, rechazar"
        tone="danger"
        loading={cargando === "RECHAZAR"}
        onConfirm={() => accionar("RECHAZAR")}
        onCancel={() => {
          setConfirmando(null);
          setNotaRechazo("");
        }}
      >
        <label htmlFor="nota-rechazo" className="block text-xs font-medium text-gray-500">
          Motivo del rechazo (opcional, el socio lo va a ver)
        </label>
        <textarea
          id="nota-rechazo"
          className="input mt-1 w-full resize-none"
          rows={3}
          value={notaRechazo}
          onChange={(e) => setNotaRechazo(e.target.value)}
          placeholder="Ej: el comprobante no coincide con el monto de la cuota."
          disabled={cargando === "RECHAZAR"}
        />
      </ConfirmModal>
    </>
  );
}