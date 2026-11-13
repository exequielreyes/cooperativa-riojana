import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generarTalonariosParaCuotas } from "@/lib/talonarios";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.rol !== "SUPER_ADMIN" && session.user.rol !== "COBRADOR")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const cuota = await prisma.cuota.findUnique({ where: { id: params.id }, include: { pagos: true } });
  if (!cuota) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  if (cuota.estado === "PAGADO") {
    return NextResponse.json({ error: "Esta cuota ya está pagada" }, { status: 400 });
  }

  const tienePagoVigente = cuota.pagos.some((p) => p.estadoValidacion !== "RECHAZADO");
  if (tienePagoVigente) {
    return NextResponse.json(
      { error: "Esta cuota ya tiene un pago registrado o en revisión" },
      { status: 409 }
    );
  }

  // Validación de orden correlativo: no se pueden saltear cuotas anteriores pendientes
  const cuotasPendientes = await prisma.cuota.findMany({
    where: {
      socioId: cuota.socioId,
      estado: { in: ["PENDIENTE", "VENCIDO"] },
    },
    orderBy: [{ fechaVencimiento: "asc" }, { createdAt: "asc" }],
  });

  if (cuotasPendientes.length > 0 && cuotasPendientes[0].id !== cuota.id) {
    const primeraPendiente = cuotasPendientes[0];
    const periodoEsperado = primeraPendiente.concepto !== "Cuota Social"
      ? `${primeraPendiente.concepto} (${primeraPendiente.periodo})`
      : primeraPendiente.periodo;

    return NextResponse.json(
      {
        error: `No podés cobrar esta cuota sin haber cobrado antes la cuota anterior pendiente (${periodoEsperado}). Las cuotas deben cobrarse en orden cronológico a partir de la más antigua.`,
      },
      { status: 400 }
    );
  }

  const pago = await prisma.pago.create({
    data: {
      cuotaId: cuota.id,
      socioId: cuota.socioId,
      monto: cuota.monto,
      metodo: "EFECTIVO",
      estadoValidacion: "APROBADO",
      validadoPorId: session.user.id,
      fechaValidacion: new Date(),
    },
  });

  await prisma.cuota.update({ where: { id: cuota.id }, data: { estado: "PAGADO" } });

  await generarTalonariosParaCuotas([cuota.id], pago.id);

  return NextResponse.json(pago, { status: 201 });
}
