import Link from "next/link";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AccionesInscripcion } from "@/components/admin/AccionesInscripcion";
import { formatDate } from "@/lib/utils";
import { EliminarTallerButton } from "@/components/admin/EliminarTallerButton";
import { AdminPagination } from "@/components/ui/AdminPagination";

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

const PAGE_SIZE = 10;

export default async function AdminTalleresPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const page = Math.max(1, parseInt(searchParams?.page ?? "1", 10) || 1);

  const [pendientes, totalTalleres] = await Promise.all([
    prisma.inscripcionTaller.findMany({
      where: { estado: "PENDIENTE" },
      include: { socio: true, taller: true },
      orderBy: { fechaInscripcion: "asc" },
    }),
    prisma.taller.count(),
  ]);

  const totalPaginas = Math.max(1, Math.ceil(totalTalleres / PAGE_SIZE));
  const pageSegura = Math.min(page, totalPaginas);

  const talleres = await prisma.taller.findMany({
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
    skip: (pageSegura - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary-dark">Gestión de Talleres</h1>
          <p className="text-sm text-gray-500">Revisá las solicitudes de inscripción y administrá los talleres activos.</p>
        </div>
        <Link href="/admin/talleres/nuevo" className="btn-primary">
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
                <th className="py-2 font-normal">Comprobante</th>
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
                    {inscripcion.comprobanteUrl ? (
                      <a 
                        href={inscripcion.comprobanteUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        📄 Ver comprobante
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
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
        {totalTalleres === 0 ? (
          <p className="p-6 text-sm text-gray-400">Todavía no hay talleres registrados.</p>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-border text-left text-xs text-gray-400">
                  <th className="px-6 py-3 font-normal">Título</th>
                  <th className="px-6 py-3 font-normal">Fecha</th>
                  <th className="px-6 py-3 font-normal">Categoría</th>
                  <th className="px-6 py-3 font-normal">Inscriptos</th>
                  <th className="px-6 py-3 font-normal">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {talleres.map((taller) => (
                  <tr key={taller.id} className="border-b border-surface-border last:border-0">
                    <td className="px-6 py-3 font-medium text-primary-dark">{taller.titulo}</td>
                    <td className="px-6 py-3">{formatDate(taller.fecha)}</td>
                    <td className="px-6 py-3">{taller.categoria}</td>
                    <td className="px-6 py-3">{taller._count.inscripciones} / {taller.cuposTotales}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2.5">
                        <Link
                          href={`/admin/talleres/${taller.id}/materiales`}
                          className="text-primary hover:underline"
                        >
                          Gestionar
                        </Link>
                        <span className="text-gray-300">·</span>
                        <Link
                          href={`/admin/talleres/${taller.id}/editar`}
                          className="text-primary hover:underline"
                        >
                          Editar
                        </Link>
                        <span className="text-gray-300">·</span>
                        <EliminarTallerButton tallerId={taller.id} titulo={taller.titulo} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <AdminPagination
              page={pageSegura}
              totalPaginas={totalPaginas}
              totalItems={totalTalleres}
              pageSize={PAGE_SIZE}
              itemLabel="talleres"
              basePath="/admin/talleres"
            />
          </>
        )}
      </div>
    </div>
  );
}
