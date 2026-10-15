import { prisma } from "@/lib/db";

/**
 * Contadores de elementos pendientes de revisión por parte del admin.
 * Se usa tanto en el layout (badges del sidebar) como en el dashboard
 * principal, para no duplicar las mismas tres queries en dos lugares.
 */
export async function getContadoresPendientes(area?: string) {
  const [socios, pagosPendientesRaw, talleres] = await Promise.all([
    prisma.socio.count({ where: { estado: "PENDIENTE", ...(area ? { area: area as any } : {}) } }),
    prisma.pago.findMany({
      where: { estadoValidacion: "PENDIENTE_REVISION", ...(area ? { socio: { area: area as any } } : {}) },
      select: { id: true, grupoPagoId: true, comprobanteUrl: true, socioId: true },
    }),
    prisma.inscripcionTaller.count({ where: { estado: "PENDIENTE", ...(area ? { socio: { area: area as any } } : {}) } }),
  ]);

  // Contamos la cantidad de pagos o grupos de pagos pendientes de revisión
  const grupos = new Set<string>();
  for (const p of pagosPendientesRaw) {
    if (p.grupoPagoId) {
      grupos.add(`grp_${p.grupoPagoId}`);
    } else if (p.comprobanteUrl) {
      grupos.add(`comp_${p.socioId}_${p.comprobanteUrl}`);
    } else {
      grupos.add(`pago_${p.id}`);
    }
  }

  return { socios, pagos: grupos.size, talleres };
}