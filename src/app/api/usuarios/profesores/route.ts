import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol === "SOCIO" || session.user.rol === "PROFESOR") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const profesores = await prisma.usuario.findMany({
    where: { rol: "PROFESOR", activo: true },
    select: { id: true, nombre: true, email: true },
    orderBy: { nombre: "asc" },
  });

  return NextResponse.json(profesores);
}