import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { guardarArchivo, MAX_FILE_SIZE, TIPOS_PERMITIDOS_IMAGEN } from "@/lib/storage";
import { z } from "zod";

const editarTallerSchema = z.object({
  titulo: z.string().min(1),
  descripcion: z.string().min(1),
  categoria: z.string().min(1),
  instructor: z.string().optional().nullable(),
  profesorId: z.string().nullable().optional(),
  ubicacion: z.string().optional().nullable(),
  modalidad: z.enum(["PRESENCIAL", "VIRTUAL"]),
  fecha: z.string(),
  horaInicio: z.string(),
  horaFin: z.string().optional().nullable(),
  cuposTotales: z.coerce.number().min(1),
  requisitos: z.string().optional().nullable(),
  materialUrl: z.string().optional().nullable(),
  esPago: z.boolean().default(false),
  precio: z.coerce.number().optional().nullable(),
  descuento: z.coerce.number().optional().nullable(),
  imagenUrl: z.string().nullable().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol === "SOCIO") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  let payload: Record<string, unknown> = {};
  let nuevaImagenUrl: string | null | undefined = undefined;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const imagen = formData.get("imagen");
    const eliminarImagen = formData.get("eliminarImagen") === "true";

    if (imagen instanceof File && imagen.size > 0) {
      if (imagen.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "La imagen supera los 5MB" }, { status: 400 });
      }
      if (!TIPOS_PERMITIDOS_IMAGEN.includes(imagen.type)) {
        return NextResponse.json({ error: "Formato de imagen no admitido (usá JPG, PNG o WEBP)" }, { status: 400 });
      }
      nuevaImagenUrl = await guardarArchivo(imagen, "talleres");
    } else if (eliminarImagen) {
      nuevaImagenUrl = null;
    }

    payload = {
      titulo: formData.get("titulo"),
      descripcion: formData.get("descripcion"),
      categoria: formData.get("categoria"),
      instructor: formData.get("instructor") || null,
      profesorId: formData.get("profesorId") || null,
      ubicacion: formData.get("ubicacion") || null,
      modalidad: formData.get("modalidad"),
      fecha: formData.get("fecha"),
      horaInicio: formData.get("horaInicio"),
      horaFin: formData.get("horaFin") || null,
      cuposTotales: formData.get("cuposTotales"),
      requisitos: formData.get("requisitos") || null,
      materialUrl: formData.get("materialUrl") || null,
      esPago: formData.get("esPago") === "true",
      precio: formData.get("precio") || null,
      descuento: formData.get("descuento") || null,
    };
  } else {
    payload = await request.json();
    if ("imagenUrl" in payload) {
      nuevaImagenUrl = payload.imagenUrl as string | null;
    }
  }

  const parsed = editarTallerSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  // Si viene un profesorId, confirmamos que exista y sea realmente un PROFESOR
  if (data.profesorId) {
    const profesor = await prisma.usuario.findUnique({ where: { id: data.profesorId } });
    if (!profesor || profesor.rol !== "PROFESOR") {
      return NextResponse.json({ error: "El profesor seleccionado no es válido" }, { status: 400 });
    }
  }

  try {
    const updateData: any = {
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
    };

    if (nuevaImagenUrl !== undefined) {
      updateData.imagenUrl = nuevaImagenUrl;
    }

    const taller = await prisma.taller.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(taller);
  } catch (error) {
    console.error("Error al actualizar el taller:", error);
    return NextResponse.json({ error: "No se pudo actualizar el taller." }, { status: 500 });
  }
}
