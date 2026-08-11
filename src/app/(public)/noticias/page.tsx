import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";


// Función auxiliar para calcular tiempo de lectura aproximado
function getReadingTime(text: string): string {
  const wordsPerMinute = 200;
  const words = text ? text.trim().split(/\s+/).length : 0;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes || 1} min`;
}




export default async function NoticiasPage() {
  const noticias = await prisma.noticia.findMany({
    where: { estado: "PUBLICADO" },
    orderBy: { fechaPublicacion: "desc" },
  });


 const noticiaDestacada = noticias[0];
  const restoNoticias = noticias.slice(1);



  return (
    <div className="bg-surface-muted/30 min-h-screen py-12">
      <div className="mx-auto max-w-6xl px-6">
        
        {/* ENCABEZADO DE LA PÁGINA */}
        <div className="mb-10">
          <span className="inline-block rounded-md bg-emerald-100/60 px-2.5 py-1 text-xs font-semibold text-emerald-800">
            Actualidad Cooperativa
          </span>
          <h1 className="mt-3 text-4xl font-extrabold text-slate-900">
            Noticias y <span className="text-primary">Novedades</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500 max-w-2xl">
            Manténgase informado sobre las últimas actividades, proyectos y logros de nuestra comunidad productiva.
          </p>
        </div>

        {noticias.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-sm text-gray-500">
            Todavía no hay noticias publicadas.
          </div>
        ) : (
          <>
            {/* NOTICIA DESTACADA (HERO CARD) */}
            {noticiaDestacada && (
              <div className="mb-12 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md">
                <div className="grid gap-0 md:grid-cols-12 md:items-center">
                  
                  {/* Imagen Grande */}
                  <div className="relative aspect-[16/10] w-full md:col-span-7 md:h-full">
                    <Image
                      src={
                        noticiaDestacada.imagenUrl ||
                        "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop"
                      }
                      alt={noticiaDestacada.titulo}
                      fill
                      sizes="(max-width: 768px) 100vw, 60vw"
                      className="object-cover"
                      priority
                    />
                  </div>

                  {/* Contenido Destacado */}
                  <div className="p-8 md:col-span-5 md:p-10 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="rounded-full bg-primary px-3 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
                          Destacado
                        </span>
                        <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-600 uppercase tracking-wider">
                          {noticiaDestacada.categoria}
                        </span>
                      </div>

                      <h2 className="text-2xl font-bold leading-tight text-slate-900 md:text-3xl">
                        {noticiaDestacada.titulo}
                      </h2>

                      <p className="mt-4 text-sm leading-relaxed text-gray-600 line-clamp-3">
                        {noticiaDestacada.contenido}
                      </p>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-6">
                      <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                        <span className="flex items-center gap-1">
                          📅 {noticiaDestacada.fechaPublicacion ? formatDate(noticiaDestacada.fechaPublicacion) : ""}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          ⏱ {getReadingTime(noticiaDestacada.contenido)}
                        </span>
                      </div>

                      <Link
                        href={`/noticias/${noticiaDestacada.slug}`}
                        className="btn-primary py-2.5 px-5 text-xs font-semibold rounded-lg shadow-sm"
                      >
                        Ver Noticia Completa
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FILTROS Y CONTADOR */}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-white">
                  Todas
                </button>
              </div>
              <span className="rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-500">
                Mostrando {noticias.length} noticias
              </span>
            </div>

            {/* GRILLA DE RESTO DE NOTICIAS (3 COLUMNAS) */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {restoNoticias.map((noticia) => (
                <Link
                  key={noticia.id || noticia.slug}
                  href={`/noticias/${noticia.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  {/* Imagen de la tarjeta con badge encima */}
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
                    <Image
                      src={
                        noticia.imagenUrl ||
                        "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop"
                      }
                      alt={noticia.titulo}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 z-10">
                      <span className="rounded-md bg-white/95 backdrop-blur px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm">
                        {noticia.categoria}
                      </span>
                    </div>
                  </div>

                  {/* Contenido de la tarjeta */}
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <div className="mb-3 flex items-center gap-3 text-[11px] font-medium text-gray-400">
                        <span>
                          📅 {noticia.fechaPublicacion ? formatDate(noticia.fechaPublicacion) : ""}
                        </span>
                        <span>•</span>
                        <span>⏱ {getReadingTime(noticia.contenido)}</span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {noticia.titulo}
                      </h3>

                      <p className="mt-3 text-xs leading-relaxed text-gray-500 line-clamp-3">
                        {noticia.contenido}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4 text-xs font-semibold text-primary">
                      <span>Leer más</span>
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
