import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface AdminPaginationProps {
  page: number;
  totalPaginas: number;
  totalItems: number;
  pageSize: number;
  itemLabel?: string;
  basePath?: string;
}

export function AdminPagination({
  page,
  totalPaginas,
  totalItems,
  pageSize,
  itemLabel = "elementos",
  basePath = "",
}: AdminPaginationProps) {
  if (totalPaginas <= 1 && totalItems <= pageSize) return null;

  function getHref(p: number) {
    if (basePath) {
      return p <= 1 ? basePath : `${basePath}?page=${p}`;
    }
    return p <= 1 ? "?" : `?page=${p}`;
  }

  const desde = (page - 1) * pageSize + 1;
  const hasta = Math.min(page * pageSize, totalItems);

  const delta = 1;
  const range: (number | "...")[] = [];
  const start = Math.max(2, page - delta);
  const end = Math.min(totalPaginas - 1, page + delta);

  range.push(1);
  if (start > 2) range.push("...");
  for (let i = start; i <= end; i++) range.push(i);
  if (end < totalPaginas - 1) range.push("...");
  if (totalPaginas > 1) range.push(totalPaginas);

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-surface-border px-6 py-4 sm:flex-row">
      <span className="text-sm text-gray-500">
        Mostrando {desde}-{hasta} de {totalItems} {itemLabel}
      </span>
      <nav aria-label="Paginación" className="flex items-center gap-2">
        <Link
          href={getHref(Math.max(1, page - 1))}
          aria-disabled={page === 1}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border text-gray-500 transition-colors hover:bg-surface-muted ${
            page === 1 ? "pointer-events-none opacity-40" : ""
          }`}
          aria-label="Página anterior"
        >
          <ChevronLeft size={16} />
        </Link>

        {range.map((p, idx) =>
          p === "..." ? (
            <span key={`dots-${idx}`} className="px-1 text-sm text-gray-400">
              …
            </span>
          ) : (
            <Link
              key={p}
              href={getHref(p as number)}
              aria-current={p === page ? "page" : undefined}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? "bg-primary text-white"
                  : "border border-surface-border text-gray-600 hover:bg-surface-muted"
              }`}
            >
              {p}
            </Link>
          )
        )}

        <Link
          href={getHref(Math.min(totalPaginas, page + 1))}
          aria-disabled={page === totalPaginas}
          className={`flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border text-gray-500 transition-colors hover:bg-surface-muted ${
            page === totalPaginas ? "pointer-events-none opacity-40" : ""
          }`}
          aria-label="Página siguiente"
        >
          <ChevronRight size={16} />
        </Link>
      </nav>
    </div>
  );
}
