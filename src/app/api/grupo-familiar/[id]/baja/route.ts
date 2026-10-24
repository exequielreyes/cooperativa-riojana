import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const darBajaAsociadoSchema = z.object({
  motivoBaja: z.string().min(1, "El motivo de baja es obligatorio"),
});

// PATCH /api/grupo-familiar/[id]/baja
// Registra el egreso o la baja de un integrante del grupo familiar conservando sus datos históricos.
// Permite acceso tanto al socio titular dueño del grupo como a administradores.
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
      { error: "No se puede dar de baja el registro del titular anterior desde aquí." },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const parsed = darBajaAsociadoSchema.safeParse(body);
  if (!parsed.success) {
    const errorMsg = parsed.error.errors[0]?.message || "Datos inválidos";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }

  try {
    const actualizado = await prisma.grupoFamiliar.update({
      where: { id: params.id },
      data: {
        activo: false,
        motivoBaja: parsed.data.motivoBaja,
        fechaBaja: new Date(),
      },
    });

    return NextResponse.json({ ok: true, familiar: actualizado });
  } catch (error: any) {
    console.error("Error al registrar baja de familiar:", error);
    return NextResponse.json(
      { error: "No se pudo registrar la baja en la base de datos." },
      { status: 500 }
    );
  }
}
