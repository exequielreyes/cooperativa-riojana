import { prisma } from "@/lib/db";
import { TalleresPublicosView, TallerPublico } from "@/components/talleres/TalleresPublicosView";

export default async function TalleresPage() {
  const talleresRaw = await prisma.taller.findMany({
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

  const talleres: TallerPublico[] = talleresRaw.map((t) => ({
    id: t.id,
    slug: t.slug,
    titulo: t.titulo,
    descripcion: t.descripcion,
    categoria: t.categoria,
    fecha: t.fecha.toISOString(),
    imagenUrl: t.imagenUrl,
    cuposTotales: t.cuposTotales,
    cuposOcupados: t._count.inscripciones,
  }));

  return (
    <div className="min-h-screen bg-slate-50/50 py-16">
      <div className="mx-auto max-w-6xl px-6">
        
        {/* ENCABEZADO CENTRADO */}
        <div className="mb-10 text-center">
          <span className="inline-block rounded-full border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-primary shadow-2xs">
            Formación y Comunidad
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-primary md:text-5xl">
            Talleres y Capacitaciones
          </h1>
          <p className="mt-2 text-sm text-gray-500 max-w-xl mx-auto">
            Explorá nuestra oferta de talleres comunitarios, formativos y recreativos. Elegí tu área de interés e inscribite fácilmente.
          </p>
        </div>

        {/* LISTADO INTERACTIVO CON FILTRO POR CATEGORÍA Y PAGINACIÓN */}
        <TalleresPublicosView talleres={talleres} />
      </div>
    </div>
  );
}
