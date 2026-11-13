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
  if (!session || session.user.rol !== "SUPER_ADMIN") {
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

  const idsSociosActivos = sociosActivos.map((s) => s.id);

  // Socios que ya tienen una Cuota Anual para este año
  const yaTienenAnual = await prisma.cuota.findMany({
    where: {
      socioId: { in: idsSociosActivos },
      periodo: `Año ${hoy.getFullYear()}`,
      concepto: { startsWith: "Cuota Anual" },
    },
    select: { socioId: true },
  });
  const idsConAnual = new Set(yaTienenAnual.map((c) => c.socioId));

  // Evitamos duplicar: sólo buscamos cuotas con concepto "Cuota Social"
  // para este mismo período.
  // Las cuotas iniciales / de capital son independientes y NO impiden
  // la generación de la cuota social mensual.
  const yaGeneradas = await prisma.cuota.findMany({
    where: {
      concepto: "Cuota Social",
      socioId: { in: idsSociosActivos },
      OR: [
        { periodo },
        { periodo: periodo.toLowerCase() },
      ],
    },
    select: { socioId: true },
  });
  const idsConCuotaSocial = new Set(yaGeneradas.map((c) => c.socioId));

  const idsExcluidos = new Set([...idsConCuotaSocial, ...idsConAnual]);
  const pendientes = sociosActivos.filter((s) => !idsExcluidos.has(s.id));

  if (pendientes.length > 0) {
    await prisma.cuota.createMany({
      data: pendientes.map((s) => ({
        socioId: s.id,
        periodo,
        concepto: "Cuota Social",
        monto: configuracion.montoCuotaActual,
        fechaVencimiento,
        estado: "PENDIENTE",
      })),
    });
  }

  return NextResponse.json({ generadas: pendientes.length, periodo });
}
