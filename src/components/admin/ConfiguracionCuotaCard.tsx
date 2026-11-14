"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface SocioCandidato {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  idCooperativa: string;
  tieneAnualVigente: boolean;
  mesesRestantes: number;
}

export function ConfiguracionCuotaCard({ montoActual }: { montoActual: number }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [monto, setMonto] = useState(montoActual.toString());
  const [guardando, setGuardando] = useState(false);
  const [generando, setGenerando] = useState<"mensual" | "anual" | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  // Estado del modal buscador para Cuota Anual
  const [modalAnualAbierto, setModalAnualAbierto] = useState(false);
  const [q, setQ] = useState("");
  const [resultados, setResultados] = useState<SocioCandidato[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [socioSeleccionado, setSocioSeleccionado] = useState<SocioCandidato | null>(null);
  const [errorAnual, setErrorAnual] = useState<string | null>(null);

  useEffect(() => {
    if (!modalAnualAbierto || socioSeleccionado) return;
    if (q.trim().length < 2) {
      setResultados([]);
      return;
    }
    setBuscando(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/cuotas/generar-anual?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          setResultados(data);
        }
      } finally {
        setBuscando(false);
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [q, modalAnualAbierto, socioSeleccionado]);

  function cerrarModalAnual() {
    if (generando === "anual") return;
    setModalAnualAbierto(false);
    setQ("");
    setResultados([]);
    setSocioSeleccionado(null);
    setErrorAnual(null);
  }

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
    setGenerando("mensual");
    setMensaje(null);
    const res = await fetch("/api/cuotas/generar-mensual", { method: "POST" });
    setGenerando(null);

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

  async function generarCuotaAnual() {
    if (!socioSeleccionado) return;
    setGenerando("anual");
    setErrorAnual(null);
    setMensaje(null);

    try {
      const res = await fetch("/api/cuotas/generar-anual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ socioId: socioSeleccionado.id }),
      });
      const data = await res.json().catch(() => ({}));
      setGenerando(null);

      if (!res.ok) {
        setErrorAnual(data?.error || "No se pudo generar la cuota anual.");
        return;
      }

      cerrarModalAnual();
      setMensaje(
        `Se generó la cuota anual (${data.mesesRestantes} ${data.mesesRestantes === 1 ? "mes restante" : "meses restantes"} - ${data.periodo}) por ${formatCurrency(data.montoTotal)} para ${data.socio}.`
      );
      router.refresh();
    } catch {
      setGenerando(null);
      setErrorAnual("Error al intentar generar la cuota anual.");
    }
  }

  const mesesACobrar = socioSeleccionado?.mesesRestantes ?? 12;
  const montoTotalAnual = montoActual * mesesACobrar;

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

      <button className="btn-secondary w-full" disabled={generando !== null} onClick={generarCuotaMensual}>
        {generando === "mensual" ? "Generando..." : "Generar cuota del mes para socios activos"}
      </button>
      <button
        className="btn-secondary mt-2 w-full"
        disabled={generando !== null}
        onClick={() => setModalAnualAbierto(true)}
      >
        {generando === "anual" ? "Generando..." : "Generar cuota anual (12 meses) para socio activo"}
      </button>

      {mensaje && <p className="mt-2 text-xs text-gray-500">{mensaje}</p>}

      {modalAnualAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={cerrarModalAnual}
        >
          <div className="card w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <p className="font-medium text-primary-dark">Generar Cuota Anual</p>
              <button
                type="button"
                className="text-gray-400 hover:text-primary-dark"
                onClick={cerrarModalAnual}
              >
                <X size={18} />
              </button>
            </div>

            {!socioSeleccionado ? (
              <>
                <div className="relative mb-3">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    className="input pl-9"
                    autoFocus
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Buscar socio activo por nombre, apellido, DNI o ID..."
                  />
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {buscando && (
                    <p className="py-4 text-center text-sm text-gray-400">Buscando...</p>
                  )}
                  {!buscando && q.trim().length >= 2 && resultados.length === 0 && (
                    <p className="py-4 text-center text-sm text-gray-400">
                      No se encontraron socios activos con ese criterio.
                    </p>
                  )}
                  {!buscando &&
                    resultados.map((socio) => (
                      <button
                        key={socio.id}
                        type="button"
                        disabled={socio.tieneAnualVigente}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => {
                          setSocioSeleccionado(socio);
                          setErrorAnual(null);
                        }}
                      >
                        <div>
                          <p className="font-medium text-primary-dark">
                            {socio.nombre} {socio.apellido}
                          </p>
                          <p className="text-xs text-gray-400">
                            {socio.idCooperativa} • DNI {socio.dni}
                          </p>
                        </div>
                        {socio.tieneAnualVigente ? (
                          <span className="text-xs font-medium text-amber-600">
                            Año completo / Ya tiene anual
                          </span>
                        ) : (
                          <span className="text-xs text-primary font-medium">
                            Seleccionar ({socio.mesesRestantes} {socio.mesesRestantes === 1 ? "mes" : "meses"})
                          </span>
                        )}
                      </button>
                    ))}
                </div>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="mb-3 text-xs text-primary hover:underline"
                  onClick={() => {
                    setSocioSeleccionado(null);
                    setErrorAnual(null);
                  }}
                >
                  ‹ Elegir otro socio
                </button>

                <p className="mb-3 text-sm">
                  <span className="font-medium text-primary-dark">
                    {socioSeleccionado.nombre} {socioSeleccionado.apellido}
                  </span>{" "}
                  <span className="text-gray-400">({socioSeleccionado.idCooperativa})</span>
                </p>

                <div className="mb-4 rounded-lg bg-surface-muted p-3 text-sm text-gray-700 space-y-1">
                  <p>
                    Se generará la cuota anual por los{" "}
                    <strong>
                      {mesesACobrar} {mesesACobrar === 1 ? "mes restante" : "meses restantes"}
                    </strong>{" "}
                    para completar el año, por un total de{" "}
                    <strong>{formatCurrency(montoTotalAnual)}</strong> ({mesesACobrar} ×{" "}
                    {formatCurrency(montoActual)}).
                  </p>
                  <p className="text-xs text-gray-500">
                    Al emplearse esta cuota anual, no se le volverá a generar la cuota del mes a este socio durante el resto del año.
                  </p>
                </div>

                {errorAnual && <p className="mb-3 text-sm text-status-danger">{errorAnual}</p>}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={generando === "anual"}
                    onClick={cerrarModalAnual}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={generando === "anual"}
                    onClick={generarCuotaAnual}
                  >
                    {generando === "anual" ? "Generando..." : "Generar Cuota Anual"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
