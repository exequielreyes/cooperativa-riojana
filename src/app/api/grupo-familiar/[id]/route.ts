import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const actualizarAsociadoSchema = z.object({
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  dni: z.string().optional(),
  parentesco: z.string().min(1),
  fechaNacimiento: z.string().optional().nullable(),
  email: z.string().email().optional().or(z.literal("")),
  telefono: z.string().optional(),
});

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

export async function PUT(
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

  const body = await request.json();
  const parsed = actualizarAsociadoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { fechaNacimiento, ...rest } = parsed.data;
  const dataToSave = {
    ...rest,
    fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null
  };

  const actualizado = await prisma.grupoFamiliar.update({
    where: { id: params.id },
    data: dataToSave,
  });

  return NextResponse.json(actualizado);
}
