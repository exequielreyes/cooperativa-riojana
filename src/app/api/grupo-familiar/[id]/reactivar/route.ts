import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// PATCH /api/grupo-familiar/[id]/reactivar
// Reactiva a un integrante del grupo familiar cuya baja haya sido voluntaria.
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const esAdmin = session.user.rol !== "SOCIO";
  const socioId = session.user.socioId;

  const asociado = await prisma.grupoFamiliar.findUnique({
    where: { id: params.id },
  });

  if (!asociado) {
    return NextResponse.json({ error: "Integrante no encontrado" }, { status: 404 });
  }

  // Si no es admin, solo puede modificar familiares de su propio socioId
  if (!esAdmin && asociado.socioId !== socioId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (asociado.parentesco.startsWith("Titular Anterior")) {
    return NextResponse.json(
      { error: "No se puede reactivar el registro del titular anterior." },
      { status: 400 }
    );
  }

  // Validación estricta: únicamente se permite reactivar si fue baja voluntaria
  const esBajaVoluntaria = asociado.motivoBaja?.startsWith("Baja voluntaria");
  if (!esBajaVoluntaria) {
    return NextResponse.json(
      { error: "Solo se pueden reactivar integrantes cuya baja haya sido voluntaria." },
      { status: 400 }
    );
  }

  try {
    const actualizado = await prisma.grupoFamiliar.update({
      where: { id: params.id },
      data: {
        activo: true,
        motivoBaja: null,
        fechaBaja: null,
      },
    });

    return NextResponse.json({ ok: true, familiar: actualizado });
  } catch (error: any) {
    console.error("Error al reactivar integrante:", error);
    return NextResponse.json(
      { error: "No se pudo reactivar el integrante en la base de datos." },
      { status: 500 }
    );
  }
}
