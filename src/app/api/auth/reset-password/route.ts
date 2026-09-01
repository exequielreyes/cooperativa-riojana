import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { hashearToken } from "@/lib/passwordReset";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    );
  }

  const tokenHash = hashearToken(parsed.data.token);

  const registro = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  const invalido =
    !registro || registro.usedAt !== null || registro.expiresAt.getTime() < Date.now();

  if (invalido) {
    return NextResponse.json(
      { error: "El enlace es inválido o ya expiró. Pedí uno nuevo." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  await prisma.$transaction([
    prisma.usuario.update({
      where: { id: registro.usuarioId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: registro.id },
      data: { usedAt: new Date() },
    }),
    // Invalidamos cualquier otro enlace de reseteo pendiente de este
    // usuario, para que no queden links viejos todavía "vivos".
    prisma.passwordResetToken.updateMany({
      where: { usuarioId: registro.usuarioId, usedAt: null, id: { not: registro.id } },
      data: { usedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
