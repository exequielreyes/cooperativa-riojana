import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const patchSchema = z.object({
  pregunta: z.string().trim().optional().nullable(),
  palabrasClave: z.string().min(1).optional(),
  respuesta: z.string().min(1).optional(),
  link: z.string().trim().optional().nullable(),
  linkTexto: z.string().trim().optional().nullable(),
  orden: z.coerce.number().int().optional(),
  activa: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol === "SOCIO") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }

    const data = { ...parsed.data };
    // Si limpiaron el link, limpiamos también el texto del botón para no dejar basura suelta.
    if (data.link !== undefined && !data.link) {
      data.linkTexto = null;
    } else if (data.link && !data.linkTexto) {
      data.linkTexto = "Ver más →";
    }

    const respuestaActualizada = await prisma.chatbotRespuesta.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(respuestaActualizada);
  } catch (error) {
    console.error("Error al actualizar respuesta:", error);
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol === "SOCIO") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
try {
  await prisma.chatbotRespuesta.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error al eliminar respuesta:", error);
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
