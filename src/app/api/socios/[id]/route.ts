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
  dni: z.string().min(1).optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  region: z.string().optional(),
  tipoMiembro: z.enum(["PRODUCTOR", "ADHERENTE", "HONORARIO"]).optional(),
  estado: z.enum(["ACTIVO", "PENDIENTE", "INACTIVO"]).optional(),
  motivoBaja: z.string().nullable().optional(),
  fechaNacimiento: z.string().nullable().optional(),
  cuil: z.string().nullable().optional(),
  ocupacion: z.string().nullable().optional(),
  barrio: z.string().nullable().optional(),
  entrecalles: z.string().nullable().optional(),
  fechaing: z.string().nullable().optional(),
  email: z.string().email().optional(),
  transferirAId: z.string().nullable().optional(),
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

  if (parsed.data.email && parsed.data.email.toLowerCase() !== socioActual.email.toLowerCase()) {
    const emailExistente = await prisma.usuario.findFirst({
      where: {
        email: parsed.data.email,
        id: { not: socioActual.usuarioId },
      },
    });
    if (emailExistente) {
      return NextResponse.json({ error: "El correo electrónico ya está en uso." }, { status: 400 });
    }

    await prisma.usuario.update({
      where: { id: socioActual.usuarioId },
      data: { email: parsed.data.email },
    });
  }

  // Traspaso de titularidad si se dio de baja y se seleccionó un familiar
  if (parsed.data.estado === "INACTIVO" && parsed.data.transferirAId) {
    const familiar = await prisma.grupoFamiliar.findFirst({
      where: { id: parsed.data.transferirAId, socioId: socioActual.id },
    });

    if (familiar) {
      if (familiar.dni && familiar.dni.trim() !== "") {
        const dniColision = await prisma.socio.findFirst({
          where: { dni: familiar.dni, id: { not: socioActual.id } },
        });
        if (dniColision) {
          return NextResponse.json({ error: `El DNI ${familiar.dni} ya pertenece a otro socio registrado.` }, { status: 400 });
        }
      }

      let motivoFinal = parsed.data.motivoBaja;
      if (motivoFinal === "FALLECIMIENTO") motivoFinal = "Fallecimiento";
      else if (motivoFinal === "FALTA_PAGO") motivoFinal = "Falta de pago";
      else if (motivoFinal === "BAJA_VOLUNTARIA") motivoFinal = "Baja voluntaria";

      const usuarioExTitular = await prisma.usuario.create({
        data: {
          email: `baja-${Date.now()}-${socioActual.email}`,
          passwordHash: "inactivo",
          rol: "SOCIO",
          activo: false,
        },
      });

      const nuevoDni = familiar.dni && familiar.dni.trim() !== "" ? familiar.dni : `${socioActual.dni}-T`;
      const exTitularDni = socioActual.dni;

      await prisma.socio.update({
        where: { id: socioActual.id },
        data: { dni: `TEMP-${Date.now()}-${socioActual.id.slice(-4)}` },
      });

      await prisma.socio.create({
        data: {
          usuarioId: usuarioExTitular.id,
          nombre: socioActual.nombre,
          apellido: socioActual.apellido,
          dni: exTitularDni,
          idCooperativa: `${socioActual.idCooperativa}-BAJA-${Date.now().toString().slice(-4)}`,
          telefono: socioActual.telefono,
          email: socioActual.email,
          direccion: socioActual.direccion,
          region: socioActual.region,
          tipoMiembro: socioActual.tipoMiembro,
          estado: "INACTIVO",
          motivoBaja: motivoFinal || "Baja voluntaria",
          fechaBaja: new Date(),
          fechaing: socioActual.fechaing,
          fechaNacimiento: socioActual.fechaNacimiento,
          cuil: socioActual.cuil,
          ocupacion: socioActual.ocupacion,
          barrio: socioActual.barrio,
          entrecalles: socioActual.entrecalles,
          area: socioActual.area,
        },
      });

      const nuevoEmail = familiar.email && familiar.email.trim() !== "" ? familiar.email : socioActual.email;
      await prisma.usuario.update({
        where: { id: socioActual.usuarioId },
        data: {
          nombre: `${familiar.nombre} ${familiar.apellido}`,
          email: nuevoEmail,
          activo: true,
        },
      });

      const socioActualizado = await prisma.socio.update({
        where: { id: socioActual.id },
        data: {
          nombre: familiar.nombre,
          apellido: familiar.apellido,
          dni: nuevoDni,
          fechaNacimiento: familiar.fechaNacimiento,
          telefono: familiar.telefono || socioActual.telefono,
          email: nuevoEmail,
          estado: "ACTIVO",
          motivoBaja: null,
          fechaBaja: null,
        },
      });

      await prisma.grupoFamiliar.delete({
        where: { id: familiar.id },
      });

      // Agregamos al titular anterior al grupo familiar para que conste su antecedente
      await prisma.grupoFamiliar.create({
        data: {
          socioId: socioActual.id,
          nombre: socioActual.nombre,
          apellido: socioActual.apellido,
          dni: exTitularDni,
          parentesco: `Titular Anterior (Baja: ${motivoFinal || "Baja voluntaria"})`,
          fechaNacimiento: socioActual.fechaNacimiento,
          telefono: socioActual.telefono,
          email: socioActual.email,
          activo: false,
          motivoBaja: motivoFinal || "Baja voluntaria",
          fechaBaja: new Date(),
        },
      });

      return NextResponse.json({ socio: socioActualizado, passwordTemporal, emailEnviado });
    }
  }

  // Dar de baja desactiva también el acceso a la cuenta; reactivar lo restaura.
  const dataToUpdate: any = { ...parsed.data };
  delete dataToUpdate.transferirAId;

  if (parsed.data.estado === "INACTIVO") {
    await prisma.usuario.update({ where: { id: socioActual.usuarioId }, data: { activo: false } });
    if (socioActual.estado !== "INACTIVO") {
      dataToUpdate.fechaBaja = new Date();
    }
    if (dataToUpdate.motivoBaja === "FALLECIMIENTO") dataToUpdate.motivoBaja = "Fallecimiento";
    else if (dataToUpdate.motivoBaja === "FALTA_PAGO") dataToUpdate.motivoBaja = "Falta de pago";
    else if (dataToUpdate.motivoBaja === "BAJA_VOLUNTARIA") dataToUpdate.motivoBaja = "Baja voluntaria";
  } else if (parsed.data.estado === "ACTIVO" || parsed.data.estado === "PENDIENTE") {
    if (parsed.data.estado === "ACTIVO") {
      await prisma.usuario.update({ where: { id: socioActual.usuarioId }, data: { activo: true } });
    }
    dataToUpdate.fechaBaja = null;
    dataToUpdate.motivoBaja = null;
  }

  if (dataToUpdate.fechaNacimiento) {
    dataToUpdate.fechaNacimiento = new Date(dataToUpdate.fechaNacimiento);
  }
  if (dataToUpdate.fechaing) {
    dataToUpdate.fechaing = new Date(dataToUpdate.fechaing);
  }

  const socio = await prisma.socio.update({
    where: { id: params.id },
    data: dataToUpdate,
  });

  return NextResponse.json({ socio, passwordTemporal, emailEnviado });
}
