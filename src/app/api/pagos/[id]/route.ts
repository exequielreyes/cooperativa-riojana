import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const patchSchema = z.object({
  accion: z.enum(["APROBAR", "RECHAZAR"]),
  notaRechazo: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol === "SOCIO") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const pago = await prisma.pago.update({
    where: { id: params.id },
    data: {
      estadoValidacion: parsed.data.accion === "APROBAR" ? "APROBADO" : "RECHAZADO",
      notaRechazo: parsed.data.notaRechazo,
      validadoPorId: session.user.id,
      fechaValidacion: new Date(),
    },
  });

  // Si se aprueba, la cuota asociada pasa a PAGADO
  if (parsed.data.accion === "APROBAR") {
    await prisma.cuota.update({
      where: { id: pago.cuotaId },
      data: { estado: "PAGADO" },
    });
  }

  return NextResponse.json(pago);
}
