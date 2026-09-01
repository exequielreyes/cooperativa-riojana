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
  const primerRender = useRef(true);

  // Siempre construye la URL a partir del estado local (q, region, estado),
  // nunca leyendo de searchParams -> evita el race condition entre el texto
  // recién tipeado y los selects que navegan de inmediato.
  function actualizarUrl(next: { q: string; region: string; estado: string }) {
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.region) params.set("region", next.region);
    if (next.estado) params.set("estado", next.estado);
    params.set("page", "1");

    startTransition(() => {
      // replace (no push) para no ensuciar el historial en cada tecleo,
      // y scroll:false para no saltar al top de la página en cada búsqueda.
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  // Búsqueda por texto: se dispara sola con un pequeño debounce.
  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    const timeout = setTimeout(() => actualizarUrl({ q, region, estado }), 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function onRegionChange(value: string) {
    setRegion(value);
    actualizarUrl({ q, region: value, estado });
  }

  function onEstadoChange(value: string) {
    setEstado(value);
    actualizarUrl({ q, region, estado: value });
  }

  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[220px]">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-9 pr-9"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, ID o email..."
        />
        {isPending && (
          <Loader2
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
          />
        )}
      </div>
      <div className="flex gap-2">
        <select
          className="input w-auto"
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
        <select
          className="input w-auto"
          value={estado}
          onChange={(e) => onEstadoChange(e.target.value)}
        >
          <option value="">Todos los Estados</option>
          <option value="ACTIVO">Activo</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="INACTIVO">Inactivo (Todos)</option>
        </select>
      </div>

      <div className="flex w-full gap-2 mt-2">
        <span className="text-sm text-gray-500 py-1.5">Filtros rápidos de bajas:</span>
        <button
          onClick={() => onEstadoChange("INACTIVO_FALLECIMIENTO")}
          className={`px-3 py-1 text-sm rounded-full border ${estado === "INACTIVO_FALLECIMIENTO" ? "bg-red-50 text-red-700 border-red-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
        >
          Fallecidos
        </button>
        <button
          onClick={() => onEstadoChange("INACTIVO_FALTA_PAGO")}
          className={`px-3 py-1 text-sm rounded-full border ${estado === "INACTIVO_FALTA_PAGO" ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
        >
          Falta de Pagos
        </button>
        <button
          onClick={() => onEstadoChange("INACTIVO_BAJA")}
          className={`px-3 py-1 text-sm rounded-full border ${estado === "INACTIVO_BAJA" ? "bg-gray-100 text-gray-800 border-gray-300" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}
        >
          Baja Voluntaria
        </button>
        {["INACTIVO_FALLECIMIENTO", "INACTIVO_FALTA_PAGO", "INACTIVO_BAJA"].includes(estado) && (
          <button
            onClick={() => onEstadoChange("")}
            className="px-3 py-1 text-sm text-gray-400 hover:text-gray-600"
          >
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
