import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const patchSchema = z.object({
  estado: z.enum(["CONFIRMADO", "CANCELADO"]),
});

const DOS_DIAS_MS = 2 * 24 * 60 * 60 * 1000;

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const inscripcion = await prisma.inscripcionTaller.findUnique({ where: { id: params.id } });
  if (!inscripcion) {
    return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  }

  const esAdmin = session.user.rol !== "SOCIO";
  const esDueño = session.user.socioId === inscripcion.socioId;

  if (!esAdmin && !esDueño) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  // El socio sólo puede cancelar su propia inscripción, y sólo dentro de los
  // primeros 2 días desde que se inscribió.
  if (!esAdmin) {
    if (parsed.data.estado !== "CANCELADO") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }
    const vencido = Date.now() - inscripcion.fechaInscripcion.getTime() > DOS_DIAS_MS;
    if (vencido) {
      return NextResponse.json(
        { error: "El plazo de 2 días para darte de baja ya venció." },
        { status: 400 }
      );
    }
  }

  const actualizada = await prisma.inscripcionTaller.update({
    where: { id: params.id },
    data: { estado: parsed.data.estado },
  });

  return NextResponse.json(actualizada);
}
