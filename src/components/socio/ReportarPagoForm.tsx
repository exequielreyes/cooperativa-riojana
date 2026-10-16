"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { VolverAlPanel } from "@/components/socio/VolverAlPanel";

interface CuotaSeleccionable {
  id: string;
  periodo: string;
  monto: number;
  fechaVencimiento: string;
  enRevision: boolean;
  motivoRechazo: string | null;
}

interface DatosTransferencia {
  cbu: string | null;
  alias: string | null;
}

export function ReportarPagoForm({
  cuotas,
  cuotaPreseleccionadaId,
  datosTransferencia,
}: {
  cuotas: CuotaSeleccionable[];
  cuotaPreseleccionadaId: string;
  datosTransferencia: DatosTransferencia;
}) {
  const router = useRouter();
  const [archivo, setArchivo] = useState<File | null>(null);
  const [metodo, setMetodo] = useState("TRANSFERENCIA");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cuotasDisponibles = cuotas.filter((c) => !c.enRevision);

  // Por defecto se preselecciona desde la primera cuota disponible hasta la cuota preseleccionada de forma correlativa
  const [cuotaIds, setCuotaIds] = useState<string[]>(() => {
    const idx = cuotasDisponibles.findIndex((c) => c.id === cuotaPreseleccionadaId);
    if (idx > 0) {
      return cuotasDisponibles.slice(0, idx + 1).map((c) => c.id);
    }
    return cuotasDisponibles.length > 0 ? [cuotasDisponibles[0].id] : [];
  });

  const cuotasSeleccionadas = cuotas.filter((c) => cuotaIds.includes(c.id));
  const totalMonto = cuotasSeleccionadas.reduce((acc, c) => acc + c.monto, 0);
  const todasSeleccionadas =
    cuotasDisponibles.length > 0 && cuotaIds.length === cuotasDisponibles.length;

  function toggleCuota(id: string) {
    const targetIndex = cuotasDisponibles.findIndex((c) => c.id === id);
    if (targetIndex === -1) return;

    const isSelected = cuotaIds.includes(id);

    if (!isSelected) {
      // Para no saltearse ninguna cuota, se seleccionan todas desde la más antigua hasta la clickeada
      const nuevasCuotas = cuotasDisponibles.slice(0, targetIndex + 1).map((c) => c.id);
      setCuotaIds(nuevasCuotas);
    } else {
      // Si la cuota ya estaba seleccionada:
      if (targetIndex === 0) {
        // Clic en la primera cuota: si hay más seleccionadas, reduce a sólo la primera
        if (cuotaIds.length > 1) {
          setCuotaIds([cuotasDisponibles[0].id]);
        }
        return;
      }
      // Al desmarcar una cuota, se desmarcan también las posteriores para mantener correlatividad
      const nuevasCuotas = cuotasDisponibles.slice(0, targetIndex).map((c) => c.id);
      setCuotaIds(nuevasCuotas);
    }
  }

  function togglePagarTodoJunto(checked: boolean) {
    if (cuotasDisponibles.length === 0) return;
    setCuotaIds(checked ? cuotasDisponibles.map((c) => c.id) : [cuotasDisponibles[0].id]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cuotasSeleccionadas.some((c) => c.enRevision)) {
      setError("Alguna de las cuotas seleccionadas ya tiene un pago en revisión.");
      return;
    }

    // Validación de correlatividad: no se pueden saltear cuotas
    const expectedIds = cuotasDisponibles.slice(0, cuotaIds.length).map((c) => c.id);
    const cuotaIdsSet = new Set(cuotaIds);
    const esCorrelativo =
      expectedIds.length === cuotaIds.length && expectedIds.every((id) => cuotaIdsSet.has(id));

    if (!esCorrelativo) {
      setError("No podés saltearte cuotas. Debés abonar las cuotas en orden correlativo a partir de la más antigua.");
      return;
    }

    if (!archivo) {
      setError("Adjuntá el comprobante antes de continuar.");
      return;
    }
    setError(null);
    setEnviando(true);

    const formData = new FormData();
    cuotaIds.forEach((id) => formData.append("cuotaId", id));
    formData.append("metodo", metodo);
    formData.append("comprobante", archivo);

    const res = await fetch("/api/pagos", {
      method: "POST",
      body: formData,
    });

    setEnviando(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "No se pudo registrar el pago. Intentá de nuevo.");
      return;
    }

    setEnviado(true);
    router.refresh();
  }

  if (enviado) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <div className="card text-center">
          <p className="mb-2 font-medium text-status-success">¡Pago reportado con éxito!</p>
          <p className="mb-4 text-sm text-gray-500">
            {cuotaIds.length > 1
              ? `Tus ${cuotaIds.length} cuotas quedaron en revisión. Te avisaremos cuando sean validadas.`
              : "Tu comprobante quedó en revisión. Te avisaremos cuando sea validado."}
          </p>
          <button className="btn-primary" onClick={() => router.push("/portal")}>
            Volver al panel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <VolverAlPanel />
      <h1 className="mb-1 text-2xl font-semibold text-primary-dark">Reportar Pago de Cuota</h1>
      <p className="mb-6 text-sm text-gray-500">Carga tu comprobante de transferencia para validar el pago.</p>

      {cuotas.length > 1 && (
        <div className="card mb-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <label className="text-xs text-gray-500 font-medium block">
                Tenés {cuotas.length} cuotas pendientes. Elegí cuáles pagar ahora:
              </label>
              <span className="text-[11px] text-gray-400">
                El pago es correlativo a partir de la más antigua (no podés saltearte cuotas).
              </span>
            </div>
            <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-primary shrink-0">
              <input
                type="checkbox"
                checked={todasSeleccionadas}
                onChange={(e) => togglePagarTodoJunto(e.target.checked)}
                disabled={enviando}
              />
              Pagar todo junto
            </label>
          </div>

          <div className="space-y-2">
            {cuotas.map((c) => (
              <label
                key={c.id}
                className={`flex items-center justify-between rounded-lg border border-surface-border px-3 py-2 text-sm ${
                  c.enRevision ? "opacity-55 cursor-not-allowed bg-surface-muted" : "cursor-pointer hover:bg-surface-muted"}`}
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={cuotaIds.includes(c.id)}
                    onChange={() => toggleCuota(c.id)}
                    disabled={enviando || c.enRevision}
                  />
                  <span>
                    {c.periodo}{" "}
                    <span className="text-xs text-gray-400">(vence {formatDate(c.fechaVencimiento)})</span>
                  </span>
                </span>
               <div className="flex items-center gap-3">
                  {c.enRevision && <span className="text-xs font-medium text-status-warning">En revisión</span>}
                  {c.motivoRechazo && <span className="text-xs font-medium text-status-danger">Rechazado antes</span>}
                  <span className="font-medium text-primary-dark">{formatCurrency(c.monto)}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="card mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">
            {cuotasSeleccionadas.length === 1
              ? `Cuota ${cuotasSeleccionadas[0].periodo}`
              : `${cuotasSeleccionadas.length} cuotas seleccionadas`}
          </p>
          {cuotasSeleccionadas.length === 1 && (
            <p className="text-xs text-gray-400">Vencimiento: {formatDate(cuotasSeleccionadas[0].fechaVencimiento)}</p>
          )}
        </div>
        <p className="text-lg font-semibold text-primary-dark">{formatCurrency(totalMonto)}</p>
      </div>

      <form className="card space-y-4" onSubmit={handleSubmit}>
        {cuotasSeleccionadas.some((c) => c.motivoRechazo) && (
          <div className="rounded-lg bg-status-danger/5 p-3 text-sm text-status-danger">
            Alguna de las cuotas seleccionadas tiene un comprobante rechazado previo. Podés volver a subirlo corregido.
          </div>
        )}
        <div>
          <label className="mb-1 block text-xs text-gray-400">Método de pago</label>
          <select className="input" value={metodo} onChange={(e) => setMetodo(e.target.value)}>
            <option value="TRANSFERENCIA">Transferencia</option>
            {/* <option value="EFECTIVO">Efectivo</option> */}
            <option value="MERCADOPAGO" disabled>Otro método (Próximamente)</option>
          </select>
        </div>

        {metodo === "TRANSFERENCIA" && (datosTransferencia.cbu || datosTransferencia.alias) && (
          <div className="rounded-lg bg-surface-muted p-4 text-sm">
            <p className="mb-1 font-medium text-primary-dark">Datos para transferir</p>
            {datosTransferencia.cbu && (
              <p className="text-gray-600">
                CBU: <span className="font-mono">{datosTransferencia.cbu}</span>
              </p>
            )}
            {datosTransferencia.alias && (
              <p className="text-gray-600">
                Alias: <span className="font-mono">{datosTransferencia.alias}</span>
              </p>
            )}
          </div>
        )}

        <p className="text-sm font-medium text-primary-dark">Subir Comprobante</p>
        <label className="flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-surface-border text-center text-sm text-gray-400 hover:bg-surface-muted">
          <input
            type="file"
            accept=".jpg,.png,.pdf"
            className="hidden"
            onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
          />
          <span>{archivo ? archivo.name : "Haz clic para subir o arrastra tu archivo aquí"}</span>
          <span className="mt-1 text-xs">Formatos admitidos: JPG, PNG, PDF. Tamaño máximo 5MB</span>
        </label>

        {error && <p className="text-sm text-status-danger">{error}</p>}

        <button type="submit" className="btn-primary w-full" disabled={enviando}>
          {enviando ? "Enviando..." : "Confirmar y Enviar Pago"}
        </button>
      </form>

      <p className="mt-4 text-xs text-gray-400">
        Tu pago será revisado por nuestro equipo administrativo. Recibirás una
        notificación una vez que sea validado (normalmente dentro de las 24-48
        horas hábiles).
      </p>
    </div>
  );
}