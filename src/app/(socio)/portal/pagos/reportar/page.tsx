import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ReportarPagoForm } from "@/components/socio/ReportarPagoForm";
import { VolverAlPanel } from "@/components/socio/VolverAlPanel";

export default async function ReportarPagoPage() {
  const session = await getServerSession(authOptions);
  const socioId = session!.user.socioId!;

  const [cuotas, configuracion] = await Promise.all([
    prisma.cuota.findMany({
      where: { socioId, estado: { in: ["PENDIENTE", "VENCIDO"] } },
      orderBy: { fechaVencimiento: "asc" },
    }),
    prisma.configuracionCooperativa.findUnique({ where: { id: "singleton" } }),
  ]);

  if (cuotas.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10">
        <VolverAlPanel />
        <h1 className="mb-2 text-2xl font-semibold text-primary-dark">Reportar Pago de Cuota</h1>
        <p className="card text-sm text-gray-500">No tenés cuotas pendientes en este momento. 🎉</p>
      </div>
    );
  }

  return (
    <ReportarPagoForm
      cuotas={cuotas.map((cuota) => ({
        id: cuota.id,
        periodo: cuota.periodo,
        monto: Number(cuota.monto),
        fechaVencimiento: cuota.fechaVencimiento.toISOString(),
      }))}
      datosTransferencia={{
        cbu: configuracion?.cbu ?? null,
        alias: configuracion?.alias ?? null,
      }}
    />
  );
}