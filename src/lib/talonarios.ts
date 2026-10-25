import { prisma } from "@/lib/db";

const MESES_MAP: Record<string, number> = {
  enero: 1,
  febrero: 2,
  marzo: 3,
  abril: 4,
  mayo: 5,
  junio: 6,
  julio: 7,
  agosto: 8,
  septiembre: 9,
  setiembre: 9,
  octubre: 10,
  noviembre: 11,
  diciembre: 12,
};

export const NOMBRES_MESES = [
  "",
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function parseMesYAnio(periodo: string, fechaVencimiento: Date): { mes: number; anio: number } {
  let mes: number | null = null;
  let anio: number | null = null;

  if (periodo) {
    const pLower = periodo.toLowerCase();
    for (const [nombreMes, num] of Object.entries(MESES_MAP)) {
      if (pLower.includes(nombreMes)) {
        mes = num;
        break;
      }
    }
    const anioMatch = periodo.match(/\b(20\d\d)\b/);
    if (anioMatch) {
      anio = parseInt(anioMatch[1], 10);
    }
  }

  if (!mes || !anio) {
    const f = new Date(fechaVencimiento);
    if (!mes) mes = f.getUTCMonth() + 1;
    if (!anio) anio = f.getUTCFullYear();
  }

  return { mes, anio };
}

/**
 * Genera talonarios individuales por cada cuota pagada y aprobada.
 * Crea una notificación para el socio por cada talonario generado.
 */
export async function generarTalonariosParaCuotas(cuotaIds: string[], pagoId?: string) {
  if (!cuotaIds || cuotaIds.length === 0) return [];

  const cuotas = await prisma.cuota.findMany({
    where: { id: { in: cuotaIds } },
    include: { socio: true, talonario: true },
  });

  const talonariosCreados = [];

  for (const cuota of cuotas) {
    // Si ya existe un talonario para esta cuota, omitir para no duplicar
    if (cuota.talonario) {
      talonariosCreados.push({ talonario: cuota.talonario, cuota });
      continue;
    }

    const { mes, anio } = parseMesYAnio(cuota.periodo, cuota.fechaVencimiento);
    const anio2D = String(anio).slice(-2);
    const mes2D = String(mes).padStart(2, "0");
    const numTalonario = `${cuota.socio.idCooperativa}-${mes2D}/${anio2D}`;

    const talonario = await prisma.talonario.create({
      data: {
        socioId: cuota.socioId,
        cuotaId: cuota.id,
        pagoId: pagoId ?? null,
        numero: numTalonario,
        mes,
        anio,
        periodo: cuota.periodo,
        concepto: cuota.socio.area === "CONSUMO" ? "SERVICIO DE CONSUMO" : "SERVICIO DE SEPELIO",
        monto: cuota.monto,
      },
    });

    talonariosCreados.push({ talonario, cuota });

    // Notificación en la campanita para el socio
    try {
      await prisma.notificacion.create({
        data: {
          socioId: cuota.socioId,
          titulo: `Nuevo talonario disponible - ${cuota.periodo}`,
          mensaje: `Se ha emitido tu talonario oficial del ${cuota.socio.area === "CONSUMO" ? "Servicio de Consumo" : "Servicio de Sepelio"} para el período ${cuota.periodo}. Ya podés verlo y descargarlo en la sección de Talonarios.`,
          link: "/portal/talonarios",
        },
      });
    } catch (e) {
      console.error("Error al crear notificación de talonario:", e);
    }
  }

  return talonariosCreados;
}

/**
 * Obtiene todos los talonarios del socio.
 * Si tiene cuotas en estado PAGADO sin talonario previo, las sincroniza automáticamente.
 */
export async function getTalonariosSocio(socioId: string) {
  const cuotasPagadasSinTalonario = await prisma.cuota.findMany({
    where: {
      socioId,
      estado: "PAGADO",
      talonario: null,
    },
    include: { socio: true },
  });

  if (cuotasPagadasSinTalonario.length > 0) {
    await generarTalonariosParaCuotas(cuotasPagadasSinTalonario.map((c) => c.id));
  }

  return prisma.talonario.findMany({
    where: { socioId },
    include: {
      socio: true,
      cuota: true,
      pago: true,
    },
    orderBy: [
      { anio: "desc" },
      { mes: "desc" },
    ],
  });
}
