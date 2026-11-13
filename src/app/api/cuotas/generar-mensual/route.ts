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
  const mesActualStart = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  const periodo = `${MESES[hoy.getMonth()]} ${hoy.getFullYear()}`;
  const fechaVencimiento = new Date(hoy.getFullYear(), hoy.getMonth(), 10);

  const sociosActivos = await prisma.socio.findMany({
    where: { estado: "ACTIVO" },
    select: { id: true },
  });

  const idsSociosActivos = sociosActivos.map((s) => s.id);

  // Socios que tienen una Cuota Anual PAGADA cuyos 12 meses aún no se han cumplido
  const cuotasAnualesPagadas = await prisma.cuota.findMany({
    where: {
      socioId: { in: idsSociosActivos },
      concepto: { startsWith: "Cuota Anual" },
      estado: "PAGADO",
    },
    include: {
      pagos: {
        where: { estadoValidacion: "APROBADO" },
        orderBy: { fechaPago: "desc" },
        take: 1,
      },
    },
  });

  const idsConAnualVigente = new Set<string>();
  for (const c of cuotasAnualesPagadas) {
    // Tomamos la fecha en que se emitió/pagó la cuota anual y calculamos 12 meses calendarios
    const fechaReferencia = c.pagos[0]?.fechaPago
      ? new Date(c.pagos[0].fechaPago)
      : new Date(c.createdAt);
    const finCobertura = new Date(
      fechaReferencia.getFullYear(),
      fechaReferencia.getMonth() + 12,
      1
    );

    // Mientras no se hayan cumplido los 12 meses, no se le genera la cuota mensual
    if (mesActualStart < finCobertura) {
      idsConAnualVigente.add(c.socioId);
    }
  }

  // Evitamos duplicar: sólo buscamos cuotas con concepto "Cuota Social"
  // para este mismo período.
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

  const idsExcluidos = new Set([...idsConCuotaSocial, ...idsConAnualVigente]);
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
