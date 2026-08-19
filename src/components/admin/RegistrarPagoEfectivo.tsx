"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface CuotaPendiente {
  id: string;
  periodo: string;
  monto: number;
  fechaVencimiento: string;
}

interface SocioConDeuda {
  id: string;
  nombre: string;
  apellido: string;
  idCooperativa: string;
  cuotas: CuotaPendiente[];
}

export function RegistrarPagoEfectivo() {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [q, setQ] = useState("");
  const [resultados, setResultados] = useState<SocioConDeuda[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [socioSeleccionado, setSocioSeleccionado] = useState<SocioConDeuda | null>(null);
  const [cuotaId, setCuotaId] = useState("");
  const [registrando, setRegistrando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Búsqueda con debounce mientras no haya un socio seleccionado todavía.
  useEffect(() => {
    if (!abierto || socioSeleccionado) return;
    if (q.trim().length < 2) {
      setResultados([]);
      return;
    }
    setBuscando(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/socios/deudores?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setResultados(data);
      } finally {
        setBuscando(false);
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [q, abierto, socioSeleccionado]);

  function cerrar() {
    setAbierto(false);
    setQ("");
    setResultados([]);
    setSocioSeleccionado(null);
    setCuotaId("");
    setError(null);
  }

  function seleccionarSocio(socio: SocioConDeuda) {
    setSocioSeleccionado(socio);
    setCuotaId(socio.cuotas[0]?.id ?? "");
  }

  async function registrar() {
    if (!cuotaId) return;
    setRegistrando(true);
    setError(null);
    const res = await fetch(`/api/cuotas/${cuotaId}/marcar-pagado`, { method: "POST" });
    setRegistrando(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "No se pudo registrar el pago.");
      return;
    }
    cerrar();
    router.refresh();
  }

  const cuotaSeleccionada = socioSeleccionado?.cuotas.find((c) => c.id === cuotaId);

  return (
    <>
      <button className="btn-secondary" onClick={() => setAbierto(true)}>
        + Registrar Pago en Efectivo
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={cerrar}>
          <div className="card w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <p className="font-medium text-primary-dark">Registrar Pago en Efectivo</p>
              <button className="text-gray-400 hover:text-primary-dark" onClick={cerrar}>
                <X size={18} />
              </button>
            </div>

            {!socioSeleccionado ? (
              <>
                <div className="relative mb-3">
                  <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    className="input pl-9"
                    autoFocus
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Buscar socio por nombre, apellido, DNI o ID..."
                  />
                </div>

                <div className="max-h-64 overflow-y-auto">
                  {buscando && <p className="py-4 text-center text-sm text-gray-400">Buscando...</p>}
                  {!buscando && q.trim().length >= 2 && resultados.length === 0 && (
                    <p className="py-4 text-center text-sm text-gray-400">
                      No se encontraron socios activos con cuotas pendientes.
                    </p>
                  )}
                  {!buscando &&
                    resultados.map((socio) => (
                      <button
                        key={socio.id}
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm hover:bg-surface-muted"
                        onClick={() => seleccionarSocio(socio)}
                      >
                        <div>
                          <p className="font-medium text-primary-dark">
                            {socio.nombre} {socio.apellido}
                          </p>
                          <p className="text-xs text-gray-400">{socio.idCooperativa}</p>
                        </div>
                        <span className="text-xs text-gray-400">{socio.cuotas.length} cuota(s)</span>
                      </button>
                    ))}
                </div>
              </>
            ) : (
              <>
                <button
                  className="mb-3 text-xs text-primary hover:underline"
                  onClick={() => {
                    setSocioSeleccionado(null);
                    setCuotaId("");
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

                <label className="mb-1 block text-xs text-gray-400">Cuota a registrar</label>
                <select className="input mb-4" value={cuotaId} onChange={(e) => setCuotaId(e.target.value)}>
                  {socioSeleccionado.cuotas.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.periodo} — {formatCurrency(c.monto)} (vence {formatDate(c.fechaVencimiento)})
                    </option>
                  ))}
                </select>

                {cuotaSeleccionada && (
                  <div className="mb-4 rounded-lg bg-surface-muted p-3 text-sm">
                    Vas a registrar <strong>{formatCurrency(cuotaSeleccionada.monto)}</strong> como pagado en
                    efectivo por {socioSeleccionado.nombre} {socioSeleccionado.apellido}.
                  </div>
                )}

                {error && <p className="mb-3 text-sm text-status-danger">{error}</p>}

                <button className="btn-primary w-full" disabled={registrando || !cuotaId} onClick={registrar}>
                  {registrando ? "Registrando..." : "Confirmar Pago en Efectivo"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}