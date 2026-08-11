import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user.socioId) {
    return NextResponse.json({ error: "Tenés que iniciar sesión como socio para inscribirte." }, { status: 403 });
  }

  const taller = await prisma.taller.findUnique({
    where: { id: params.id },
    include: { _count: { select: { inscripciones: true } } },
  });

  if (!taller) {
    return NextResponse.json({ error: "Taller no encontrado" }, { status: 404 });
  }

  if (taller._count.inscripciones >= taller.cuposTotales) {
    return NextResponse.json({ error: "No quedan cupos disponibles" }, { status: 409 });
  }

  const inscripcion = await prisma.inscripcionTaller.upsert({
    where: {
      tallerId_socioId: { tallerId: taller.id, socioId: session.user.socioId },
    },
    update: {},
    create: {
      tallerId: taller.id,
      socioId: session.user.socioId,
      estado: "PENDIENTE",
    },
  });

  return NextResponse.json(inscripcion, { status: 201 });
}
