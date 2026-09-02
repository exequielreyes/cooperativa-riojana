import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { guardarArchivo, MAX_FILE_SIZE } from "@/lib/storage";

const TIPOS_PERMITIDOS_MATERIAL = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
];

function esEditor(rol?: string) {
  return rol === "SUPER_ADMIN" || rol === "EDITOR_CONTENIDOS";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const contenidos = await prisma.contenidoTaller.findMany({
    where: { tallerId: params.id },
    orderBy: { orden: "asc" },
  });
  return NextResponse.json(contenidos);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const taller = await prisma.taller.findUnique({ where: { id: params.id } });
  if (!taller) {
    return NextResponse.json({ error: "Taller no encontrado" }, { status: 404 });
  }

  // Puede subir material: admin/editor de contenidos (cualquier taller), o el
  // profesor asignado a ESTE taller puntual (no a cualquier otro).
  const puedeGestionar =
    esEditor(session.user.rol) ||
    (session.user.rol === "PROFESOR" && taller.profesorId === session.user.id);

  if (!puedeGestionar) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const formData = await request.formData();
  const titulo = formData.get("titulo");
  const descripcion = formData.get("descripcion");
  const tipo = formData.get("tipo"); // DOCUMENTO | VIDEO | ENLACE
  const enlace = formData.get("url"); // usado cuando tipo es VIDEO o ENLACE
  const archivo = formData.get("archivo"); // usado cuando tipo es DOCUMENTO

  if (typeof titulo !== "string" || titulo.trim().length === 0) {
    return NextResponse.json({ error: "El título es obligatorio" }, { status: 400 });
  }
  if (tipo !== "DOCUMENTO" && tipo !== "VIDEO" && tipo !== "ENLACE") {
    return NextResponse.json({ error: "Tipo de contenido inválido" }, { status: 400 });
  }

  let url: string;

  if (tipo === "DOCUMENTO") {
    if (!(archivo instanceof File) || archivo.size === 0) {
      return NextResponse.json({ error: "Adjuntá un archivo" }, { status: 400 });
    }
    if (archivo.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "El archivo supera los 5MB" }, { status: 400 });
    }
    if (!TIPOS_PERMITIDOS_MATERIAL.includes(archivo.type)) {
      return NextResponse.json(
        { error: "Formato no admitido (PDF, imagen, Word, PowerPoint o Excel)" },
        { status: 400 }
      );
    }
    url = await guardarArchivo(archivo, `talleres/${params.id}`);
  } else {
    if (typeof enlace !== "string" || enlace.trim().length === 0) {
      return NextResponse.json({ error: "Pegá un link válido" }, { status: 400 });
    }
    try {
      url = new URL(enlace.trim()).toString();
    } catch {
      return NextResponse.json({ error: "El link no es una URL válida" }, { status: 400 });
    }
  }

  const totalActual = await prisma.contenidoTaller.count({ where: { tallerId: params.id } });

  const contenido = await prisma.contenidoTaller.create({
    data: {
      tallerId: params.id,
      titulo: titulo.trim(),
      descripcion: typeof descripcion === "string" ? descripcion.trim() || null : null,
      tipo,
      url,
      orden: totalActual,
    },
  });

  // Notificar a los socios inscriptos
  const inscriptos = await prisma.inscripcionTaller.findMany({
    where: {
      tallerId: params.id,
      estado: "CONFIRMADO",
    },
    select: { socioId: true },
  });

  if (inscriptos.length > 0) {
    await prisma.notificacion.createMany({
      data: inscriptos.map((inscripcion) => ({
        socioId: inscripcion.socioId,
        titulo: `Nuevo material en: ${taller.titulo}`,
        mensaje: `Se ha publicado un nuevo contenido titulado "${contenido.titulo}".`,
        link: `/portal/talleres/${params.id}/contenido`,
      })),
    });
  }

  return NextResponse.json(contenido, { status: 201 });
}