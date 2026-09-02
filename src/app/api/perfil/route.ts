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
