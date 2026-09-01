import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { generarTokenReseteo, RESETEO_EXPIRA_EN_MINUTOS } from "@/lib/passwordReset";
import { enviarEmailRecuperacion } from "@/lib/email";

const schema = z.object({
  email: z.string().email(),
});

// Mensaje idéntico siempre, exista o no el email — evita que alguien use
// este formulario para averiguar qué correos están registrados.
const MENSAJE_GENERICO =
  "Si ese email está registrado, te enviamos un enlace para restablecer tu contraseña.";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Ingresá un email válido." }, { status: 400 });
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email: parsed.data.email },
    include: { socio: true },
  });

  // No revelamos si existe o no: siempre respondemos igual y con 200.
  if (!usuario || !usuario.activo) {
    return NextResponse.json({ mensaje: MENSAJE_GENERICO });
  }

  const { tokenPlano, tokenHash } = generarTokenReseteo();
  const expiresAt = new Date(Date.now() + RESETEO_EXPIRA_EN_MINUTOS * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { usuarioId: usuario.id, tokenHash, expiresAt },
  });

  const urlBase = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const urlReseteo = `${urlBase}/restablecer-contrasena?token=${tokenPlano}`;

  try {
    await enviarEmailRecuperacion({
      nombre: usuario.socio ? `${usuario.socio.nombre} ${usuario.socio.apellido}` : usuario.email,
      email: usuario.email,
      urlReseteo,
    });
  } catch (error) {
    // No exponemos el error de email al usuario (evitaría el mismo problema
    // de enumeración), pero sí lo logueamos para que el admin lo detecte.
    console.error("No se pudo enviar el email de recuperación:", error);
    // Agregado para pruebas locales con Resend (sandbox):
    console.log(`\n======================================================`);
    console.log(`🔗 ENLACE DE RECUPERACIÓN DE CONTRASEÑA (FALLBACK) 🔗`);
    //console.log(`${urlReseteo}`);
    console.log(`======================================================\n`);
  }

  return NextResponse.json({ mensaje: MENSAJE_GENERICO });
}
