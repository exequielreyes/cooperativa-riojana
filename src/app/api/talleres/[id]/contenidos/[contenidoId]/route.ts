import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

function esEditor(rol?: string) {
  return rol === "SUPER_ADMIN" || rol === "EDITOR_CONTENIDOS";
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; contenidoId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!esEditor(session?.user.rol)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const contenido = await prisma.contenidoTaller.findUnique({
    where: { id: params.contenidoId },
  });

  if (!contenido || contenido.tallerId !== params.id) {
    return NextResponse.json({ error: "Contenido no encontrado" }, { status: 404 });
  }

  await prisma.contenidoTaller.delete({ where: { id: params.contenidoId } });

  return NextResponse.json({ ok: true });
}
