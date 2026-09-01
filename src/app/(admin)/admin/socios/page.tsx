import Link from "next/link";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AccionesSocio } from "@/components/admin/AccionesSocio";
import { Mail, Search } from "lucide-react";
import { FiltrosSocios } from "@/components/admin/FiltrosSocios";

const estadoLabel: Record<string, string> = {
  ACTIVO: "Activo",
  PENDIENTE: "Pendiente",
  INACTIVO: "Inactivo",
};
const estadoTone: Record<string, "success" | "warning" | "neutral"> = {
  ACTIVO: "success",
  PENDIENTE: "warning",
  INACTIVO: "neutral",
};

const PAGE_SIZE = 10;

export default async function AdminSociosPage({
  searchParams,
}: {
  searchParams: { q?: string; region?: string; estado?: string; page?: string };
}) {
  const q = searchParams.q ?? "";
  const region = searchParams.region ?? "";
  const estado = searchParams.estado ?? "";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  let whereEstado: any = undefined;
  if (estado === "INACTIVO") {
    whereEstado = { estado: "INACTIVO" };
  } else if (estado === "INACTIVO_FALLECIMIENTO") {
    whereEstado = { estado: "INACTIVO", motivoBaja: "FALLECIMIENTO" };
  } else if (estado === "INACTIVO_FALTA_PAGO") {
    whereEstado = { estado: "INACTIVO", motivoBaja: "FALTA_PAGO" };
  } else if (estado === "INACTIVO_BAJA") {
    whereEstado = { estado: "INACTIVO", motivoBaja: "BAJA_VOLUNTARIA" };
  } else if (estado) {
    whereEstado = { estado: estado as "ACTIVO" | "PENDIENTE" };
  }

  const where = {
    ...(q && {
      OR: [
        { nombre: { contains: q } },
        { apellido: { contains: q } },
        { email: { contains: q } },
        { idCooperativa: { contains: q } },
      ],
    }),
    ...(region && { region }),
    ...(whereEstado && whereEstado),
  };

  const [socios, total, regiones] = await Promise.all([
    prisma.socio.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.socio.count({ where }),
    prisma.socio.findMany({ distinct: ["region"], select: { region: true } }),
  ]);

  const totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function queryStringConPage(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (region) params.set("region", region);
    if (estado) params.set("estado", estado);
    params.set("page", p.toString());
    return `?${params.toString()}`;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary-dark">Gestión de Socios</h1>
          <p className="text-sm text-gray-500">Administra y supervisa los miembros activos de la Cooperativa Riojana.</p>
        </div>
        <Link href="/admin/socios/nuevo" className="btn-primary">
          + Añadir Socio
        </Link>
      </div>

      <FiltrosSocios regiones={regiones.filter((r) => r.region).map((r) => r.region!)} />

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border text-left text-xs text-gray-400">
              <th className="px-6 py-3 font-normal">Nombre del Socio</th>
              <th className="px-6 py-3 font-normal">ID Cooperativa</th>
              <th className="px-6 py-3 font-normal">Región</th>
              <th className="px-6 py-3 font-normal">Estado</th>
              <th className="px-6 py-3 font-normal">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {socios.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                  No se encontraron socios con esos filtros.
                </td>
              </tr>
            )}
            {socios.map((socio) => (
              <tr key={socio.id} className="border-b border-surface-border last:border-0">
                <td className="px-6 py-3">
                  <Link href={`/admin/socios/${socio.id}`} className="font-medium text-primary-dark hover:underline">
                    {socio.nombre} {socio.apellido}
                  </Link>
                  <p className="text-xs text-gray-400">{socio.email}</p>
                </td>
                <td className="px-6 py-3">{socio.idCooperativa}</td>
                <td className="px-6 py-3">{socio.region ?? "—"}</td>
                <td className="px-6 py-3">
                  <StatusBadge 
                    label={
                      socio.estado === "INACTIVO" && socio.motivoBaja === "FALLECIMIENTO" ? "Inactivo (Fallecido)" :
                      socio.estado === "INACTIVO" && socio.motivoBaja === "FALTA_PAGO" ? "Inactivo (Falta de Pago)" :
                      socio.estado === "INACTIVO" && socio.motivoBaja === "BAJA_VOLUNTARIA" ? "Inactivo (Voluntaria)" :
                      estadoLabel[socio.estado]
                    } 
                    tone={estadoTone[socio.estado]} 
                  />
                </td>
                <td className="px-6 py-3">
                  <AccionesSocio socioId={socio.id} estado={socio.estado} email={socio.email} nombre={`${socio.nombre} ${socio.apellido}`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {total > 0 && (
          <div className="flex items-center justify-between border-t border-surface-border px-6 py-3 text-xs text-gray-400">
            <span>
              Mostrando {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} de {total} socios
            </span>
            <div className="flex gap-2">
              <Link
                href={queryStringConPage(Math.max(1, page - 1))}
                className={`rounded px-2 py-1 ${page === 1 ? "pointer-events-none opacity-40" : "hover:bg-surface-muted"}`}
              >
                ‹
              </Link>
              <Link
                href={queryStringConPage(Math.min(totalPaginas, page + 1))}
                className={`rounded px-2 py-1 ${page === totalPaginas ? "pointer-events-none opacity-40" : "hover:bg-surface-muted"}`}
              >
                ›
              </Link>
            </div>
          </div>
        )}
      </div>

      <div className="card mt-6 flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
          <Mail size={18} />
        </div>
        <div>
          <p className="font-medium text-primary-dark">
            Notificación Masiva <span className="badge bg-primary/10 text-primary ml-1">Premium</span>
          </p>
          <p className="text-xs text-gray-400">Envío de circulares y avisos vía SMS/Email.</p>
        </div>
      </div>
    </div>
  );
}
