import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";



// Helper para calcular el tiempo de lectura
function getReadingTime(text: string): string {
  const wordsPerMinute = 200;
  const words = text ? text.trim().split(/\s+/).length : 0;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes || 1} min`;
}

export default async function NoticiaDetallePage({ params }: { params: { slug: string } }) {
  const noticia = await prisma.noticia.findUnique({ where: { slug: params.slug } });
  if (!noticia || noticia.estado !== "PUBLICADO") notFound();


  const noticiasRelacionadas = await prisma.noticia.findMany({
    where: {
      estado: "PUBLICADO",
      NOT: { id: noticia.id },
    },
    orderBy: { fechaPublicacion: "desc" },
    take: 3,
  });


  return (
    <div className="bg-white min-h-screen py-12">
      <article className="mx-auto max-w-4xl px-6">
        
        {/* ENCABEZADO DE LA NOTICIA */}
        <div className="mb-6">
          <span className="inline-block rounded-md bg-emerald-900 px-2.5 py-1 text-[11px] font-bold text-white uppercase tracking-wider mb-4">
            {noticia.categoria || "Destacado"}
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 md:text-5xl leading-tight">
            {noticia.titulo}
          </h1>

          {/* Metadatos (Fecha, Lectura, Compartir) */}
          <div className="mt-6 flex items-center gap-6 text-xs font-medium text-gray-500 border-b border-gray-100 pb-6">
            <span className="flex items-center gap-1.5">
              📅 {noticia.fechaPublicacion ? formatDate(noticia.fechaPublicacion) : ""}
            </span>
            <span className="flex items-center gap-1.5">
              ⏱ {getReadingTime(noticia.contenido)}
            </span>
            {/* <button className="flex items-center gap-1.5 hover:text-primary transition-colors ml-auto md:ml-0">
              🔗 Compartir
            </button> */}
          </div>
        </div>

        {/* IMAGEN PRINCIPAL */}
        <div className="mb-10">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
            <Image
              src={
                noticia.imagenUrl ||
                "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop"
              }
              alt={noticia.titulo}
              fill
              className="object-cover"
              priority
            />
          </div>
          <p className="mt-3 text-center text-xs text-gray-400">
            {noticia.titulo} — Cooperativa Riojana.
          </p>
        </div>

        {/* CUERPO/CONTENIDO DE LA NOTICIA (Sin ficha técnica) */}
        <div className="prose prose-slate max-w-none prose-lg text-gray-700 leading-relaxed whitespace-pre-line">
          {noticia.contenido}
        </div>

      </article>

      {/* SECCIÓN DE NOTICIAS RELACIONADAS */}
      {noticiasRelacionadas.length > 0 && (
        <section className="bg-surface-muted/40 border-t border-gray-100 mt-20 py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Noticias Relacionadas
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Seguí informado sobre el desarrollo de la cooperativa.
                </p>
              </div>
              <Link
                href="/noticias"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                Ver todas →
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {noticiasRelacionadas.map((item) => (
                <Link
                  key={item.id || item.slug}
                  href={`/noticias/${item.slug}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
                    <Image
                      src={
                        item.imagenUrl ||
                        "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop"
                      }
                      alt={item.titulo}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5 flex flex-col justify-between flex-1">
                    <div>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-accent">
                        {item.categoria}
                      </p>
                      <h3 className="font-bold text-slate-900 leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {item.titulo}
                      </h3>
                      <p className="mt-2 text-xs text-gray-500 line-clamp-2">
                        {item.contenido}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
