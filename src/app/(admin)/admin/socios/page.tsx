import Link from "next/link";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AccionesSocio } from "@/components/admin/AccionesSocio";
import { Mail, Search } from "lucide-react";

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
    ...(estado && { estado: estado as "ACTIVO" | "PENDIENTE" | "INACTIVO" }),
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

      <form className="mb-4 flex flex-wrap gap-3" method="GET">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            name="q"
            defaultValue={q}
            placeholder="Buscar por nombre, ID o email..."
          />
        </div>
        <select className="input w-auto" name="region" defaultValue={region}>
          <option value="">Todas las Regiones</option>
          {regiones
            .filter((r) => r.region)
            .map((r) => (
              <option key={r.region} value={r.region!}>{r.region}</option>
            ))}
        </select>
        <select className="input w-auto" name="estado" defaultValue={estado}>
          <option value="">Todos los Estados</option>
          <option value="ACTIVO">Activo</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="INACTIVO">Inactivo</option>
        </select>
        <button type="submit" className="btn-secondary">Filtrar</button>
      </form>

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
                  <StatusBadge label={estadoLabel[socio.estado]} tone={estadoTone[socio.estado]} />
                </td>
                <td className="px-6 py-3">
                  <AccionesSocio socioId={socio.id} estado={socio.estado} email={socio.email} />
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
