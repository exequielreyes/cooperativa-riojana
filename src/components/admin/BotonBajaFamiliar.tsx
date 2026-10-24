"use client";

import { useState } from "react";
import { UserMinus, AlertCircle, History } from "lucide-react";

interface FamiliarItem {
  id: string;
  nombre: string;
  apellido: string;
  dni: string | null;
  parentesco: string;
  email: string | null;
  telefono: string | null;
  activo?: boolean;
  motivoBaja?: string | null;
  fechaBaja?: string | Date | null;
}

export function BotonBajaFamiliar({
  familiar,
  onBajaSuccess,
}: {
  familiar: FamiliarItem;
  onBajaSuccess?: () => void;
}) {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [motivoBaja, setMotivoBaja] = useState("Baja voluntaria");
  const [otroMotivo, setOtroMotivo] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirmarBaja() {
    setEnviando(true);
    setError(null);

    const motivoFinal = motivoBaja === "OTRO" ? (otroMotivo.trim() || "Otro motivo") : motivoBaja;

    try {
      const res = await fetch(`/api/grupo-familiar/${familiar.id}/baja`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivoBaja: motivoFinal }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const mensaje =
          typeof data.error === "string"
            ? data.error
            : data.error?.formErrors?.[0] ||
              (data.error?.fieldErrors && (Object.values(data.error.fieldErrors)[0] as any)?.[0]) ||
              "No se pudo registrar la baja.";
        throw new Error(mensaje);
      }

      setModalAbierto(false);
      if (onBajaSuccess) {
        onBajaSuccess();
      } else {
        window.location.reload();
      }
    } catch (err: any) {
      setError(err.message || "Error al procesar la baja");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setModalAbierto(true);
          setMotivoBaja("Baja voluntaria");
          setOtroMotivo("");
          setError(null);
        }}
        className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
      >
        <UserMinus size={13} />
        Dar de baja / Egreso
      </button>

      {modalAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => !enviando && setModalAbierto(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  Registrar egreso de familiar adherente
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Estás por registrar la baja de{" "}
                  <strong>
                    {familiar.nombre} {familiar.apellido}
                  </strong>{" "}
                  ({familiar.parentesco}).
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 leading-relaxed">
              <strong>Garantía del sistema:</strong> Esta baja no da de baja al socio titular ni al resto del grupo familiar. Los datos personales del adherente se conservarán como registro histórico.
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Motivo del egreso *
              </label>
              <select
                value={motivoBaja}
                onChange={(e) => setMotivoBaja(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-rose-500 focus:outline-none"
                disabled={enviando}
              >
                <option value="Baja voluntaria">Baja voluntaria</option>
                <option value="Fallecimiento">Fallecimiento</option>
                <option value="OTRO">Otro motivo</option>
              </select>

              {motivoBaja === "OTRO" && (
                <input
                  type="text"
                  placeholder="Detalle el motivo del egreso"
                  value={otroMotivo}
                  onChange={(e) => setOtroMotivo(e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-rose-500 focus:outline-none"
                  disabled={enviando}
                  autoFocus
                />
              )}
            </div>

            {error && (
              <p className="rounded bg-rose-50 border border-rose-200 p-2 text-xs text-rose-600">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                onClick={() => setModalAbierto(false)}
                disabled={enviando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                onClick={handleConfirmarBaja}
                disabled={enviando}
              >
                {enviando ? "Registrando..." : "Confirmar Egreso"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
