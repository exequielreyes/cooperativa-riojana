import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

export async function GET() {
  try {
    const respuestas = await prisma.chatbotRespuesta.findMany({
      where: { activa: true },
      orderBy: { orden: "asc" },
    });
    return NextResponse.json(respuestas);
  } catch (error) {
    console.error("Error al obtener respuestas:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

const crearSchema = z.object({
  pregunta: z.string().trim().optional().nullable(),
  palabrasClave: z.string().min(1, "Las palabras clave son requeridas"),
  respuesta: z.string().min(1, "La respuesta es requerida"),
  // Link opcional al que puede ir el socio desde la respuesta (ej: /talleres)
  link: z.string().trim().optional().nullable(),
  linkTexto: z.string().trim().optional().nullable(),
  orden: z.coerce.number().int().default(0),
});


export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol === "SOCIO") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  try {
    const body = await request.json();
    const parsed = crearSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
    const { pregunta, palabrasClave, respuesta, link, linkTexto, orden } = parsed.data;

    // Si cargaron un link, exigimos que también tenga texto (o le ponemos uno por defecto)
    const nuevaRespuesta = await prisma.chatbotRespuesta.create({
      data: {
        pregunta: pregunta || null,
        palabrasClave,
        respuesta,
        link: link || null,
        linkTexto: link ? linkTexto || "Ver más →" : null,
        orden,
        activa: true,
      },
    });

    return NextResponse.json(nuevaRespuesta, { status: 201 });
  } catch (error) {
    console.error("Error al crear respuesta:", error);
    return NextResponse.json({ error: "Error al guardar en la base de datos" }, { status: 500 });
  }
}
