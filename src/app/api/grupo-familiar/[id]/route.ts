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
  motivoBaja: z.string().optional().nullable(),
  activo: z.boolean().optional(),
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const esAdmin = session.user.rol !== "SOCIO";
  const socioId = session.user.socioId;

  const asociado = await prisma.grupoFamiliar.findUnique({ where: { id: params.id } });
  if (!asociado) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  if (!esAdmin && asociado.socioId !== socioId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (asociado.parentesco.startsWith("Titular Anterior")) {
    return NextResponse.json({ error: "No se puede eliminar el registro del titular anterior." }, { status: 400 });
  }

  // Conservación de datos históricos: en lugar de un borrado físico destructivo,
  // se registra la baja conservando los datos para futuras consultas.
  // Si viene un motivo en query o body, lo toma; de lo contrario usa "Baja voluntaria".
  const motivo = request.nextUrl.searchParams.get("motivo") || "Baja voluntaria";

  await prisma.grupoFamiliar.update({
    where: { id: params.id },
    data: {
      activo: false,
      motivoBaja: motivo,
      fechaBaja: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const esAdmin = session.user.rol !== "SOCIO";
  const socioId = session.user.socioId;

  const asociado = await prisma.grupoFamiliar.findUnique({ where: { id: params.id } });
  if (!asociado) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  if (!esAdmin && asociado.socioId !== socioId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (asociado.parentesco.startsWith("Titular Anterior")) {
    return NextResponse.json({ error: "No se puede modificar el registro del titular anterior." }, { status: 400 });
  }

  const body = await request.json();
  const parsed = actualizarAsociadoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { fechaNacimiento, ...rest } = parsed.data;
  const dataToSave: any = {
    ...rest,
    fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null
  };

  const actualizado = await prisma.grupoFamiliar.update({
    where: { id: params.id },
    data: dataToSave,
  });

  return NextResponse.json(actualizado);
}
