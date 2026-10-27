"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building2, CheckCircle2, AlertCircle } from "lucide-react";

interface InformacionCooperativaCardProps {
  cbuInicial: string;
  aliasInicial: string;
}

export function InformacionCooperativaCard({
  cbuInicial,
  aliasInicial,
}: InformacionCooperativaCardProps) {
  const router = useRouter();

  const [nombre, setNombre] = useState("Cooperativa Riojana Limitada");
  const [cuit, setCuit] = useState("30-71000000-9");
  const [cbu, setCbu] = useState(cbuInicial);
  const [alias, setAlias] = useState(aliasInicial);

  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Auto-cierre del cartel verde a los 5 segundos
  useEffect(() => {
    if (!mensajeExito) return;
    const timer = setTimeout(() => {
      setMensajeExito(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [mensajeExito]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setMensajeExito(null);
    setMensajeError(null);

    try {
      const res = await fetch("/api/configuracion", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cbu: cbu.trim() || null,
          alias: alias.trim() || null,
        }),
      });

      setGuardando(false);

      if (!res.ok) {
        setMensajeError("No se pudieron guardar los datos de la cooperativa.");
        return;
      }

      setMensajeExito("¡Datos de la cooperativa y cuenta bancaria guardados exitosamente!");
      router.refresh();
    } catch (err) {
      setGuardando(false);
      setMensajeError("Error de conexión al guardar los datos.");
    }
  }

  return (
    <div className="card">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-3">
          <div className="flex items-center gap-2">
            <Building2 size={20} className="text-primary" />
            <div>
              <p className="font-medium text-primary-dark">Información de la Cooperativa</p>
              <p className="text-xs text-gray-500">
                Datos institucionales y cuenta bancaria para cobros y transferencias de socios.
              </p>
            </div>
          </div>
          <button
            type="submit"
            disabled={guardando}
            className="btn-primary self-start sm:self-auto shrink-0"
          >
            {guardando ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>

        {mensajeExito && (
          <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/80 p-3 text-xs text-emerald-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{mensajeExito}</span>
            </div>
            <button
              type="button"
              onClick={() => setMensajeExito(null)}
              className="font-bold text-emerald-700 hover:text-emerald-900 ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {mensajeError && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <span>{mensajeError}</span>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              Nombre de la Institución
            </label>
            <input
              className="input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre de la Institución"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              CUIT / Identificación Fiscal
            </label>
            <input
              className="input"
              value={cuit}
              onChange={(e) => setCuit(e.target.value)}
              placeholder="CUIT / Identificación Fiscal"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              CBU de la Cooperativa
            </label>
            <input
              className="input font-mono"
              value={cbu}
              onChange={(e) => setCbu(e.target.value)}
              placeholder="0000003100012345678901"
              maxLength={22}
            />
            <p className="mt-1 text-[11px] text-gray-400">
              Se visualiza en "Reportar Pago" cuando el socio selecciona Transferencia.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              Alias de la Cooperativa
            </label>
            <input
              className="input font-mono uppercase"
              value={alias}
              onChange={(e) => setAlias(e.target.value.toUpperCase())}
              placeholder="COOP.RIOJANA.MP"
            />
            <p className="mt-1 text-[11px] text-gray-400">
              Alias de la cuenta para transferencias (CBU / CVU).
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
