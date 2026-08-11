import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.rol === "SOCIO") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const configuracion = await prisma.configuracionCooperativa.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton" },
  });

  const hoy = new Date();
  const periodo = `${MESES[hoy.getMonth()]} ${hoy.getFullYear()}`;
  const fechaVencimiento = new Date(hoy.getFullYear(), hoy.getMonth(), 10);

  const sociosActivos = await prisma.socio.findMany({
    where: { estado: "ACTIVO" },
    select: { id: true },
  });

  // Evitamos duplicar: sólo generamos para socios que todavía no tengan
  // una cuota con este mismo período.
  const yaGeneradas = await prisma.cuota.findMany({
    where: { periodo, socioId: { in: sociosActivos.map((s) => s.id) } },
    select: { socioId: true },
  });
  const idsConCuota = new Set(yaGeneradas.map((c) => c.socioId));
  const pendientes = sociosActivos.filter((s) => !idsConCuota.has(s.id));

  if (pendientes.length > 0) {
    await prisma.cuota.createMany({
      data: pendientes.map((s) => ({
        socioId: s.id,
        periodo,
        monto: configuracion.montoCuotaActual,
        fechaVencimiento,
        estado: "PENDIENTE",
      })),
    });
  }

  return NextResponse.json({ generadas: pendientes.length, periodo });
}
