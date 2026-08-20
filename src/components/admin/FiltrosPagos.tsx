"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Loader2 } from "lucide-react";

export function FiltrosPagos() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [estado, setEstado] = useState(searchParams.get("estado") ?? "");
  const [metodo, setMetodo] = useState(searchParams.get("metodo") ?? "");
  const primerRender = useRef(true);

  // Construye la URL siempre desde el estado local (q, estado, metodo),
  // nunca leyendo de searchParams -> evita mezclar un texto recién tipeado
  // con un select que navega de inmediato.
  function actualizarUrl(next: { q: string; estado: string; metodo: string }) {
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.estado) params.set("estado", next.estado);
    if (next.metodo) params.set("metodo", next.metodo);

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  // Búsqueda por texto: se dispara sola con un pequeño debounce.
  useEffect(() => {
    if (primerRender.current) {
      primerRender.current = false;
      return;
    }
    const timeout = setTimeout(() => actualizarUrl({ q, estado, metodo }), 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function onEstadoChange(value: string) {
    setEstado(value);
    actualizarUrl({ q, estado: value, metodo });
  }

  function onMetodoChange(value: string) {
    setMetodo(value);
    actualizarUrl({ q, estado, metodo: value });
  }

  return (
    <div className="mb-4 flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[220px]">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-9 pr-9"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, apellido, ID o email del socio..."
        />
        {isPending && (
          <Loader2
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
          />
        )}
      </div>
      <select
        className="input w-auto"
        value={estado}
        onChange={(e) => onEstadoChange(e.target.value)}
      >
        <option value="">Todos los Estados</option>
        <option value="PENDIENTE_REVISION">Pendiente</option>
        <option value="APROBADO">Completado</option>
        <option value="RECHAZADO">Rechazado</option>
      </select>
      <select
        className="input w-auto"
        value={metodo}
        onChange={(e) => onMetodoChange(e.target.value)}
      >
        <option value="">Todos los Métodos</option>
        <option value="TRANSFERENCIA">Transferencia</option>
        <option value="EFECTIVO">Efectivo</option>
        <option value="MERCADOPAGO">MercadoPago</option>
      </select>
    </div>
  );
}
