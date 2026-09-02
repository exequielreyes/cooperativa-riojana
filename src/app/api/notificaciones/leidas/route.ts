import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH() {
  const session = await getServerSession(authOptions);
  if (!session?.user.socioId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  await prisma.notificacion.updateMany({
    where: { socioId: session.user.socioId, leida: false },
    data: { leida: true },
  });

  return NextResponse.json({ success: true });
}