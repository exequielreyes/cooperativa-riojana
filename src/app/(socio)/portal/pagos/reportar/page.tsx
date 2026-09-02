import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ReportarPagoForm } from "@/components/socio/ReportarPagoForm";
import { VolverAlPanel } from "@/components/socio/VolverAlPanel";

export default async function ReportarPagoPage({
  searchParams,
}: {
  searchParams: { cuota?: string };
}) {
  const session = await getServerSession(authOptions);
  const socioId = session!.user.socioId!;

  const [cuotasPendientes, configuracion] = await Promise.all([
    prisma.cuota.findMany({
      where: { socioId, estado: { in: ["PENDIENTE", "VENCIDO"] } },
      include: { pagos: { orderBy: { fechaPago: "desc" }, take: 1 } },
      orderBy: { fechaVencimiento: "asc" },
    }),
    prisma.configuracionCooperativa.findUnique({ where: { id: "singleton" } }),
  ]);

  if (cuotasPendientes.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <VolverAlPanel />
        <h1 className="mb-2 text-2xl font-semibold text-primary-dark">Reportar Pago de Cuota</h1>
        <p className="card text-sm text-gray-500">No tenés cuotas pendientes en este momento. 🎉</p>
      </div>
    );
  }


const cuotas = cuotasPendientes.map((cuota) => {
    const ultimoPago = cuota.pagos[0];
    return {
      id: cuota.id,
      periodo: `${cuota.concepto} ${cuota.periodo}`,
      monto: Number(cuota.monto),
      fechaVencimiento: cuota.fechaVencimiento.toISOString(),
      enRevision: ultimoPago?.estadoValidacion === "PENDIENTE_REVISION",
      motivoRechazo: ultimoPago?.estadoValidacion === "RECHAZADO" ? ultimoPago.notaRechazo ?? null : null,
    };
  });

  const cuotaPreseleccionada = searchParams.cuota && cuotas.some((c) => c.id === searchParams.cuota)
    ? searchParams.cuota
    : cuotas.find((c) => !c.enRevision)?.id ?? cuotas[0].id;



  return (
    <ReportarPagoForm
      cuotas={cuotas}
      cuotaPreseleccionadaId={cuotaPreseleccionada}
      datosTransferencia={{
        cbu: configuracion?.cbu ?? null,
        alias: configuracion?.alias ?? null,
      }}
    />
  );
}