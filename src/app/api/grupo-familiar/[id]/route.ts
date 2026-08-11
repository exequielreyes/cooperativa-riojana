import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user.socioId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const asociado = await prisma.grupoFamiliar.findUnique({ where: { id: params.id } });
  if (!asociado || asociado.socioId !== session.user.socioId) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  await prisma.grupoFamiliar.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
