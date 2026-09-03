import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const editarTallerSchema = z.object({
  titulo: z.string().min(1),
  descripcion: z.string().min(1),
  categoria: z.string().min(1),
  instructor: z.string().optional(),
  profesorId: z.string().nullable().optional(),
  ubicacion: z.string().optional(),
  modalidad: z.enum(["PRESENCIAL", "VIRTUAL"]),
  fecha: z.string(),
  horaInicio: z.string(),
  horaFin: z.string().optional(),
  cuposTotales: z.coerce.number().min(1),
  requisitos: z.string().optional(),
  materialUrl: z.string().optional(),
  esPago: z.boolean().default(false),
  precio: z.coerce.number().optional().nullable(),
  descuento: z.coerce.number().optional().nullable(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol === "SOCIO") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = editarTallerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  try {
    const taller = await prisma.taller.update({
      where: { id: params.id },
      data: {
        titulo: data.titulo,
        descripcion: data.descripcion,
        categoria: data.categoria,
        instructor: data.instructor || null,
        profesorId: data.profesorId || null,
        ubicacion: data.ubicacion || null,
        modalidad: data.modalidad,
        fecha: new Date(data.fecha),
        horaInicio: data.horaInicio,
        horaFin: data.horaFin || null,
        cuposTotales: data.cuposTotales,
        requisitos: data.requisitos || null,
        materialUrl: data.materialUrl || null,
        esPago: data.esPago,
        precio: data.esPago ? data.precio : null,
        descuento: data.esPago ? data.descuento : null,
      },
    });

    return NextResponse.json(taller);
  } catch (error) {
    console.error("Error al actualizar el taller:", error);
    return NextResponse.json({ error: "No se pudo actualizar el taller." }, { status: 500 });
  }
}
