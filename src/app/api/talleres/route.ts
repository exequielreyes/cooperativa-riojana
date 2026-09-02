import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

export async function GET() {
  const talleres = await prisma.taller.findMany({
    orderBy: { fecha: "asc" },
  });
  return NextResponse.json(talleres);
}

const crearTallerSchema = z.object({
  titulo: z.string().min(1),
  descripcion: z.string().min(1),
  categoria: z.string().min(1),
  instructor: z.string().optional(),
  ubicacion: z.string().optional(),
  modalidad: z.enum(["PRESENCIAL", "VIRTUAL"]),
  fecha: z.string().min(1),
  horaInicio: z.string().min(1),
  horaFin: z.string().optional(),
  cuposTotales: z.coerce.number().int().positive(),
  requisitos: z.string().optional(),
  materialUrl: z.string().optional(),
  esPago: z.boolean().default(false),
  precio: z.coerce.number().optional().nullable(),
  descuento: z.coerce.number().int().optional().nullable(),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol === "SOCIO") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = crearTallerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const slugBase = parsed.data.titulo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const existentes = await prisma.taller.count({ where: { slug: { startsWith: slugBase } } });
  const slug = existentes > 0 ? `${slugBase}-${existentes + 1}` : slugBase;

  const taller = await prisma.taller.create({
    data: {
      ...parsed.data,
      slug,
      fecha: new Date(parsed.data.fecha),
    },
  });

  return NextResponse.json(taller, { status: 201 });
}
