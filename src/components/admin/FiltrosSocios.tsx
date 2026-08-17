"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search } from "lucide-react";

export function FiltrosSocios({ regiones }: { regiones: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const primerRender = useRef(true);

  function actualizarUrl(overrides: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(overrides).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  // Búsqueda por texto: se dispara sola con un pequeño debounce.
  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    const timeout = setTimeout(() => actualizarUrl({ q }), 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[220px]">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-9"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, ID o email..."
        />
      </div>
      <select
        className="input w-auto"
        defaultValue={searchParams.get("region") ?? ""}
        onChange={(e) => actualizarUrl({ region: e.target.value })}
      >
        <option value="">Todas las Regiones</option>
        {regiones.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>
      <select
        className="input w-auto"
        defaultValue={searchParams.get("estado") ?? ""}
        onChange={(e) => actualizarUrl({ estado: e.target.value })}
      >
        <option value="">Todos los Estados</option>
        <option value="ACTIVO">Activo</option>
        <option value="PENDIENTE">Pendiente</option>
        <option value="INACTIVO">Inactivo</option>
      </select>
    </div>
  );
}
