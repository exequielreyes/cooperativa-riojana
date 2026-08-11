import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const editarSocioSchema = z.object({
  nombre: z.string().min(1).optional(),
  apellido: z.string().min(1).optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  region: z.string().optional(),
  tipoMiembro: z.enum(["PRODUCTOR", "ADHERENTE", "HONORARIO"]).optional(),
  estado: z.enum(["ACTIVO", "PENDIENTE", "INACTIVO"]).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const socio = await prisma.socio.findUnique({ where: { id: params.id } });
  if (!socio) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(socio);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol === "SOCIO") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = editarSocioSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const socioActual = await prisma.socio.findUnique({ where: { id: params.id } });
  if (!socioActual) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  // Si la solicitud pasa de PENDIENTE a ACTIVO (aprobación del admin), generamos
  // recién ahora la contraseña temporal y se la devolvemos al admin para que
  // se la comparta al socio. Antes de aprobarse, el socio no tiene forma de
  // ingresar (a propósito).
  const aprobando = socioActual.estado === "PENDIENTE" && parsed.data.estado === "ACTIVO";
  let passwordTemporal: string | undefined;

  if (aprobando) {
    passwordTemporal = Math.random().toString(36).slice(-10);
    const passwordHash = await bcrypt.hash(passwordTemporal, 10);
    await prisma.usuario.update({
      where: { id: socioActual.usuarioId },
      data: { passwordHash },
    });
  }

  // Dar de baja desactiva también el acceso a la cuenta; reactivar lo restaura.
  if (parsed.data.estado === "INACTIVO") {
    await prisma.usuario.update({ where: { id: socioActual.usuarioId }, data: { activo: false } });
  } else if (parsed.data.estado === "ACTIVO") {
    await prisma.usuario.update({ where: { id: socioActual.usuarioId }, data: { activo: true } });
  }

  const socio = await prisma.socio.update({
    where: { id: params.id },
    data: parsed.data,
  });

  return NextResponse.json({ socio, passwordTemporal });
}
