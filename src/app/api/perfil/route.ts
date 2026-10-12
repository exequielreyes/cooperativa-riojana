import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const editarPerfilSchema = z.object({
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  telefono: z.string().optional(),
  fechaNacimiento: z.string().nullable().optional(),
  email: z.string().email().optional(),
});

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user.socioId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = editarPerfilSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const socioActual = await prisma.socio.findUnique({
    where: { id: session.user.socioId },
  });
  if (!socioActual) {
    return NextResponse.json({ error: "Socio no encontrado" }, { status: 404 });
  }

  if (parsed.data.email && parsed.data.email.toLowerCase() !== socioActual.email.toLowerCase()) {
    const emailExistente = await prisma.usuario.findFirst({
      where: {
        email: parsed.data.email,
        id: { not: socioActual.usuarioId },
      },
    });
    if (emailExistente) {
      return NextResponse.json({ error: "El correo electrónico ya está en uso." }, { status: 400 });
    }

    await prisma.usuario.update({
      where: { id: socioActual.usuarioId },
      data: { email: parsed.data.email },
    });
  }

  const dataToUpdate: any = { ...parsed.data };
  if (dataToUpdate.fechaNacimiento) {
    dataToUpdate.fechaNacimiento = new Date(dataToUpdate.fechaNacimiento);
  }

  const socio = await prisma.socio.update({
    where: { id: session.user.socioId },
    data: dataToUpdate,
  });

  return NextResponse.json(socio);
}
