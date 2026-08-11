import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const crearSocioSchema = z.object({
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  dni: z.string().min(1),
  email: z.string().email(),
  telefono: z.string().optional(),
  region: z.string().optional(),
  tipoMiembro: z.enum(["PRODUCTOR", "ADHERENTE", "HONORARIO"]).default("PRODUCTOR"),
  estado: z.enum(["ACTIVO", "PENDIENTE"]).default("PENDIENTE"),
});

export async function GET() {
  const socios = await prisma.socio.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(socios);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = crearSocioSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  const existente = await prisma.usuario.findUnique({ where: { email: data.email } });
  if (existente) {
    return NextResponse.json({ error: "Ya existe un usuario con ese correo." }, { status: 409 });
  }

  // Contraseña temporal: el socio la cambia en su primer ingreso (TODO: flujo de invitación por email)
  const passwordTemporal = Math.random().toString(36).slice(-10);
  const passwordHash = await bcrypt.hash(passwordTemporal, 10);

  const año = new Date().getFullYear();
  const cantidadEsteAño = await prisma.socio.count({
    where: { idCooperativa: { startsWith: `CR-${año}-` } },
  });
  const idCooperativa = `CR-${año}-${String(cantidadEsteAño + 1).padStart(4, "0")}`;

  const usuario = await prisma.usuario.create({
    data: {
      email: data.email,
      passwordHash,
      rol: "SOCIO",
      socio: {
        create: {
          nombre: data.nombre,
          apellido: data.apellido,
          dni: data.dni,
          email: data.email,
          telefono: data.telefono,
          region: data.region,
          tipoMiembro: data.tipoMiembro,
          estado: data.estado,
          idCooperativa,
        },
      },
    },
    include: { socio: true },
  });

  return NextResponse.json(
    { usuario, passwordTemporal },
    { status: 201 }
  );
}
