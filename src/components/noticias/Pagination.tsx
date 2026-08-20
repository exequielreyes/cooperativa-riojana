import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  paginaActual: number;
  totalPaginas: number;
  basePath: string;
};

/**
 * Genera el listado de números de página a mostrar, colapsando con "…"
 * cuando hay muchas páginas. Ej: 1 … 4 5 [6] 7 8 … 12
 */
function getPageRange(paginaActual: number, totalPaginas: number): (number | "...")[] {
  const delta = 1;
  const range: (number | "...")[] = [];
  const start = Math.max(2, paginaActual - delta);
  const end = Math.min(totalPaginas - 1, paginaActual + delta);

  range.push(1);
  if (start > 2) range.push("...");
  for (let i = start; i <= end; i++) range.push(i);
  if (end < totalPaginas - 1) range.push("...");
  if (totalPaginas > 1) range.push(totalPaginas);

  return range;
}

function pageHref(basePath: string, page: number) {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

export function Pagination({ paginaActual, totalPaginas, basePath }: PaginationProps) {
  if (totalPaginas <= 1) return null;

  const paginas = getPageRange(paginaActual, totalPaginas);

  return (
    <nav
      aria-label="Paginación de noticias"
      className="mt-12 flex items-center justify-center gap-2"
    >
      <Link
        href={pageHref(basePath, paginaActual - 1)}
        aria-disabled={paginaActual === 1}
        className={`flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border text-gray-500 transition-colors hover:bg-surface-muted ${
          paginaActual === 1 ? "pointer-events-none opacity-40" : ""
        }`}
      >
        <ChevronLeft size={16} />
      </Link>

      {paginas.map((p, idx) =>
        p === "..." ? (
          <span key={`dots-${idx}`} className="px-1 text-sm text-gray-400">
            …
          </span>
        ) : (
          <Link
            key={p}
            href={pageHref(basePath, p)}
            aria-current={p === paginaActual ? "page" : undefined}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              p === paginaActual
                ? "bg-primary text-white"
                : "border border-surface-border text-gray-600 hover:bg-surface-muted"
            }`}
          >
            {p}
          </Link>
        )
      )}

      <Link
        href={pageHref(basePath, paginaActual + 1)}
        aria-disabled={paginaActual === totalPaginas}
        className={`flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border text-gray-500 transition-colors hover:bg-surface-muted ${
          paginaActual === totalPaginas ? "pointer-events-none opacity-40" : ""
        }`}
      >
        <ChevronRight size={16} />
      </Link>
    </nav>
  );
}
