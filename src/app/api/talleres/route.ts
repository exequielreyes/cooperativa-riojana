import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { guardarArchivo, MAX_FILE_SIZE, TIPOS_PERMITIDOS_IMAGEN } from "@/lib/storage";
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
  instructor: z.string().optional().nullable(),
  profesorId: z.string().optional().nullable(),
  ubicacion: z.string().optional().nullable(),
  modalidad: z.enum(["PRESENCIAL", "VIRTUAL"]),
  fecha: z.string().min(1),
  horaInicio: z.string().min(1),
  horaFin: z.string().optional().nullable(),
  cuposTotales: z.coerce.number().int().positive(),
  requisitos: z.string().optional().nullable(),
  queAprenderas: z.string().optional().nullable(),
  materialUrl: z.string().optional().nullable(),
  esPago: z.boolean().default(false),
  precio: z.coerce.number().optional().nullable(),
  descuento: z.coerce.number().int().optional().nullable(),
  imagenUrl: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol === "SOCIO") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  let payload: Record<string, unknown> = {};
  let imagenUrl: string | null = null;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const imagen = formData.get("imagen");

    if (imagen instanceof File && imagen.size > 0) {
      if (imagen.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "La imagen supera los 5MB" }, { status: 400 });
      }
      if (!TIPOS_PERMITIDOS_IMAGEN.includes(imagen.type)) {
        return NextResponse.json({ error: "Formato de imagen no admitido (usá JPG, PNG o WEBP)" }, { status: 400 });
      }
      imagenUrl = await guardarArchivo(imagen, "talleres");
    }

    payload = {
      titulo: formData.get("titulo"),
      descripcion: formData.get("descripcion"),
      categoria: formData.get("categoria"),
      instructor: formData.get("instructor") || undefined,
      profesorId: formData.get("profesorId") || null,
      ubicacion: formData.get("ubicacion") || undefined,
      modalidad: formData.get("modalidad"),
      fecha: formData.get("fecha"),
      horaInicio: formData.get("horaInicio"),
      horaFin: formData.get("horaFin") || undefined,
      cuposTotales: formData.get("cuposTotales"),
      requisitos: formData.get("requisitos") || undefined,
      queAprenderas: formData.get("queAprenderas") || undefined,
      materialUrl: formData.get("materialUrl") || undefined,
      esPago: formData.get("esPago") === "true",
      precio: formData.get("precio") || null,
      descuento: formData.get("descuento") || null,
      imagenUrl: imagenUrl || (formData.get("imagenUrl") as string | null) || null,
    };
  } else {
    payload = await request.json();
    imagenUrl = (payload.imagenUrl as string | null) || null;
  }

  const parsed = crearTallerSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Si viene un profesorId, confirmamos que exista y sea realmente un PROFESOR
  if (parsed.data.profesorId) {
    const profesor = await prisma.usuario.findUnique({ where: { id: parsed.data.profesorId } });
    if (!profesor || profesor.rol !== "PROFESOR") {
      return NextResponse.json({ error: "El profesor seleccionado no es válido" }, { status: 400 });
    }
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
      imagenUrl: imagenUrl || parsed.data.imagenUrl || null,
    },
  });

  return NextResponse.json(taller, { status: 201 });
}
