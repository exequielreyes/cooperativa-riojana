import Link from "next/link";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AccionesInscripcion } from "@/components/admin/AccionesInscripcion";
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

export default async function AdminTalleresPage() {
  const [pendientes, talleres] = await Promise.all([
    prisma.inscripcionTaller.findMany({
      where: { estado: "PENDIENTE" },
      include: { socio: true, taller: true },
      orderBy: { fechaInscripcion: "asc" },
    }),
    prisma.taller.findMany({
      include: { _count: { select: { inscripciones: true } } },
      orderBy: { fecha: "asc" },
    }),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary-dark">Gestión de Talleres</h1>
          <p className="text-sm text-gray-500">Revisá las solicitudes de inscripción y administrá los talleres activos.</p>
        </div>
        <Link href="/admin/contenidos/talleres/nuevo" className="btn-primary">
          + Subir Nuevo Taller
        </Link>
      </div>

      <div className="card mb-6">
        <p className="mb-4 font-medium text-primary-dark">
          Solicitudes Pendientes {pendientes.length > 0 && <span className="badge-warning ml-1">{pendientes.length}</span>}
        </p>

        {pendientes.length === 0 ? (
          <p className="text-sm text-gray-400">No hay inscripciones pendientes por revisar.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border text-left text-xs text-gray-400">
                <th className="py-2 font-normal">Socio</th>
                <th className="py-2 font-normal">Taller</th>
                <th className="py-2 font-normal">Fecha de inscripción</th>
                <th className="py-2 font-normal">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pendientes.map((inscripcion) => (
                <tr key={inscripcion.id} className="border-b border-surface-border last:border-0">
                  <td className="py-2.5">
                    <p className="font-medium text-primary-dark">{inscripcion.socio.nombre} {inscripcion.socio.apellido}</p>
                    <p className="text-xs text-gray-400">{inscripcion.socio.idCooperativa}</p>
                  </td>
                  <td className="py-2.5">{inscripcion.taller.titulo}</td>
                  <td className="py-2.5">{formatDate(inscripcion.fechaInscripcion)}</td>
                  <td className="py-2.5">
                    <AccionesInscripcion inscripcionId={inscripcion.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card p-0">
        <p className="p-6 pb-3 font-medium text-primary-dark">Talleres</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border text-left text-xs text-gray-400">
              <th className="px-6 py-3 font-normal">Título</th>
              <th className="px-6 py-3 font-normal">Fecha</th>
              <th className="px-6 py-3 font-normal">Categoría</th>
              <th className="px-6 py-3 font-normal">Inscriptos</th>
            </tr>
          </thead>
          <tbody>
            {talleres.map((taller) => (
              <tr key={taller.id} className="border-b border-surface-border last:border-0">
                <td className="px-6 py-3 font-medium text-primary-dark">{taller.titulo}</td>
                <td className="px-6 py-3">{formatDate(taller.fecha)}</td>
                <td className="px-6 py-3">{taller.categoria}</td>
                <td className="px-6 py-3">{taller._count.inscripciones} / {taller.cuposTotales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
