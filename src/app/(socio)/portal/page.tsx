import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function PortalDashboardPage() {
  const session = await getServerSession(authOptions);
  const socioId = session!.user.socioId!;

  const [socio, cuotasPendientes, ultimosPagos] = await Promise.all([
    prisma.socio.findUnique({ where: { id: socioId } }),
    prisma.cuota.findMany({
      where: { socioId, estado: { in: ["PENDIENTE", "VENCIDO"] } },
      include: { pagos: true },
      orderBy: { fechaVencimiento: "asc" },
    }),
    prisma.pago.findMany({
      where: { socioId },
      include: { cuota: true },
      orderBy: { fechaPago: "desc" },
      take: 5,
    }),
  ]);

  const balance = cuotasPendientes.reduce((acc, c) => acc + Number(c.monto), 0);

  const sinRevision = cuotasPendientes.filter(
    (c) => !c.pagos.some((p) => p.estadoValidacion === "PENDIENTE_REVISION"),
  );
  const hoy = new Date();
  const proximaCuota =
    sinRevision.find((c) => c.fechaVencimiento >= hoy) ??
    sinRevision[sinRevision.length - 1] ??
    null;
  const cuotasEnRevision = cuotasPendientes.filter((c) =>
    c.pagos.some((p) => p.estadoValidacion === "PENDIENTE_REVISION"),
  );
  const alDia = cuotasPendientes.length === 0;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary-dark">¡Hola, {socio?.nombre}!</h1>
          <p className="text-sm text-gray-500">Panel de Control del Socio · Información actualizada al día.</p>
        </div>
        <StatusBadge
          label={alDia ? "Tu cuenta está al día" : "Tenés pagos pendientes"}
          tone={alDia ? "success" : "warning"}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card">
              <p className="text-xs text-gray-400">Balance a Pagar</p>
              <p className="mt-1 text-2xl font-semibold text-primary-dark">{formatCurrency(balance)}</p>
              <p className="text-xs text-gray-400">Total acumulado a la fecha</p>
            </div>
            <div className="card">
              <p className="text-xs text-gray-400">Próximo Vencimiento</p>
              <p className="mt-1 text-2xl font-semibold text-primary-dark">
                {proximaCuota ? formatDate(proximaCuota.fechaVencimiento) : "—"}
              </p>
              <p className="text-xs text-status-warning">
                {proximaCuota?.periodo ?? "Sin cuotas pendientes"}
                {proximaCuota?.fechaVencimiento < hoy && (
                  <span className="ml-1 text-status-danger">· Vencido</span>
                )}
                {cuotasEnRevision.length > 0 && (
                  <span className="ml-1 text-gray-400">(pago en revisión)</span>
                )}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-medium text-primary-dark">Acciones Rápidas</p>
            <div className="grid gap-4 sm:grid-cols-3">
              <Link href="/portal/pagos/reportar" className="card block bg-primary text-white hover:bg-primary-light">
                <p className="font-medium">Reportar Pago →</p>
                <p className="text-xs text-white/70">Realiza tu transferencia y sube aquí tu comprobante</p>
              </Link>
              <Link href="/portal/pagos" className="card block">
                <p className="font-medium text-primary-dark">Historial de Cuotas →</p>
                <p className="text-xs text-gray-500">Revisa tus pagos anteriores y estados de cuenta</p>
              </Link>
              <Link href="/portal/talonarios" className="card block border-l-4 border-l-primary">
                <p className="font-medium text-primary-dark">Talonarios Digitales →</p>
                <p className="text-xs text-gray-500">Accedé y descargá tus talonarios oficiales de {socio?.area === "CONSUMO" ? "consumo" : "sepelio"}</p>
              </Link>
            </div>
          </div>

          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-medium text-primary-dark">Últimos Pagos</p>
              <Link href="/portal/pagos" className="text-xs text-primary hover:underline">
                Ver historial completo
              </Link>
            </div>
            {ultimosPagos.length === 0 ? (
              <p className="text-sm text-gray-400">Todavía no registraste ningún pago.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400">
                    <th className="pb-2 font-normal">Período</th>
                    <th className="pb-2 font-normal">Monto</th>
                    <th className="pb-2 font-normal">Fecha Pago</th>
                    <th className="pb-2 font-normal">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {ultimosPagos.map((pago) => (
                    <tr key={pago.id} className="border-t border-surface-border">
                      <td className="py-2.5">{pago.cuota.periodo}</td>
                      <td className="py-2.5">{formatCurrency(Number(pago.monto))}</td>
                      <td className="py-2.5">{formatDate(pago.fechaPago)}</td>
                      <td className="py-2.5">
                        <StatusBadge
                          label={
                            pago.estadoValidacion === "APROBADO"
                              ? "Pagado"
                              : pago.estadoValidacion === "RECHAZADO"
                              ? "Rechazado"
                              : "En revisión"
                          }
                          tone={
                            pago.estadoValidacion === "APROBADO"
                              ? "success"
                              : pago.estadoValidacion === "RECHAZADO"
                              ? "danger"
                              : "warning"
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <p className="font-medium text-primary-dark">Novedades Socio</p>
              <span className="badge bg-amber-50 text-amber-700 border border-amber-200/60 font-semibold text-[11px]">
                Próximamente
              </span>
            </div>
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center">
              <p className="text-sm font-semibold text-gray-700">Próximamente</p>
              <p className="mt-1 text-xs text-gray-400">
                Pronto vas a poder ver anuncios, circulares y beneficios exclusivos para socios en esta sección.
              </p>
            </div>
          </div>
          <div className="card">
            <p className="mb-2 font-medium text-primary-dark">¿Necesitas ayuda?</p>
            <p className="mb-3 text-sm text-gray-500">
              Contáctate con nuestro equipo de atención al socio para resolver dudas.
            </p>
            <Link
              href="/contacto"
              className="btn-primary block w-full text-center"
            >
              Contactar Soporte
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
