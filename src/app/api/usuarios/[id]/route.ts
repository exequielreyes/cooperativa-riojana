import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (session?.user.rol !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = params;

  // Evitar que el Super Admin elimine su propia cuenta
  if (id === session.user.id) {
    return NextResponse.json(
      { error: "No podés eliminar tu propia cuenta de administrador." },
      { status: 400 }
    );
  }

  try {
    await prisma.usuario.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al eliminar el usuario." },
      { status: 500 }
    );
  }
}
