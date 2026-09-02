import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

export async function GET() {
  const configuracion = await prisma.configuracionCooperativa.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });
  return NextResponse.json(configuracion);
}

const configuracionSchema = z.object({
  montoCuotaActual: z.coerce.number().positive().optional(),
  montoCapitalActual: z.coerce.number().positive().optional(),
  cbu: z.string().optional(),
  alias: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol === "SOCIO") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = configuracionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const updateData: any = {};
  if (parsed.data.montoCuotaActual !== undefined) updateData.montoCuotaActual = parsed.data.montoCuotaActual;
  if (parsed.data.montoCapitalActual !== undefined) updateData.montoCapitalActual = parsed.data.montoCapitalActual;
  if (parsed.data.cbu !== undefined) updateData.cbu = parsed.data.cbu;
  if (parsed.data.alias !== undefined) updateData.alias = parsed.data.alias;

  const configuracion = await prisma.configuracionCooperativa.upsert({
    where: { id: "singleton" },
    update: updateData,
    create: { id: "singleton", ...updateData },
  });

  return NextResponse.json(configuracion);
}
