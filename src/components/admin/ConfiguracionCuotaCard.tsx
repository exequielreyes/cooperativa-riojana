"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

export function ConfiguracionCuotaCard({ montoActual }: { montoActual: number }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [monto, setMonto] = useState(montoActual.toString());
  const [guardando, setGuardando] = useState(false);
  const [generando, setGenerando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function guardarMonto() {
    setGuardando(true);
    const res = await fetch("/api/configuracion", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ montoCuotaActual: monto }),
    });
    setGuardando(false);
    if (res.ok) {
      setEditando(false);
      router.refresh();
    }
  }

  async function generarCuotaMensual() {
    setGenerando(true);
    setMensaje(null);
    const res = await fetch("/api/cuotas/generar-mensual", { method: "POST" });
    setGenerando(false);

    if (!res.ok) {
      setMensaje("No se pudo generar la cuota.");
      return;
    }
    const data = await res.json();
    setMensaje(
      data.generadas > 0
        ? `Se generó la cuota de ${data.periodo} para ${data.generadas} socio(s).`
        : `Todos los socios activos ya tenían la cuota de ${data.periodo}.`
    );
    router.refresh();
  }

  return (
    <div className="card">
      <p className="mb-3 font-medium text-primary-dark">Cuota Social</p>

      {editando ? (
        <div className="mb-4 flex items-center gap-2">
          <input
            className="input"
            type="number"
            min={0}
            step="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
          />
          <button className="btn-primary" disabled={guardando} onClick={guardarMonto}>
            {guardando ? "..." : "Guardar"}
          </button>
          <button className="btn-secondary" onClick={() => setEditando(false)}>
            Cancelar
          </button>
        </div>
      ) : (
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xl font-semibold text-primary-dark">{formatCurrency(montoActual)}</p>
          <button className="text-sm text-primary hover:underline" onClick={() => setEditando(true)}>
            Actualizar Monto
          </button>
        </div>
      )}

      <button className="btn-secondary w-full" disabled={generando} onClick={generarCuotaMensual}>
        {generando ? "Generando..." : "Generar cuota del mes para socios activos"}
      </button>

      {mensaje && <p className="mt-2 text-xs text-gray-500">{mensaje}</p>}
    </div>
  );
}
