"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils";
import { VolverAlPanel } from "@/components/socio/VolverAlPanel";

interface Cuota {
  id: string;
  periodo: string;
  monto: number;
  fechaVencimiento: string;
}

interface DatosTransferencia {
  cbu: string | null;
  alias: string | null;
}

export function ReportarPagoForm({
  cuotas,
  datosTransferencia,
}: {
  cuotas: Cuota[];
  datosTransferencia: DatosTransferencia;
}) {
  const router = useRouter();
  const [archivo, setArchivo] = useState<File | null>(null);
  const [metodo, setMetodo] = useState("TRANSFERENCIA");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Por defecto se preselecciona sólo la cuota más antigua (ya vienen
  // ordenadas por fechaVencimiento asc desde el server).
  const [cuotaIds, setCuotaIds] = useState<string[]>([cuotas[0].id]);

  const cuotasSeleccionadas = cuotas.filter((c) => cuotaIds.includes(c.id));
  const totalMonto = cuotasSeleccionadas.reduce((acc, c) => acc + c.monto, 0);
  const todasSeleccionadas = cuotaIds.length === cuotas.length;

  function toggleCuota(id: string) {
    setCuotaIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // no permitir dejar 0 cuotas seleccionadas
        return prev.filter((x) => x !== id);
      }
      return [...prev, id];
    });
  }

  function togglePagarTodoJunto(checked: boolean) {
    setCuotaIds(checked ? cuotas.map((c) => c.id) : [cuotas[0].id]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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
          <div className="mb-3 flex items-center justify-between">
            <label className="text-xs text-gray-400">
              Tenés {cuotas.length} cuotas pendientes. Elegí cuáles pagar ahora.
            </label>
            <label className="flex cursor-pointer items-center gap-1.5 text-xs font-medium text-primary">
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
                className="flex cursor-pointer items-center justify-between rounded-lg border border-surface-border px-3 py-2 text-sm hover:bg-surface-muted"
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={cuotaIds.includes(c.id)}
                    onChange={() => toggleCuota(c.id)}
                    disabled={enviando}
                  />
                  <span>
                    {c.periodo}{" "}
                    <span className="text-xs text-gray-400">(vence {formatDate(c.fechaVencimiento)})</span>
                  </span>
                </span>
                <span className="font-medium text-primary-dark">{formatCurrency(c.monto)}</span>
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
        <div>
          <label className="mb-1 block text-xs text-gray-400">Método de pago</label>
          <select className="input" value={metodo} onChange={(e) => setMetodo(e.target.value)}>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="EFECTIVO">Efectivo</option>
            <option value="MERCADOPAGO">MercadoPago</option>
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