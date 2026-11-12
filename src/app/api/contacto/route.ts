import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enviarEmailContacto } from "@/lib/email";
import { checkRateLimit } from "@/lib/security";

const contactoSchema = z.object({
  nombre: z.string().min(1, "El nombre es obligatorio"),
  email: z.string().email("Correo electrónico inválido"),
  asunto: z.string().optional(),
  mensaje: z.string().min(1, "El mensaje es obligatorio"),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const rateLimit = checkRateLimit(`contacto_${ip}`, 5, 60000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Demasiadas consultas enviadas. Por favor, aguardá un momento antes de volver a intentar." },
      { status: 429 }
    );
  }

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
