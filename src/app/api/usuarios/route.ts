import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";


const crearProfesorSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Correo inválido"),
});


// export async function GET(request: NextRequest) {
//   const session = await getServerSession(authOptions);
//   if (session?.user.rol !== "SUPER_ADMIN") {
//     return NextResponse.json({ error: "No autorizado" }, { status: 403 });
//   }

//   const rol = request.nextUrl.searchParams.get("rol") ?? undefined;

//   const usuarios = await prisma.usuario.findMany({
//     where: rol ? { rol: rol as "SOCIO" | "SUPER_ADMIN" | "EDITOR_CONTENIDOS" | "PROFESOR" } : undefined,
//     select: {
//       id: true,
//       nombre: true,
//       email: true,
//       rol: true,
//       activo: true,
//       createdAt: true,
//       socio: { select: { nombre: true, apellido: true, idCooperativa: true } },
//     },
//     orderBy: { createdAt: "desc" },
//   });

//   return NextResponse.json(usuarios);
// }

// const crearUsuarioSchema = z.object({
//   nombre: z.string().min(1),
//   email: z.string().email(),
//   rol: z.enum(["SOCIO", "PROFESOR"]),
// });

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user.rol !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = crearProfesorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existente = await prisma.usuario.findUnique({ where: { email: parsed.data.email } });
  if (existente) {
    return NextResponse.json({ error: "Ya existe un usuario con ese correo." }, { status: 409 });
  }

  // Nota: para dar rol PROFESOR a alguien que ya es socio, se usa
  // PATCH /api/usuarios/[id] en vez de este endpoint (que crea una cuenta nueva).
  const passwordTemporal = Math.random().toString(36).slice(-10);
  const passwordHash = await bcrypt.hash(passwordTemporal, 10);

  const usuario = await prisma.usuario.create({
    data: {
      nombre: parsed.data.nombre,
      email: parsed.data.email,
      passwordHash,
      rol: "PROFESOR",
    },
  });

  return NextResponse.json({ usuario, passwordTemporal }, { status: 201 });
}