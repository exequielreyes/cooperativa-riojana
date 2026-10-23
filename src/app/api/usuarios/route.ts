import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";


const crearProfesorSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Correo inválido"),
  dni: z.string().optional(),
  codigoIdentificador: z.string().optional(),
  rol: z.enum(["PROFESOR", "PROMOTOR", "COBRADOR"]).optional().default("PROFESOR"),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user.rol !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = crearProfesorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos. Verificá el nombre y correo." }, { status: 400 });
    }

    const existente = await prisma.usuario.findUnique({ where: { email: parsed.data.email } });
    if (existente) {
      return NextResponse.json({ error: "Ya existe un usuario con ese correo." }, { status: 409 });
    }

    const passwordTemporal = Math.random().toString(36).slice(-10);
    const passwordHash = await bcrypt.hash(passwordTemporal, 10);

    const rolFinal = parsed.data.rol;
    const prefijoRol =
      rolFinal === "PROFESOR" ? "PROF" : rolFinal === "PROMOTOR" ? "PROM" : "COB";
    const cantidadDelRol = await prisma.usuario.count({ where: { rol: rolFinal } });
    const codigoGenerado =
      parsed.data.codigoIdentificador ||
      `${prefijoRol}-${String(cantidadDelRol + 1).padStart(4, "0")}`;

    const usuario = await prisma.usuario.create({
      data: {
        nombre: parsed.data.nombre,
        email: parsed.data.email,
        dni: parsed.data.dni || null,
        codigoIdentificador: codigoGenerado,
        passwordHash,
        rol: rolFinal,
      },
    });

    return NextResponse.json({ usuario, passwordTemporal }, { status: 201 });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return NextResponse.json(
      { error: "Ocurrió un error en el servidor al crear la cuenta." },
      { status: 500 }
    );
  }
}
