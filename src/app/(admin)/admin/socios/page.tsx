import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AccionesSocio } from "@/components/admin/AccionesSocio";
import { Mail, Search } from "lucide-react";
import { cookies } from "next/headers";
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


function getEdad(fecha: Date | null | undefined) {
  if (!fecha) return "—";
  const hoy = new Date();
  const nac = new Date(fecha);
  let edad = hoy.getFullYear() - nac.getFullYear();
  const m = hoy.getMonth() - nac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) {
    edad--;
  }
  return isNaN(edad) ? "—" : edad;
}

const PAGE_SIZE = 7;

export default async function AdminSociosPage({
  searchParams,
}: {
  searchParams: { q?: string; region?: string; estado?: string; page?: string; edad?: string; filtroExtra?: string; mesCumpleanos?: string };
}) {
  const q = searchParams.q ?? "";
  const region = searchParams.region ?? "";
  const estado = searchParams.estado ?? "";
  const edad = searchParams.edad ?? "";
  const filtroExtra = searchParams.filtroExtra ?? "";
  const mesCumpleanos = searchParams.mesCumpleanos ?? "";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const currentArea = cookies().get("coop_area")?.value || "SEPELIO";

  let whereEstado: any = undefined;
  if (estado === "INACTIVO") {
    whereEstado = { estado: "INACTIVO" };
  } else if (estado === "INACTIVO_FALLECIMIENTO") {
    whereEstado = { estado: "INACTIVO", motivoBaja: { in: ["Fallecimiento", "FALLECIMIENTO"] } };
  } else if (estado === "INACTIVO_FALTA_PAGO") {
    whereEstado = { estado: "INACTIVO", motivoBaja: { in: ["Falta de pago", "FALTA_PAGO", "Falta de Pagos"] } };
  } else if (estado === "INACTIVO_BAJA") {
    whereEstado = { estado: "INACTIVO", motivoBaja: { in: ["Baja voluntaria", "BAJA_VOLUNTARIA"] } };
  } else if (estado) {
    whereEstado = { estado: estado as "ACTIVO" | "PENDIENTE" };
  }

  let whereEdad: any = undefined;
  if (edad) {
    const hoy = new Date();
    if (edad === "18-25") {
      whereEdad = { fechaNacimiento: { gt: new Date(hoy.getFullYear() - 26, hoy.getMonth(), hoy.getDate()), lte: new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate()) } };
    } else if (edad === "26-35") {
      whereEdad = { fechaNacimiento: { gt: new Date(hoy.getFullYear() - 36, hoy.getMonth(), hoy.getDate()), lte: new Date(hoy.getFullYear() - 26, hoy.getMonth(), hoy.getDate()) } };
    } else if (edad === "36-50") {
      whereEdad = { fechaNacimiento: { gt: new Date(hoy.getFullYear() - 51, hoy.getMonth(), hoy.getDate()), lte: new Date(hoy.getFullYear() - 36, hoy.getMonth(), hoy.getDate()) } };
    } else if (edad === "50+") {
      whereEdad = { fechaNacimiento: { lte: new Date(hoy.getFullYear() - 51, hoy.getMonth(), hoy.getDate()) } };
    }
  }

  let whereFiltroExtra: any = undefined;
  if (filtroExtra === "nuevos") {
    const hace30dias = new Date();
    hace30dias.setDate(hace30dias.getDate() - 30);
    whereFiltroExtra = { createdAt: { gte: hace30dias } };
  } else if (filtroExtra === "cumpleanos_mes") {
    const mes = mesCumpleanos ? parseInt(mesCumpleanos, 10) : new Date().getMonth() + 1;
    // Debemos limitar este query por area actual también si usamos raw
    const results = await prisma.$queryRaw<{id: string}[]>`SELECT id FROM socios WHERE MONTH(fechaNacimiento) = ${mes} AND area = ${currentArea}`;
    whereFiltroExtra = { id: { in: results.map(r => r.id) } };
  } else if (filtroExtra === "al_dia") {
    const hoy = new Date();
    whereFiltroExtra = {
      estado: "ACTIVO",
      cuotas: {
        none: {
          estado: { not: "PAGADO" },
          fechaVencimiento: { lte: hoy },
        }
      }
    };
  }

  const where = {
    area: currentArea as any,
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
    ...(whereEdad && whereEdad),
    ...(whereFiltroExtra && whereFiltroExtra),
  };

  const [socios, total, regiones] = await Promise.all([
    prisma.socio.findMany({
      where,
      include: {
        grupoFamiliar: true,
        cuotas: {
          where: { estado: "PAGADO" },
          orderBy: { fechaVencimiento: "desc" },
          take: 1,
          include: { pagos: { orderBy: { fechaPago: "desc" }, take: 1 } },
        },
      },
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
    if (edad) params.set("edad", edad);
    if (filtroExtra) params.set("filtroExtra", filtroExtra);
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
            {filtroExtra === "al_dia" ? (
              <tr className="border-b border-surface-border text-left text-xs text-gray-400">
                <th className="px-6 py-3 font-normal">N°</th>
                <th className="px-6 py-3 font-normal">Tipo</th>
                <th className="px-6 py-3 font-normal">N° Socio</th>
                <th className="px-6 py-3 font-normal">DNI</th>
                <th className="px-6 py-3 font-normal">Apellido y Nombre</th>
                <th className="px-6 py-3 font-normal">Últimos Pagos</th>
                <th className="px-6 py-3 font-normal">Edad</th>
              </tr>
            ) : estado.startsWith("INACTIVO") ? (
              <tr className="border-b border-surface-border text-left text-xs text-gray-400">
                <th className="px-6 py-3 font-normal">Apellido y Nombre</th>
                <th className="px-6 py-3 font-normal">DNI</th>
                <th className="px-6 py-3 font-normal">Fecha de Ingreso</th>
                <th className="px-6 py-3 font-normal">Fecha de Egreso</th>
                <th className="px-6 py-3 font-normal">Motivo de Egreso</th>
                <th className="px-6 py-3 font-normal">Acciones</th>
              </tr>
            ) : (
              <tr className="border-b border-surface-border text-left text-xs text-gray-400">
                <th className="px-6 py-3 font-normal">N° Socio</th>
                <th className="px-6 py-3 font-normal">Nombre del Socio</th>
                <th className="px-6 py-3 font-normal">Teléfono</th>
                <th className="px-6 py-3 font-normal">Fecha de Ingreso</th>
                <th className="px-6 py-3 font-normal">Estado</th>
                <th className="px-6 py-3 font-normal">Acciones</th>
              </tr>
            )}
          </thead>
          <tbody>
            {socios.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-400">
                  No se encontraron socios con esos filtros.
                </td>
              </tr>
            )}
            {socios.map((socio, index) => (
              <React.Fragment key={socio.id}>
              <tr className="border-b border-surface-border last:border-0">
                {filtroExtra === "al_dia" ? (
                  <>
                    <td className="px-6 py-3">{(page - 1) * PAGE_SIZE + index + 1}</td>
                    <td className="px-6 py-3 font-medium text-primary-dark">Activo</td>
                    <td className="px-6 py-3 font-bold">{socio.idCooperativa?.split('-').pop() || socio.idCooperativa}</td>
                    <td className="px-6 py-3">{socio.dni}</td>
                    <td className="px-6 py-3 font-bold uppercase">
                      <Link href={`/admin/socios/${socio.id}`} className="hover:underline text-primary-dark">
                        {socio.apellido} {socio.nombre}
                      </Link>
                    </td>
                    <td className="px-6 py-3">{socio.cuotas?.[0]?.pagos?.[0]?.fechaPago ? new Date(socio.cuotas[0].pagos[0].fechaPago).toLocaleDateString("es-AR", { timeZone: "UTC" }) : "—"}</td>
                    <td className="px-6 py-3">{getEdad(socio.fechaNacimiento as any)}</td>
                  </>
                ) : estado.startsWith("INACTIVO") ? (
                  <>
                    <td className="px-6 py-3">
                      <Link href={`/admin/socios/${socio.id}`} className="font-medium text-primary-dark hover:underline">
                        {socio.apellido}, {socio.nombre}
                      </Link>
                    </td>
                    <td className="px-6 py-3">{socio.dni}</td>
                    <td className="px-6 py-3">{socio.fechaing ? new Date(socio.fechaing).toLocaleDateString("es-AR", { timeZone: "UTC" }) : "—"}</td>
                    <td className="px-6 py-3">{socio.fechaBaja ? new Date(socio.fechaBaja).toLocaleDateString("es-AR", { timeZone: "UTC" }) : "—"}</td>
                    <td className="px-6 py-3">
                      {socio.motivoBaja === "FALLECIMIENTO" ? "Fallecimiento" :
                       socio.motivoBaja === "FALTA_PAGO" ? "Falta de Pago" :
                       socio.motivoBaja === "BAJA_VOLUNTARIA" ? "Baja Voluntaria" :
                       socio.motivoBaja || "—"}
                    </td>
                    <td className="px-6 py-3">
                      <AccionesSocio socioId={socio.id} estado={socio.estado} email={socio.email} nombre={`${socio.nombre} ${socio.apellido}`} />
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-3">{socio.idCooperativa}</td>
                    <td className="px-6 py-3">
                      <Link href={`/admin/socios/${socio.id}`} className="font-medium text-primary-dark hover:underline">
                        {socio.nombre} {socio.apellido}
                      </Link>
                      <p className="text-xs text-gray-400">{socio.email}</p>
                    </td>
                    <td className="px-6 py-3">{socio.telefono ?? "—"}</td>
                    <td className="px-6 py-3">{socio.fechaing ? new Date(socio.fechaing).toLocaleDateString("es-AR", { timeZone: "UTC" }) : "—"}</td>
                    <td className="px-6 py-3">
                      <StatusBadge 
                        label={estadoLabel[socio.estado]} 
                        tone={estadoTone[socio.estado]} 
                      />
                    </td>
                    <td className="px-6 py-3">
                      <AccionesSocio socioId={socio.id} estado={socio.estado} email={socio.email} nombre={`${socio.nombre} ${socio.apellido}`} />
                    </td>
                  </>
                )}
              </tr>
              {filtroExtra === "al_dia" && socio.grupoFamiliar?.map(fam => (
                <tr key={fam.id} className="border-b border-gray-50 bg-gray-50/20 last:border-0">
                  <td className="px-6 py-3 text-gray-400"></td>
                  <td className="px-6 py-3 text-gray-500">Familiar</td>
                  <td className="px-6 py-3 text-gray-500">{socio.idCooperativa?.split('-').pop() || socio.idCooperativa}</td>
                  <td className="px-6 py-3 text-gray-500">{fam.dni ?? "—"}</td>
                  <td className="px-6 py-3 text-gray-500">
                    <span className="text-gray-300 mr-2">└</span>
                    <span className="uppercase">{fam.apellido} {fam.nombre}</span>
                    <span className="ml-2 text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                      ({fam.parentesco})
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500"></td>
                  <td className="px-6 py-3 text-gray-500">{getEdad(fam.fechaNacimiento as any)}</td>
                </tr>
              ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>

        {total > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-surface-border px-6 py-4 sm:flex-row">
            <span className="text-sm text-gray-500">
              Mostrando {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, total)} de {total} socios
            </span>
            <nav aria-label="Paginación" className="flex items-center gap-2">
              <Link
                href={queryStringConPage(Math.max(1, page - 1))}
                aria-disabled={page === 1}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border text-gray-500 transition-colors hover:bg-surface-muted ${
                  page === 1 ? "pointer-events-none opacity-40" : ""
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </Link>
              
              {(() => {
                const delta = 1;
                const range: (number | "...")[] = [];
                const start = Math.max(2, page - delta);
                const end = Math.min(totalPaginas - 1, page + delta);

                range.push(1);
                if (start > 2) range.push("...");
                for (let i = start; i <= end; i++) range.push(i);
                if (end < totalPaginas - 1) range.push("...");
                if (totalPaginas > 1) range.push(totalPaginas);

                return range.map((p, idx) => 
                  p === "..." ? (
                    <span key={`dots-${idx}`} className="px-1 text-sm text-gray-400">
                      …
                    </span>
                  ) : (
                    <Link
                      key={p}
                      href={queryStringConPage(p as number)}
                      aria-current={p === page ? "page" : undefined}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        p === page
                          ? "bg-primary text-white"
                          : "border border-surface-border text-gray-600 hover:bg-surface-muted"
                      }`}
                    >
                      {p}
                    </Link>
                  )
                );
              })()}

              <Link
                href={queryStringConPage(Math.min(totalPaginas, page + 1))}
                aria-disabled={page === totalPaginas}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border text-gray-500 transition-colors hover:bg-surface-muted ${
                  page === totalPaginas ? "pointer-events-none opacity-40" : ""
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </Link>
            </nav>
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
