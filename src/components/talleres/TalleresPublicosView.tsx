"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface TallerPublico {
  id: string;
  slug: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  fecha: string;
  imagenUrl: string | null;
  cuposTotales: number;
  cuposOcupados: number;
}

interface TalleresPublicosViewProps {
  talleres: TallerPublico[];
}

const PAGE_SIZE = 6;

export function TalleresPublicosView({ talleres }: TalleresPublicosViewProps) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("Todas");
  const [pagina, setPagina] = useState(1);

  // Categorías disponibles (base estándar + cualquier categoría existente en la BD)
  const categorias = useMemo(() => {
    const base = ["Todas", "Salud", "Educación", "Cultura", "Social", "Técnico"];
    talleres.forEach((t) => {
      if (t.categoria && !base.some((b) => b.toLowerCase() === t.categoria.toLowerCase())) {
        base.push(t.categoria);
      }
    });
    return base;
  }, [talleres]);

  // Filtrado por categoría
  const talleresFiltrados = useMemo(() => {
    if (categoriaSeleccionada === "Todas") return talleres;
    return talleres.filter(
      (t) => t.categoria.trim().toLowerCase() === categoriaSeleccionada.trim().toLowerCase()
    );
  }, [talleres, categoriaSeleccionada]);

  // Paginación (6 cursos por página)
  const total = talleresFiltrados.length;
  const totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginaActual = Math.min(pagina, totalPaginas);

  const talleresPaginados = useMemo(() => {
    return talleresFiltrados.slice((paginaActual - 1) * PAGE_SIZE, paginaActual * PAGE_SIZE);
  }, [talleresFiltrados, paginaActual]);

  function cambiarCategoria(cat: string) {
    setCategoriaSeleccionada(cat);
    setPagina(1);
  }

  function irAPagina(p: number) {
    setPagina(p);
    window.scrollTo({ top: 180, behavior: "smooth" });
  }

  return (
    <div>
      {/* FILTROS POR CATEGORÍA */}
      <div className="mb-12 flex flex-wrap items-center justify-center gap-2">
        {categorias.map((cat) => {
          const activa = categoriaSeleccionada.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              type="button"
              onClick={() => cambiarCategoria(cat)}
              className={`rounded-full px-5 py-2 text-xs font-semibold transition-all shadow-2xs ${
                activa
                  ? "bg-primary text-white shadow-sm ring-2 ring-primary/20"
                  : "bg-white text-slate-600 border border-gray-200 hover:border-primary/40 hover:bg-emerald-50/40 hover:text-primary"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* MENSAJE CUANDO NO HAY TALLERES */}
      {total === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-sm text-gray-500">
          <p>No hay talleres disponibles en la categoría "{categoriaSeleccionada}".</p>
          {categoriaSeleccionada !== "Todas" && (
            <button
              type="button"
              onClick={() => cambiarCategoria("Todas")}
              className="mt-3 inline-block font-semibold text-primary hover:underline"
            >
              Ver todos los talleres
            </button>
          )}
        </div>
      ) : (
        <>
          {/* GRILLA DE TARJETAS (6 POR PÁGINA, 3 COLUMNAS) */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {talleresPaginados.map((taller) => {
              const cuposDisponibles = taller.cuposTotales - taller.cuposOcupados;

              return (
                <div
                  key={taller.id || taller.slug}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:shadow-md"
                >
                  {/* IMAGEN DEL TALLER CON BADGE DE CATEGORÍA */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
                    <Image
                      src={
                        taller.imagenUrl ||
                        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop"
                      }
                      alt={taller.titulo}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 z-10">
                      <span className="rounded-md bg-white/95 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-800 shadow-sm backdrop-blur">
                        {taller.categoria}
                      </span>
                    </div>
                  </div>

                  {/* CONTENIDO DE LA TARJETA */}
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 leading-snug">
                        {taller.titulo}
                      </h2>

                      <p className="mt-3 text-xs leading-relaxed text-gray-500 line-clamp-3">
                        {taller.descripcion}
                      </p>

                      {/* METADATOS: FECHA Y CUPOS */}
                      <div className="mt-6 space-y-2 text-xs font-medium text-gray-400">
                        <p className="flex items-center gap-2">
                          📅{" "}
                          <span>
                            Inicia:{" "}
                            {new Intl.DateTimeFormat("es-AR", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                            }).format(new Date(taller.fecha))}
                          </span>
                        </p>
                        <p className="flex items-center gap-2">
                          👥{" "}
                          <span
                            className={
                              cuposDisponibles <= 0 ? "text-red-500 font-semibold" : ""
                            }
                          >
                            {cuposDisponibles > 0
                              ? `Cupos disponibles: ${cuposDisponibles}`
                              : "Cupos agotados"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* BOTÓN VER DETALLES */}
                    <div className="mt-8">
                      <Link
                        href={`/talleres/${taller.slug}`}
                        className="block w-full rounded-lg bg-primary py-3 text-center text-xs font-semibold text-white shadow-sm transition-all hover:bg-primary-dark"
                      >
                        Ver Detalles ›
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINACIÓN OFICIAL DEL SISTEMA (6 por página) */}
          {totalPaginas > 1 && (
            <div className="mt-12 flex flex-col items-center justify-center gap-3">
              <nav aria-label="Paginación de talleres" className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => irAPagina(Math.max(1, paginaActual - 1))}
                  disabled={paginaActual === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border text-gray-500 transition-colors hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-40"
                  aria-label="Página anterior"
                >
                  <ChevronLeft size={16} />
                </button>

                {(() => {
                  const delta = 1;
                  const range: (number | "...")[] = [];
                  const start = Math.max(2, paginaActual - delta);
                  const end = Math.min(totalPaginas - 1, paginaActual + delta);

                  range.push(1);
                  if (start > 2) range.push("...");
                  for (let i = start; i <= end; i++) range.push(i);
                  if (end < totalPaginas - 1) range.push("...");
                  if (totalPaginas > 1) range.push(totalPaginas);

                  return range.map((p, idx) =>
                    p === "..." ? (
                      <span key={`dots-${idx}`} className="px-1 text-sm text-gray-400">
                        …
                      </span>
                    ) : (
                      <button
                        type="button"
                        key={p}
                        onClick={() => irAPagina(p as number)}
                        aria-current={p === paginaActual ? "page" : undefined}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          p === paginaActual
                            ? "bg-primary text-white"
                            : "border border-surface-border text-gray-600 hover:bg-surface-muted"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  );
                })()}

                <button
                  type="button"
                  onClick={() => irAPagina(Math.min(totalPaginas, paginaActual + 1))}
                  disabled={paginaActual === totalPaginas}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border text-gray-500 transition-colors hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-40"
                  aria-label="Página siguiente"
                >
                  <ChevronRight size={16} />
                </button>
              </nav>

              <span className="text-xs text-gray-400">
                Página {paginaActual} de {totalPaginas} ({total} talleres en total)
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
}
