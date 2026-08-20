import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AccionesPago } from "@/components/admin/AccionesPago";
import { ConfiguracionCuotaCard } from "@/components/admin/ConfiguracionCuotaCard";
import { FiltrosPagos } from "@/components/admin/FiltrosPagos";
import { RegistrarPagoEfectivo } from "@/components/admin/RegistrarPagoEfectivo";
import { formatCurrency, formatDate } from "@/lib/utils";

const estadoLabel: Record<string, string> = {
  APROBADO: "Completado",
  PENDIENTE_REVISION: "Pendiente",
  RECHAZADO: "Rechazado",
};

const estadoTone: Record<string, "success" | "warning" | "danger"> = {
  APROBADO: "success",
  PENDIENTE_REVISION: "warning",
  RECHAZADO: "danger",
};

export default async function AdminPagosPage({
  searchParams,
}: {
  searchParams: { q?: string; estado?: string; metodo?: string };
}) {
  const q = searchParams.q ?? "";
  const estado = searchParams.estado ?? "";
  const metodo = searchParams.metodo ?? "";

  const where = {
    ...(estado && { estadoValidacion: estado as "PENDIENTE_REVISION" | "APROBADO" | "RECHAZADO" }),
    ...(metodo && { metodo: metodo as "TRANSFERENCIA" | "EFECTIVO" | "MERCADOPAGO" }),
    ...(q && {
      socio: {
        OR: [
          { nombre: { contains: q } },
          { apellido: { contains: q } },
          { idCooperativa: { contains: q } },
          { email: { contains: q } },
        ],
      },
    }),
  };

  const [pagos, recaudadoAgg, deudaAgg, pendientesCount, configuracion] = await Promise.all([
    prisma.pago.findMany({
      where,
      include: { socio: true },
      orderBy: { fechaPago: "desc" },
      take: 50,
    }),
    prisma.pago.aggregate({
      _sum: { monto: true },
      where: { estadoValidacion: "APROBADO" },
    }),
    prisma.cuota.aggregate({
      _sum: { monto: true },
      where: { estado: { in: ["PENDIENTE", "VENCIDO"] } },
    }),
    prisma.pago.count({
      where: { estadoValidacion: "PENDIENTE_REVISION" },
    }),
    prisma.configuracionCooperativa.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton" },
    }),
  ]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary-dark">Gestión de Pagos</h1>
        <div className="flex gap-2">
          <RegistrarPagoEfectivo />
          <button className="btn-primary">Exportar Reporte</button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-xs text-gray-400">Recaudado (aprobado)</p>
          <p className="mt-1 text-xl font-semibold text-primary-dark">
            {formatCurrency(Number(recaudadoAgg._sum.monto ?? 0))}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400">Deudas Pendientes</p>
          <p className="mt-1 text-xl font-semibold text-status-danger">
            {formatCurrency(Number(deudaAgg._sum.monto ?? 0))}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400">Pagos por revisar</p>
          <p className="mt-1 text-xl font-semibold text-primary-dark">{pendientesCount}</p>
        </div>
      </div>

      <div className="mb-6">
        <ConfiguracionCuotaCard montoActual={Number(configuracion.montoCuotaActual)} />
      </div>

      <FiltrosPagos />

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border text-left text-xs text-gray-400">
              <th className="px-6 py-3 font-normal">Socio / ID</th>
              <th className="px-6 py-3 font-normal">Fecha</th>
              <th className="px-6 py-3 font-normal">Método</th>
              <th className="px-6 py-3 font-normal">Estado</th>
              <th className="px-6 py-3 font-normal">Monto</th>
              <th className="px-6 py-3 font-normal">Comprobante</th>
              <th className="px-6 py-3 font-normal">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagos.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-400">
                  No se encontraron pagos con esos filtros.
                </td>
              </tr>
            )}
            {pagos.map((pago) => (
              <tr key={pago.id} className="border-b border-surface-border last:border-0">
                <td className="px-6 py-3">
                  <p className="font-medium text-primary-dark">{pago.socio.nombre} {pago.socio.apellido}</p>
                  <p className="text-xs text-gray-400">{pago.socio.idCooperativa}</p>
                </td>
                <td className="px-6 py-3">{formatDate(pago.fechaPago)}</td>
                <td className="px-6 py-3">{pago.metodo}</td>
                <td className="px-6 py-3">
                  <StatusBadge label={estadoLabel[pago.estadoValidacion]} tone={estadoTone[pago.estadoValidacion]} />
                </td>
                <td className="px-6 py-3">{formatCurrency(Number(pago.monto))}</td>
                <td className="px-6 py-3">
                  {pago.comprobanteUrl && (
                    <a
                      href={pago.comprobanteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Ver comprobante
                    </a>
                  )}
                </td>
                <td className="px-6 py-3">
                  {pago.estadoValidacion === "PENDIENTE_REVISION" ? (
                    <AccionesPago pagoId={pago.id} />
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}