"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils";

export function ConfiguracionCapitalCard({ montoActual }: { montoActual: number }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [monto, setMonto] = useState(montoActual.toString());
  const [guardando, setGuardando] = useState(false);

  async function guardarMonto() {
    setGuardando(true);
    const res = await fetch("/api/configuracion", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ montoCapitalActual: monto }),
    });
    setGuardando(false);
    if (res.ok) {
      setEditando(false);
      router.refresh();
    }
  }

  return (
    <div className="card mt-6">
      <p className="mb-3 font-medium text-primary-dark">Cuota de Asociación (Capital)</p>

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
      <p className="text-xs text-gray-500">
        Este monto se usa como referencia cuando un nuevo socio se registra. 
        Si lo actualizas, los socios existentes no se verán afectados.
      </p>
    </div>
  );
}