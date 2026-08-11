import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol === "SOCIO") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const cuota = await prisma.cuota.findUnique({ where: { id: params.id }, include: { pago: true } });
  if (!cuota) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  if (cuota.pago) return NextResponse.json({ error: "Esta cuota ya tiene un pago registrado" }, { status: 409 });

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

  return NextResponse.json(pago, { status: 201 });
}
