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

export function ReportarPagoForm({ cuota, datosTransferencia }: { cuota: Cuota; datosTransferencia: DatosTransferencia }) {
  const router = useRouter();
  const [archivo, setArchivo] = useState<File | null>(null);
  const [metodo, setMetodo] = useState("TRANSFERENCIA");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!archivo) {
      setError("Adjuntá el comprobante antes de continuar.");
      return;
    }
    setError(null);
    setEnviando(true);

    const formData = new FormData();
    formData.append("cuotaId", cuota.id);
    formData.append("metodo", metodo);
    formData.append("comprobante", archivo);

    const res = await fetch("/api/pagos", {
      method: "POST",
      body: formData,
    });

    setEnviando(false);

    if (!res.ok) {
      setError("No se pudo registrar el pago. Intentá de nuevo.");
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
            Tu comprobante quedó en revisión. Te avisaremos cuando sea validado.
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

      <div className="card mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400">Cuota {cuota.periodo}</p>
          <p className="text-xs text-gray-400">Vencimiento: {formatDate(cuota.fechaVencimiento)}</p>
        </div>
        <p className="text-lg font-semibold text-primary-dark">{formatCurrency(cuota.monto)}</p>
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
