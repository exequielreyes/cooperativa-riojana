import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { BotonInscripcion } from "@/components/socio/BotonInscripcion";

export default async function TallerDetallePage({ params }: { params: { slug: string } }) {
  const taller = await prisma.taller.findUnique({
    where: { slug: params.slug },
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
  });

  if (!taller) notFound();

  const cuposDisponibles = taller.cuposTotales - taller._count.inscripciones;

  return (
    <div className="min-h-screen bg-slate-50/30 py-12">
      <div className="mx-auto max-w-5xl px-6">
        
        {/* ENCABEZADO Y METADATOS */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <span className="inline-block rounded-md bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3">
              {taller.categoria || "Salud"}
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 md:text-4xl">
              {taller.titulo}
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-gray-500 shrink-0">
            <span className="flex items-center gap-1">
              📅 {new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "long" }).format(taller.fecha)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              ⏱ {taller.horaInicio}{taller.horaFin ? ` - ${taller.horaFin}` : " (2 horas)"}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              📍 {taller.modalidad === "PRESENCIAL" ? "Presencial" : "Virtual"}
            </span>
          </div>
        </div>

        {/* IMAGEN PRINCIPAL DEL TALLER */}
        <div className="relative mb-12 aspect-[21/9] w-full overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
          <Image
            src={
              taller.imagenUrl ||
              "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop"
            }
            alt={taller.titulo}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* CONTENIDO PRINCIPAL Y SIDEBAR */}
        <div className="grid gap-10 md:grid-cols-12 items-start">
          
          {/* COLUMNA IZQUIERDA: CONTENIDO */}
          <div className="md:col-span-7 lg:col-span-8 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Sobre el Taller
              </h2>
              <div className="prose prose-slate max-w-none text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {taller.descripcion}
              </div>
            </div>

            {/* CAJAS DE "QUÉ APRENDERÁS" Y "REQUISITOS" */}
            <div className="grid gap-6 sm:grid-cols-2 pt-4">
              {/* Caza Qué aprenderás */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-2xs">
                <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold text-sm">
                  <span>💡</span>
                  <h3>Qué aprenderás</h3>
                </div>
                <ul className="space-y-3 text-xs text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    Técnicas prácticas para ejercitar la memoria y agilidad mental.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    Ejercicios de concentración adaptados a la vida cotidiana.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">•</span>
                    Estrategias de organización para hábitos diarios.
                  </li>
                </ul>
              </div>

              {/* Caja Requisitos */}
              <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-2xs">
                <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold text-sm">
                  <span>📋</span>
                  <h3>Requisitos</h3>
                </div>
                {taller.requisitos ? (
                  <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">
                    {taller.requisitos}
                  </p>
                ) : (
                  <ul className="space-y-3 text-xs text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">!</span>
                      No se requiere experiencia previa ni materiales específicos.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">!</span>
                      Ganas de participar en actividades grupales de aprendizaje.
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: SIDEBAR DE INFORMACIÓN */}
          <aside className="md:col-span-5 lg:col-span-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-gray-100 pb-3">
              Información del Taller
            </h3>

            <div className="space-y-5">
              {/* Instructor */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  👤
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-400">Instructor</p>
                  <p className="text-xs font-bold text-slate-800">
                    {taller.instructor ?? "Lic. Marta Rodríguez"}
                  </p>
                </div>
              </div>

              {/* Ubicación */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  🏛️
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-400">Ubicación</p>
                  <p className="text-xs font-bold text-slate-800">
                    {taller.ubicacion ?? "Salón Comunitario Central"}
                  </p>
                </div>
              </div>

              {/* Disponibilidad */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  👥
                </div>
                <div>
                  <p className="text-[11px] font-medium text-gray-400">Disponibilidad</p>
                  <p className={`text-xs font-bold ${cuposDisponibles > 0 ? "text-amber-700" : "text-red-600"}`}>
                    {cuposDisponibles > 0 ? `Solo ${cuposDisponibles} cupos disponibles` : "Cupos agotados"}
                  </p>
                </div>
              </div>
            </div>

            {/* BOTONES DE ACCIÓN */}
            <div className="pt-4 space-y-3">
              {cuposDisponibles > 0 ? (
                <BotonInscripcion tallerId={taller.id} />
              ) : (
                <button disabled className="w-full rounded-xl bg-gray-200 py-3 text-xs font-bold text-gray-500 cursor-not-allowed">
                  Sin cupos disponibles
                </button>
              )}

              <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3 text-xs font-bold text-slate-700 hover:bg-gray-50 transition-colors shadow-2xs">
                📥 Descargar Programa (PDF)
              </button>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
