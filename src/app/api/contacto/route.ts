import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const contactoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Correo electrónico inválido"),
  asunto: z.string().optional(),
  mensaje: z.string().min(1, "El mensaje es obligatorio"),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = contactoSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { nombre, email, asunto, mensaje } = parsed.data;

  // TODO: reemplazar por el envío real (email transaccional) y/o
  // persistir la consulta en una tabla propia de Prisma
  // (por ejemplo `ConsultaContacto`) para que el panel admin pueda listarlas.
  console.log("Nueva consulta de contacto:", {
    nombre,
    email,
    asunto,
    mensaje,
    fecha: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
