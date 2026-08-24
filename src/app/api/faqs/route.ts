import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

export async function GET() {
  const faqs = await prisma.preguntaFrecuente.findMany({
    where: { activa: true },
    orderBy: { orden: "asc" },
  });
  return NextResponse.json(faqs);
}

const crearFaqSchema = z.object({
  pregunta: z.string().min(1),
  respuesta: z.string().min(1),
  orden: z.coerce.number().int().default(0),
});

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol === "SOCIO") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = crearFaqSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const faq = await prisma.preguntaFrecuente.create({ data: parsed.data });
  return NextResponse.json(faq, { status: 201 });
}
