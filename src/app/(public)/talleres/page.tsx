import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";

export default async function TalleresPage() {
  const talleres = await prisma.taller.findMany({
    where: { estado: "ACTIVO" },
    include: {
      _count: {
        select: {
          inscripciones: {
            where: {
              estado: "CONFIRMADO",
            },
          },
        },
      },
    },
    orderBy: { fecha: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-50/50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        
        {/* ENCABEZADO CENTRADO */}
        <div className="mb-14 text-center">
          <span className="inline-block rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-primary shadow-2xs">
            Formación y Comunidad
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
            Talleres y Capacitaciones
          </h1>
        </div>

        {/* MENSAJE CUANDO NO HAY TALLERES */}
        {talleres.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center text-sm text-gray-500">
            No hay talleres activos por el momento.
          </div>
        )}

        {/* GRILLA DE TARJETAS (3 COLUMNAS) */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {talleres.map((taller) => {
            const cuposDisponibles =
              taller.cuposTotales - taller._count.inscripciones;

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
                      {taller.descripcion }
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
      </div>
    </div>
  );
}
