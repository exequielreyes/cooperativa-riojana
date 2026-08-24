import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enviarEmailContacto } from "@/lib/email";

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

  try {
    await enviarEmailContacto(parsed.data);
  } catch (error) {
    console.error("Error enviando email de contacto:", error);
    return NextResponse.json(
      {
        error:
          "No se pudo enviar tu consulta por email. Por favor, intentá nuevamente o escribinos directamente a contacto@coopriojana.com.ar.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
