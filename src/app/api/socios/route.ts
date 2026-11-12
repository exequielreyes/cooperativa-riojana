import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { enviarEmailCredenciales } from "@/lib/email";
import { generarPasswordSegura } from "@/lib/security";

const crearSocioSchema = z.object({
  nombre: z.string().min(1),
  apellido: z.string().min(1),
  dni: z.string().min(1),
  email: z.string().email(),
  telefono: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  fechaNacimiento: z.string().nullable().optional(),
  tipoMiembro: z.enum(["PRODUCTOR", "ADHERENTE", "HONORARIO"]).default("PRODUCTOR"),
  estado: z.enum(["ACTIVO", "PENDIENTE"]).default("PENDIENTE"),
  cuotasCapital: z.coerce.number().min(1).default(1),
  montoCapital: z.coerce.number().optional(),
  cuil: z.string().nullable().optional(),
  ocupacion: z.string().nullable().optional(),
  barrio: z.string().nullable().optional(),
  entrecalles: z.string().nullable().optional(),
  fechaing: z.string().nullable().optional(),
  area: z.enum(["SEPELIO", "CONSUMO"]).default("SEPELIO"),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.rol !== "SUPER_ADMIN" && session.user.rol !== "COBRADOR")) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const socios = await prisma.socio.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(socios);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const esSuperAdmin = session?.user?.rol === "SUPER_ADMIN";

  const body = await request.json();
  const parsed = crearSocioSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;

  // Si la solicitud NO proviene de un SUPER_ADMIN autenticado, forzar siempre estado PENDIENTE
  if (!esSuperAdmin) {
    data.estado = "PENDIENTE";
  }

  const existente = await prisma.usuario.findUnique({ where: { email: data.email } });
  if (existente) {
    return NextResponse.json({ error: "Ya existe un usuario con ese correo." }, { status: 409 });
  }

  const socioExistente = await prisma.socio.findUnique({ where: { dni: data.dni } });
  if (socioExistente) {
    return NextResponse.json({ error: "Ya existe un socio registrado con ese DNI." }, { status: 409 });
  }

  // Generación segura de clave temporal con CSPRNG
  const passwordTemporal = generarPasswordSegura(12);
  const passwordHash = await bcrypt.hash(passwordTemporal, 10);

  const año = new Date().getFullYear();
  const cantidadEsteAño = await prisma.socio.count({
    where: { idCooperativa: { startsWith: `CR-${año}-` } },
  });
  const idCooperativa = `CR-${año}-${String(cantidadEsteAño + 1).padStart(4, "0")}`;

  const usuario = await prisma.usuario.create({
    data: {
      email: data.email,
      passwordHash,
      rol: "SOCIO",
      socio: {
        create: {
          nombre: data.nombre,
          apellido: data.apellido,
          dni: data.dni,
          email: data.email,
          telefono: data.telefono,
          fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
          region: data.region,
          tipoMiembro: data.tipoMiembro,
          estado: data.estado,
          idCooperativa,
          cuotasCapital: data.cuotasCapital,
          montoCapital: data.montoCapital,
          cuil: data.cuil || "",
          ocupacion: data.ocupacion || "",
          barrio: data.barrio || "",
          entrecalles: data.entrecalles || "",
          fechaing: data.fechaing ? new Date(data.fechaing) : new Date(),
          area: data.area,
        },
      },
    },
    include: { socio: true },
  });

  if (data.estado === "ACTIVO") {
    // Generar cuotas de capital
    if (data.montoCapital && data.cuotasCapital && data.cuotasCapital > 0) {
      const montoPorCuota = data.montoCapital / data.cuotasCapital;
      const cuotasParaCrear = [];
      const fechaActual = new Date();
      for (let i = 1; i <= data.cuotasCapital; i++) {
        const fechaVencimiento = new Date(fechaActual);
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);
        fechaVencimiento.setDate(10); // Vence los 10 de cada mes

        cuotasParaCrear.push({
          socioId: usuario.socio!.id,
          periodo: `${fechaVencimiento.toLocaleString("es-AR", { month: "long" })} ${fechaVencimiento.getFullYear()}`,
          concepto: data.cuotasCapital === 1 ? "Cuota Inicial" : `Cuota Inicial ${i}/${data.cuotasCapital}`,
          monto: montoPorCuota,
          fechaVencimiento,
          estado: "PENDIENTE",
        });
      }
      await prisma.cuota.createMany({ data: cuotasParaCrear as any });
    }
  }

  // Sanitizar el objeto usuario para nunca filtrar el hash de contraseña en la respuesta
  const { passwordHash: _, ...usuarioSinHash } = usuario;

  if (data.estado !== "ACTIVO") {
    // Pendiente: no devolvemos la contraseña bajo ningún concepto.
    return NextResponse.json({ usuario: usuarioSinHash }, { status: 201 });
  }

  let emailEnviado = false;
  try {
    await enviarEmailCredenciales({
      nombre: `${data.nombre} ${data.apellido}`,
      email: data.email,
      passwordTemporal,
    });
    emailEnviado = true;
  } catch (error) {
    console.error("No se pudo enviar el email de credenciales:", error);
  }

  return NextResponse.json(
    { usuario: usuarioSinHash, passwordTemporal, emailEnviado },
    { status: 201 }
  );
}
