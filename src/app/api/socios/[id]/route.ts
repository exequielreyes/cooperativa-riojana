import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { enviarEmailCredenciales } from "@/lib/email";

const editarSocioSchema = z.object({
  nombre: z.string().min(1).optional(),
  apellido: z.string().min(1).optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  region: z.string().optional(),
  tipoMiembro: z.enum(["PRODUCTOR", "ADHERENTE", "HONORARIO"]).optional(),
  estado: z.enum(["ACTIVO", "PENDIENTE", "INACTIVO"]).optional(),
  motivoBaja: z.string().nullable().optional(),
  fechaNacimiento: z.string().nullable().optional(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const socio = await prisma.socio.findUnique({ where: { id: params.id } });
  if (!socio) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return NextResponse.json(socio);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol === "SOCIO") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = editarSocioSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const socioActual = await prisma.socio.findUnique({ where: { id: params.id } });
  if (!socioActual) {
    return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  }

  // Si la solicitud pasa de PENDIENTE a ACTIVO (aprobación del admin), generamos
  // recién ahora la contraseña temporal y se la devolvemos al admin para que
  // se la comparta al socio. Antes de aprobarse, el socio no tiene forma de
  // ingresar (a propósito).
  const aprobando = socioActual.estado === "PENDIENTE" && parsed.data.estado === "ACTIVO";
  let passwordTemporal: string | undefined;
  let emailEnviado = false;

  if (aprobando) {
    passwordTemporal = Math.random().toString(36).slice(-10);
    const passwordHash = await bcrypt.hash(passwordTemporal, 10);
    await prisma.usuario.update({
      where: { id: socioActual.usuarioId },
      data: { passwordHash },
    });

    // Si el email falla (Resend no configurado, casilla inválida, etc.) no
    // frenamos la aprobación: el admin igual ve la contraseña en pantalla
    // y puede compartirla manualmente.
    try {
      await enviarEmailCredenciales({
        nombre: `${socioActual.nombre} ${socioActual.apellido}`,
        email: socioActual.email,
        passwordTemporal,
      });
      emailEnviado = true;
    } catch (error) {
      console.error("No se pudo enviar el email de credenciales:", error);
    }

    // Generar cuotas de capital
    if (socioActual.montoCapital && socioActual.cuotasCapital && socioActual.cuotasCapital > 0) {
      // Verificamos si ya tiene cuotas de capital para no duplicar (por si se aprueba 2 veces por error)
      const cuotasExistentes = await prisma.cuota.count({
        where: { socioId: socioActual.id, concepto: { startsWith: "Cuota Inicial" } },
      });

      if (cuotasExistentes === 0) {
        const montoPorCuota = Number(socioActual.montoCapital) / socioActual.cuotasCapital;
        const cuotasParaCrear = [];
        const fechaActual = new Date();
        for (let i = 1; i <= socioActual.cuotasCapital; i++) {
          const fechaVencimiento = new Date(fechaActual);
          fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);
          fechaVencimiento.setDate(10); // Vence los 10 de cada mes
          
          cuotasParaCrear.push({
            socioId: socioActual.id,
            periodo: `${fechaVencimiento.toLocaleString('es-AR', { month: 'long' })} ${fechaVencimiento.getFullYear()}`,
            concepto: socioActual.cuotasCapital === 1 ? "Cuota Inicial" : `Cuota Inicial ${i}/${socioActual.cuotasCapital}`,
            monto: montoPorCuota,
            fechaVencimiento,
            estado: "PENDIENTE",
          });
        }
        await prisma.cuota.createMany({ data: cuotasParaCrear as any });
      }
    }
  }

  // Dar de baja desactiva también el acceso a la cuenta; reactivar lo restaura.
  if (parsed.data.estado === "INACTIVO") {
    await prisma.usuario.update({ where: { id: socioActual.usuarioId }, data: { activo: false } });
  } else if (parsed.data.estado === "ACTIVO") {
    await prisma.usuario.update({ where: { id: socioActual.usuarioId }, data: { activo: true } });
  }

  const dataToUpdate: any = { ...parsed.data };
  if (dataToUpdate.fechaNacimiento) {
    dataToUpdate.fechaNacimiento = new Date(dataToUpdate.fechaNacimiento);
  }

  const socio = await prisma.socio.update({
    where: { id: params.id },
    data: dataToUpdate,
  });

  return NextResponse.json({ socio, passwordTemporal, emailEnviado });
}
