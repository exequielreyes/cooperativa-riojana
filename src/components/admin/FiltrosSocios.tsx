"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

export function FiltrosSocios({ regiones }: { regiones: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [region, setRegion] = useState(searchParams.get("region") ?? "");
  const [estado, setEstado] = useState(searchParams.get("estado") ?? "");
  const [edad, setEdad] = useState(searchParams.get("edad") ?? "");
  const [filtroExtra, setFiltroExtra] = useState(searchParams.get("filtroExtra") ?? "");
  const primerRender = useRef(true);

  function actualizarUrl(next: { q: string; region: string; estado: string; edad: string; filtroExtra: string }) {
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.region) params.set("region", next.region);
    if (next.estado) params.set("estado", next.estado);
    if (next.edad) params.set("edad", next.edad);
    if (next.filtroExtra) params.set("filtroExtra", next.filtroExtra);
    params.set("page", "1");

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    const timeout = setTimeout(() => actualizarUrl({ q, region, estado, edad, filtroExtra }), 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function onRegionChange(value: string) {
    setRegion(value);
    actualizarUrl({ q, region: value, estado, edad, filtroExtra });
  }

  function onEstadoChange(value: string) {
    setEstado(value);
    actualizarUrl({ q, region, estado: value, edad, filtroExtra });
  }

  function onEdadChange(value: string) {
    setEdad(value);
    actualizarUrl({ q, region, estado, edad: value, filtroExtra });
  }

  function onFiltroExtraChange(value: string) {
    setFiltroExtra(value);
    actualizarUrl({ q, region, estado, edad, filtroExtra: value });
  }

  function limpiarFiltros() {
    setQ("");
    setRegion("");
    setEstado("");
    setEdad("");
    setFiltroExtra("");
    actualizarUrl({ q: "", region: "", estado: "", edad: "", filtroExtra: "" });
  }

  function toggleEstado(nuevoEstado: string) {
    // Si hace clic en INACTIVO y ya estaba en un sub-estado inactivo, lo pasa a INACTIVO general
    // Si ya era exactamente ese estado, lo desmarca (pasa a "")
    const esInactivoSeleccionado =
      nuevoEstado === "INACTIVO" && estado.startsWith("INACTIVO");

    if (estado === nuevoEstado) {
      onEstadoChange("");
    } else if (esInactivoSeleccionado && estado !== "INACTIVO") {
      onEstadoChange("INACTIVO");
    } else {
      onEstadoChange(nuevoEstado);
    }
  }

  function toggleFiltroExtra(filtro: string) {
    if (filtroExtra === filtro) {
      onFiltroExtraChange("");
    } else {
      onFiltroExtraChange(filtro);
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Filtros y Búsqueda
        </h3>
        {(q || region || estado || edad || filtroExtra) && (
          <button
            onClick={limpiarFiltros}
            className="text-sm font-medium text-primary hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* SEARCH AND DROPDOWNS */}
      <div className="mb-4 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            className="input w-full pl-9 pr-9"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre, ID cooperativa o email..."
          />
          {isPending && (
            <Loader2
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
            />
          )}
        </div>

        <div className="relative md:w-48">
          <select
            className="input w-full pl-9"
            value={region}
            onChange={(e) => onRegionChange(e.target.value)}
          >
            <option value="">Todas las Regiones</option>
            {regiones.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>

        <div className="relative md:w-48">
          <select
            className="input w-full pl-9"
            value={edad}
            onChange={(e) => onEdadChange(e.target.value)}
          >
            <option value="">Todas las Edades</option>
            <option value="18-25">18 a 25 años</option>
            <option value="26-35">26 a 35 años</option>
            <option value="36-50">36 a 50 años</option>
            <option value="50+">50+ años</option>
          </select>
          <svg
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      </div>

      {/* PILLS ROW */}
      <div className="flex flex-col gap-4 border-t border-gray-100 pt-4 lg:flex-row lg:items-center lg:justify-between">
        {/* ESTADOS */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-2 text-sm font-medium text-gray-500">Estado:</span>
          
          <button
            onClick={() => toggleEstado("")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              estado === ""
                ? "bg-[#0f4c4c] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Todos
          </button>
          
          <button
            onClick={() => toggleEstado("ACTIVO")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              estado === "ACTIVO"
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Activo
          </button>
          
          <button
            onClick={() => toggleEstado("PENDIENTE")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              estado === "PENDIENTE"
                ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Pendiente
          </button>
          
          <button
            onClick={() => toggleEstado("INACTIVO")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              estado.startsWith("INACTIVO")
                ? "bg-gray-200 text-gray-800 border border-gray-300"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" x2="22" y1="8" y2="13"/><line x1="22" x2="17" y1="8" y2="13"/></svg>
            Inactivo
          </button>
        </div>

        {/* EXTRAS */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => toggleFiltroExtra("cumpleanos_mes")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              filtroExtra === "cumpleanos_mes"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/></svg>
            Cumpleaños este mes
          </button>
          
          <button
            onClick={() => toggleFiltroExtra("nuevos")}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
              filtroExtra === "nuevos"
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M3 5h4"/></svg>
            Nuevos (30 días)
          </button>
        </div>
      </div>

      {/* SUB-ESTADOS INACTIVOS (Opcional, se muestra si eligen inactivo) */}
      {estado.startsWith("INACTIVO") && (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg bg-gray-50 p-3">
          <span className="text-xs text-gray-500 mr-2">Motivo de baja:</span>
          <button
            onClick={() => toggleEstado("INACTIVO_FALLECIMIENTO")}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              estado === "INACTIVO_FALLECIMIENTO"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            Fallecidos
          </button>
          <button
            onClick={() => toggleEstado("INACTIVO_FALTA_PAGO")}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              estado === "INACTIVO_FALTA_PAGO"
                ? "bg-orange-50 text-orange-700 border-orange-200"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            Falta de Pagos
          </button>
          <button
            onClick={() => toggleEstado("INACTIVO_BAJA")}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              estado === "INACTIVO_BAJA"
                ? "bg-gray-100 text-gray-800 border-gray-300"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            Baja Voluntaria
          </button>
        </div>
      )}
    </div>
  );
}
