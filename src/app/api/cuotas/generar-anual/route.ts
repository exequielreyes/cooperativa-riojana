import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
  const anioActual = hoy.getFullYear();
  const mesActualIndex = hoy.getMonth();

  const totalMesesHastaFinDeAnio = 12 - mesActualIndex;
  const inicioMesActual = new Date(anioActual, mesActualIndex, 1);
  const finAnio = new Date(anioActual, 11, 31, 23, 59, 59);
  const periodo = `Año ${anioActual}`;
  const fechaVencimiento = new Date(anioActual, 11, 31);

  const sociosActivos = await prisma.socio.findMany({
    where: { estado: "ACTIVO" },
    select: { id: true },
  });
  const idsSocios = sociosActivos.map((s) => s.id);

  // No generamos de nuevo si ya tiene una cuota anual pendiente/vigente este año.
  const yaTienenAnual = await prisma.cuota.findMany({
    where: {
      socioId: { in: idsSocios },
      periodo,
      concepto: { startsWith: "Cuota Anual" },
    },
    select: { socioId: true },
  });
  const idsConAnual = new Set(yaTienenAnual.map((c) => c.socioId));
  const candidatos = idsSocios.filter((id) => !idsConAnual.has(id));

  // 2. Buscar cuotas mensuales YA GENERADAS (tanto PENDIENTES como PAGADAS)
  // que correspondan desde este mes hasta fin de año, para no cobrarlas doble
const cuotasExistentesDesdeEsteMes = await prisma.cuota.findMany({
    where: {
      socioId: { in: candidatos },
      concepto: { not: { startsWith: "Cuota Anual" } },
      fechaVencimiento: { gte: inicioMesActual, lte: finAnio },
    },
    select: { socioId: true },
  });
  
  const cuotasEmitidasPorSocio = new Map<string, number>();
  for (const c of cuotasExistentesDesdeEsteMes) {
    cuotasEmitidasPorSocio.set(
      c.socioId,
      (cuotasEmitidasPorSocio.get(c.socioId) ?? 0) + 1
    );
  }

  const aCrear = candidatos
    .map((socioId) => {
      const cuotasYaEmitidas = cuotasEmitidasPorSocio.get(socioId) ?? 0;
      const mesesRestantes = Math.max(0, totalMesesHastaFinDeAnio - cuotasYaEmitidas);
      return { socioId, mesesRestantes };
    })
    .filter((c) => c.mesesRestantes > 0);

  if (aCrear.length > 0) {
    await prisma.cuota.createMany({
      data: aCrear.map(({ socioId, mesesRestantes }) => ({
        socioId,
        periodo,
        concepto: `Cuota Anual (${mesesRestantes} ${mesesRestantes === 1 ? "mes" : "meses"} restantes)`,
        monto: Number(configuracion.montoCuotaActual) * mesesRestantes,
        fechaVencimiento,
        estado: "PENDIENTE",
      })),
    });
  }

  return NextResponse.json({ generadas: aCrear.length, periodo });
}
