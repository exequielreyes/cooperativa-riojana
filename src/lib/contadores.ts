import { prisma } from "@/lib/db";

/**
 * Contadores de elementos pendientes de revisión por parte del admin.
 * Se usa tanto en el layout (badges del sidebar) como en el dashboard
 * principal, para no duplicar las mismas tres queries en dos lugares.
 */
export async function getContadoresPendientes(area?: string) {
  const [socios, pagos, talleres] = await Promise.all([
    prisma.socio.count({ where: { estado: "PENDIENTE", ...(area ? { area: area as any } : {}) } }),
    prisma.pago.count({ where: { estadoValidacion: "PENDIENTE_REVISION", ...(area ? { socio: { area: area as any } } : {}) } }),
    prisma.inscripcionTaller.count({ where: { estado: "PENDIENTE", ...(area ? { socio: { area: area as any } } : {}) } }),
  ]);

  return { socios, pagos, talleres };
}