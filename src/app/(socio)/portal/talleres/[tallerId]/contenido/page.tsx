import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { obtenerUrlEmbebible } from "@/lib/video";
import { FileText, Video, Link as LinkIcon, ArrowLeft, Lock } from "lucide-react";

const ICONO_TIPO = {
  DOCUMENTO: FileText,
  VIDEO: Video,
  ENLACE: LinkIcon,
} as const;

export default async function ContenidoTallerPage({
  params,
}: {
  params: { tallerId: string };
}) {
  const session = await getServerSession(authOptions);
  const socioId = session?.user.socioId;

  if (!socioId) {
    redirect("/login");
  }

  const inscripcion = await prisma.inscripcionTaller.findUnique({
    where: { tallerId_socioId: { tallerId: params.tallerId, socioId } },
    include: {
      taller: {
        include: { contenidos: { orderBy: { orden: "asc" } } },
      },
    },
  });

  if (!inscripcion) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/portal/talleres"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-dark"
      >
        <ArrowLeft size={14} />
        Volver a Mis Talleres
      </Link>

      <h1 className="text-2xl font-semibold text-primary-dark">
        {inscripcion.taller.titulo}
      </h1>
      <p className="mt-1 text-sm text-gray-500">Contenido del taller</p>

      {inscripcion.estado !== "CONFIRMADO" ? (
        <div className="card mt-6 flex items-start gap-3">
          <Lock size={18} className="mt-0.5 shrink-0 text-gray-400" />
          <div>
            <p className="text-sm font-semibold text-primary-dark">
              Tu inscripción todavía no está confirmada
            </p>
            <p className="mt-1 text-sm text-gray-500">
              En cuanto la cooperativa confirme tu lugar en este taller, el
              contenido va a aparecer acá automáticamente.
            </p>
          </div>
        </div>
      ) : inscripcion.taller.contenidos.length === 0 ? (
        <p className="card mt-6 text-sm text-gray-400">
          El profesor todavía no subió contenido para este taller.
        </p>
      ) : (
        <div className="mt-6 space-y-5">
          {inscripcion.taller.contenidos.map((item) => {
            const Icono = ICONO_TIPO[item.tipo];
            const urlEmbed = item.tipo === "VIDEO" ? obtenerUrlEmbebible(item.url) : null;

            return (
              <div key={item.id} className="card">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
                    <Icono size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-primary-dark">{item.titulo}</p>
                    {item.descripcion && (
                      <p className="mt-0.5 text-sm text-gray-500">{item.descripcion}</p>
                    )}

                    {urlEmbed ? (
                      <div className="mt-3 aspect-video overflow-hidden rounded-lg">
                        <iframe
                          src={urlEmbed}
                          title={item.titulo}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="h-full w-full"
                        />
                      </div>
                    ) : (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary mt-3 inline-block"
                      >
                        {item.tipo === "DOCUMENTO" ? "Abrir documento" : "Abrir enlace"}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
