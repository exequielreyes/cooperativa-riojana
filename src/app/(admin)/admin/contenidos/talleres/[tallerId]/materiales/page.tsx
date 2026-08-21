import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { SubirContenidoForm } from "@/components/admin/SubirContenidoForm";
import { EliminarContenidoButton } from "@/components/admin/EliminarContenidoButton";
import { FileText, Video, Link as LinkIcon, ArrowLeft } from "lucide-react";

const ICONO_TIPO = {
  DOCUMENTO: FileText,
  VIDEO: Video,
  ENLACE: LinkIcon,
} as const;

const LABEL_TIPO = {
  DOCUMENTO: "Documento",
  VIDEO: "Video",
  ENLACE: "Enlace",
} as const;

export default async function MaterialesTallerPage({
  params,
}: {
  params: { tallerId: string };
}) {
  const taller = await prisma.taller.findUnique({
    where: { id: params.tallerId },
    include: {
      contenidos: { orderBy: { orden: "asc" } },
      _count: { select: { inscripciones: true } },
    },
  });

  if (!taller) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/talleres"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-dark"
      >
        <ArrowLeft size={14} />
        Volver a Talleres
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-primary-dark">
          Contenido — {taller.titulo}
        </h1>
        <p className="text-sm text-gray-500">
          {formatDate(taller.fecha)} · {taller._count.inscripciones} inscriptos
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Todo lo que subas acá va a estar disponible únicamente para los
          socios con inscripción <strong>confirmada</strong> a este taller.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr,320px]">
        <div>
          {taller.contenidos.length === 0 ? (
            <p className="card text-sm text-gray-400">
              Todavía no subiste contenido para este taller.
            </p>
          ) : (
            <ul className="space-y-3">
              {taller.contenidos.map((item) => {
                const Icono = ICONO_TIPO[item.tipo];
                return (
                  <li key={item.id} className="card flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
                        <Icono size={16} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-primary-dark">
                          {item.titulo}
                        </p>
                        {item.descripcion && (
                          <p className="text-xs text-gray-500">{item.descripcion}</p>
                        )}
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-block text-xs text-primary hover:underline"
                        >
                          {LABEL_TIPO[item.tipo]} · Ver
                        </a>
                      </div>
                    </div>
                    <EliminarContenidoButton tallerId={taller.id} contenidoId={item.id} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <SubirContenidoForm tallerId={taller.id} />
        </div>
      </div>
    </div>
  );
}
