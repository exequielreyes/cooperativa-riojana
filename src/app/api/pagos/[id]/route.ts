import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const patchSchema = z.object({
  accion: z.enum(["APROBAR", "RECHAZAR"]),
  notaRechazo: z.string().optional(),
  pagoIds: z.array(z.string()).optional(),
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

  // Buscar el pago objetivo para determinar su grupo
  const pagoTarget = await prisma.pago.findUnique({
    where: { id: params.id },
  });

  if (!pagoTarget) {
    return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });
  }

  // Identificar todos los pagos que corresponden a la misma operación / grupo
  let pagosGrupo: { id: string; cuotaId: string }[] = [];

  if (parsed.data.pagoIds && parsed.data.pagoIds.length > 0) {
    pagosGrupo = await prisma.pago.findMany({
      where: { id: { in: parsed.data.pagoIds } },
      select: { id: true, cuotaId: true },
    });
  } else if (pagoTarget.grupoPagoId) {
    pagosGrupo = await prisma.pago.findMany({
      where: { grupoPagoId: pagoTarget.grupoPagoId },
      select: { id: true, cuotaId: true },
    });
  } else if (pagoTarget.comprobanteUrl) {
    pagosGrupo = await prisma.pago.findMany({
      where: {
        socioId: pagoTarget.socioId,
        comprobanteUrl: pagoTarget.comprobanteUrl,
        estadoValidacion: pagoTarget.estadoValidacion,
      },
      select: { id: true, cuotaId: true },
    });
  } else {
    pagosGrupo = [{ id: pagoTarget.id, cuotaId: pagoTarget.cuotaId }];
  }

  const idsParaActualizar = pagosGrupo.map((p) => p.id);
  const cuotaIdsParaActualizar = pagosGrupo.map((p) => p.cuotaId);
  const nuevoEstado = parsed.data.accion === "APROBAR" ? "APROBADO" : "RECHAZADO";

  await prisma.pago.updateMany({
    where: { id: { in: idsParaActualizar } },
    data: {
      estadoValidacion: nuevoEstado,
      notaRechazo: parsed.data.notaRechazo ?? null,
      validadoPorId: session.user.id,
      fechaValidacion: new Date(),
    },
  });

  // Si se aprueba, todas las cuotas asociadas pasan a PAGADO
  if (parsed.data.accion === "APROBAR") {
    await prisma.cuota.updateMany({
      where: { id: { in: cuotaIdsParaActualizar } },
      data: { estado: "PAGADO" },
    });
  }

  return NextResponse.json({ ok: true, actualizados: idsParaActualizar.length });
}
