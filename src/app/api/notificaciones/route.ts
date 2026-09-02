import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user.socioId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const notificaciones = await prisma.notificacion.findMany({
    where: { socioId: session.user.socioId },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return NextResponse.json(notificaciones);
}