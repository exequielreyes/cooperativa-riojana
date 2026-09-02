import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SubirContenidoForm } from "@/components/admin/SubirContenidoForm";
import { EliminarContenidoButton } from "@/components/admin/EliminarContenidoButton";
import { formatDate } from "@/lib/utils";

const estadoLabel: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  CANCELADO: "Cancelado",
};
const estadoTone: Record<string, "success" | "warning" | "danger"> = {
  PENDIENTE: "warning",
  CONFIRMADO: "success",
  CANCELADO: "danger",
};

const tipoLabel: Record<string, string> = {
  DOCUMENTO: "Documento",
  VIDEO: "Video",
  ENLACE: "Enlace",
};

export default async function ProfesorTallerDetallePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const taller = await prisma.taller.findUnique({
    where: { id: params.id },
    include: {
      inscripciones: { include: { socio: true }, orderBy: { fechaInscripcion: "asc" } },
      contenidos: { orderBy: { orden: "asc" } },
    },
  });

  if (!taller) notFound();
  // Un profesor sólo puede ver el detalle de SUS propios talleres, nunca de otro.
  if (taller.profesorId !== session!.user.id) redirect("/profesor");

  return (
    <div>
      <Link href="/profesor" className="mb-4 inline-block text-sm text-primary hover:underline">
        ‹ Volver a Mis Talleres
      </Link>

      <h1 className="mb-1 text-2xl font-semibold text-primary-dark">{taller.titulo}</h1>
      <p className="mb-6 text-sm text-gray-500">
        {formatDate(taller.fecha)} · {taller.categoria} ·{" "}
        {taller.modalidad === "PRESENCIAL" ? "Presencial" : "Virtual"}
      </p>

      <div className="card mb-6">
        <p className="mb-4 font-medium text-primary-dark">
          Inscriptos ({taller.inscripciones.length} / {taller.cuposTotales})
        </p>
        {taller.inscripciones.length === 0 ? (
          <p className="text-sm text-gray-400">Todavía no hay inscriptos.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border text-left text-xs text-gray-400">
                <th className="py-2 font-normal">Socio</th>
                <th className="py-2 font-normal">Fecha de inscripción</th>
                <th className="py-2 font-normal">Estado</th>
              </tr>
            </thead>
            <tbody>
              {taller.inscripciones.map((inscripcion) => (
                <tr key={inscripcion.id} className="border-b border-surface-border last:border-0">
                  <td className="py-2.5">
                    <p className="font-medium text-primary-dark">
                      {inscripcion.socio.nombre} {inscripcion.socio.apellido}
                    </p>
                    <p className="text-xs text-gray-400">{inscripcion.socio.idCooperativa}</p>
                  </td>
                  <td className="py-2.5">{formatDate(inscripcion.fechaInscripcion)}</td>
                  <td className="py-2.5">
                    <StatusBadge label={estadoLabel[inscripcion.estado]} tone={estadoTone[inscripcion.estado]} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card mb-6">
        <p className="mb-4 font-medium text-primary-dark">Material de Estudio</p>
        {taller.contenidos.length === 0 ? (
          <p className="mb-4 text-sm text-gray-400">Todavía no subiste ningún material.</p>
        ) : (
          <div className="mb-4 divide-y divide-surface-border">
            {taller.contenidos.map((contenido) => (
              <div key={contenido.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-primary-dark">{contenido.titulo}</p>
                  <p className="text-xs text-gray-400">
                    {tipoLabel[contenido.tipo]}
                    {" · "}
                    <a
                      href={contenido.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      Ver
                    </a>
                  </p>
                </div>
                <EliminarContenidoButton tallerId={taller.id} contenidoId={contenido.id} />
              </div>
            ))}
          </div>
        )}
      </div>

      <SubirContenidoForm tallerId={taller.id} />
    </div>
  );
}