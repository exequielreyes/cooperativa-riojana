import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AccionesPago } from "@/components/admin/AccionesPago";
import { ConfiguracionCuotaCard } from "@/components/admin/ConfiguracionCuotaCard";
import { ConfiguracionCapitalCard } from "@/components/admin/ConfiguracionCapitalCard";
import { FiltrosPagos } from "@/components/admin/FiltrosPagos";
import { RegistrarPagoEfectivo } from "@/components/admin/RegistrarPagoEfectivo";
import { formatCurrency, formatDate } from "@/lib/utils";

const estadoLabel: Record<string, string> = {
  APROBADO: "Completado",
  PENDIENTE_REVISION: "Pendiente",
  RECHAZADO: "Rechazado",
};

const estadoTone: Record<string, "success" | "warning" | "danger"> = {
  APROBADO: "success",
  PENDIENTE_REVISION: "warning",
  RECHAZADO: "danger",
};

const PAGE_SIZE = 7;

export default async function AdminPagosPage({
  searchParams,
}: {
  searchParams: { q?: string; estado?: string; metodo?: string; page?: string };
}) {
  const q = searchParams.q ?? "";
  const estado = searchParams.estado ?? "";
  const metodo = searchParams.metodo ?? "";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  
  const currentArea = cookies().get("coop_area")?.value || "SEPELIO";

  const where = {
    socio: {
      area: currentArea as any,
      ...(q && {
        OR: [
          { nombre: { contains: q } },
          { apellido: { contains: q } },
          { idCooperativa: { contains: q } },
          { email: { contains: q } },
        ],
      }),
    },
    ...(estado && { estadoValidacion: estado as "PENDIENTE_REVISION" | "APROBADO" | "RECHAZADO" }),
    ...(metodo && { metodo: metodo as "TRANSFERENCIA" | "EFECTIVO" | "MERCADOPAGO" }),
  };

  const [pagos, recaudadoAgg, deudaAgg, pagosPendientesRaw, configuracion] = await Promise.all([
    prisma.pago.findMany({
      where,
      include: { socio: true, cuota: true, validadoPor: true },
      orderBy: { fechaPago: "desc" },
    }),
    prisma.pago.aggregate({
      _sum: { monto: true },
      where: { estadoValidacion: "APROBADO", socio: { area: currentArea as any } },
    }),
    prisma.cuota.aggregate({
      _sum: { monto: true },
      where: { estado: { in: ["PENDIENTE", "VENCIDO"] }, socio: { area: currentArea as any } },
    }),
    prisma.pago.findMany({
      where: { estadoValidacion: "PENDIENTE_REVISION", socio: { area: currentArea as any } },
      select: { id: true, grupoPagoId: true, comprobanteUrl: true, socioId: true },
    }),
    prisma.configuracionCooperativa.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton" },
    }),
  ]);

  // Contar grupos de pagos pendientes para el indicador numérico
  const gruposPendientes = new Set<string>();
  for (const p of pagosPendientesRaw) {
    if (p.grupoPagoId) {
      gruposPendientes.add(`grp_${p.grupoPagoId}`);
    } else if (p.comprobanteUrl) {
      gruposPendientes.add(`comp_${p.socioId}_${p.comprobanteUrl}`);
    } else {
      gruposPendientes.add(`pago_${p.id}`);
    }
  }
  const pendientesCount = gruposPendientes.size;

  // Agrupar los pagos que correspondan a la misma operación (ej: 4 cuotas pagadas juntas)
  type PagoConRelaciones = (typeof pagos)[0];
  interface CuotaResumen {
    id: string;
    periodo: string;
    concepto: string;
    monto: number;
  }
  interface PagoAgrupado {
    id: string;
    pagoIds: string[];
    socio: PagoConRelaciones["socio"];
    fechaPago: Date;
    metodo: PagoConRelaciones["metodo"];
    estadoValidacion: PagoConRelaciones["estadoValidacion"];
    montoTotal: number;
    comprobanteUrl: string | null;
    validadoPor?: PagoConRelaciones["validadoPor"];
    cuotas: CuotaResumen[];
  }

  const gruposMap = new Map<string, PagoAgrupado>();

  for (const pago of pagos) {
    let groupKey = `pago_${pago.id}`;
    if (pago.grupoPagoId) {
      groupKey = `grp_${pago.grupoPagoId}`;
    } else if (pago.comprobanteUrl) {
      groupKey = `comp_${pago.socioId}_${pago.comprobanteUrl}`;
    }

    const existing = gruposMap.get(groupKey);
    if (existing) {
      existing.pagoIds.push(pago.id);
      existing.montoTotal += Number(pago.monto);
      if (pago.cuota) {
        existing.cuotas.push({
          id: pago.cuota.id,
          periodo: pago.cuota.periodo,
          concepto: pago.cuota.concepto,
          monto: Number(pago.monto),
        });
      }
    } else {
      gruposMap.set(groupKey, {
        id: pago.id,
        pagoIds: [pago.id],
        socio: pago.socio,
        fechaPago: pago.fechaPago,
        metodo: pago.metodo,
        estadoValidacion: pago.estadoValidacion,
        montoTotal: Number(pago.monto),
        comprobanteUrl: pago.comprobanteUrl,
        validadoPor: pago.validadoPor,
        cuotas: pago.cuota
          ? [
              {
                id: pago.cuota.id,
                periodo: pago.cuota.periodo,
                concepto: pago.cuota.concepto,
                monto: Number(pago.monto),
              },
            ]
          : [],
      });
    }
  }

  const pagosAgrupados = Array.from(gruposMap.values());

  const total = pagosAgrupados.length;
  const totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageSegura = Math.min(page, totalPaginas);
  const pagosPaginados = pagosAgrupados.slice((pageSegura - 1) * PAGE_SIZE, pageSegura * PAGE_SIZE);

  function queryStringConPage(p: number) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (estado) params.set("estado", estado);
    if (metodo) params.set("metodo", metodo);
    params.set("page", p.toString());
    return `?${params.toString()}`;
  }

  // Si el usuario aprueba todas las solicitudes pendientes y se queda en la vista
  // filtrada por "Pendiente", redirigimos automáticamente a "Todos los estados"
  if (estado === "PENDIENTE_REVISION" && pagosAgrupados.length === 0) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (metodo) params.set("metodo", metodo);
    const redirectUrl = `/admin/pagos${params.toString() ? `?${params.toString()}` : ""}`;
    redirect(redirectUrl);
  }

  // El link de exportar respeta los mismos filtros activos en pantalla.
  const paramsExport = new URLSearchParams();
  if (q) paramsExport.set("q", q);
  if (estado) paramsExport.set("estado", estado);
  if (metodo) paramsExport.set("metodo", metodo);
  const hrefExportar = `/api/pagos/exportar?${paramsExport.toString()}`;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary-dark">Gestión de Pagos</h1>
        <div className="flex gap-2">
          <RegistrarPagoEfectivo />
          <a href={hrefExportar} className="btn-primary">
            Exportar Reporte
          </a>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-xs text-gray-400">Recaudado (aprobado)</p>
          <p className="mt-1 text-xl font-semibold text-primary-dark">
            {formatCurrency(Number(recaudadoAgg._sum.monto ?? 0))}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400">Deudas Pendientes</p>
          <p className="mt-1 text-xl font-semibold text-status-danger">
            {formatCurrency(Number(deudaAgg._sum.monto ?? 0))}
          </p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400">Pagos por revisar</p>
          <p className="mt-1 text-xl font-semibold text-primary-dark">{pendientesCount}</p>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <ConfiguracionCuotaCard montoActual={Number(configuracion.montoCuotaActual)} />
        <ConfiguracionCapitalCard montoActual={Number(configuracion.montoCapitalActual)} />
      </div>

      <FiltrosPagos />

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border text-left text-xs text-gray-400">
              <th className="px-6 py-3 font-normal">Socio / ID</th>
              <th className="px-6 py-3 font-normal">Cuotas Asociadas</th>
              <th className="px-6 py-3 font-normal">Fecha</th>
              <th className="px-6 py-3 font-normal">Método</th>
              <th className="px-6 py-3 font-normal">Estado</th>
              <th className="px-6 py-3 font-normal">Monto Global</th>
              <th className="px-6 py-3 font-normal">Comprobante</th>
              <th className="px-6 py-3 font-normal">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagosAgrupados.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-8 text-center text-sm text-gray-400">
                  No se encontraron pagos con esos filtros.
                </td>
              </tr>
            )}
            {pagosPaginados.map((grupo) => (
              <tr key={grupo.id} className="border-b border-surface-border last:border-0 hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-3">
                  <p className="font-medium text-primary-dark">{grupo.socio.nombre} {grupo.socio.apellido}</p>
                  <p className="text-xs text-gray-400">{grupo.socio.idCooperativa}</p>
                </td>
                <td className="px-6 py-3">
                  {grupo.cuotas.length === 1 ? (
                    <div>
                      <p className="font-medium text-gray-900 text-xs">{grupo.cuotas[0].concepto}</p>
                      <p className="text-xs text-gray-500">{grupo.cuotas[0].periodo}</p>
                    </div>
                  ) : grupo.cuotas.length > 1 ? (
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-primary">
                          {grupo.cuotas.length} cuotas juntas
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 max-w-xs leading-relaxed">
                        {grupo.cuotas.map((c) => c.periodo).join(", ")}
                      </p>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="px-6 py-3">{formatDate(grupo.fechaPago)}</td>
                <td className="px-6 py-3">
                  <p className="font-medium text-gray-900">{grupo.metodo}</p>
                  {grupo.validadoPor && (
                    <p className="text-[10px] text-gray-400">
                      Por: {grupo.validadoPor.nombre || grupo.validadoPor.email}
                    </p>
                  )}
                </td>
                <td className="px-6 py-3">
                  <StatusBadge label={estadoLabel[grupo.estadoValidacion]} tone={estadoTone[grupo.estadoValidacion]} />
                </td>
                <td className="px-6 py-3 font-medium">
                  <p className="text-gray-900 font-semibold">{formatCurrency(grupo.montoTotal)}</p>
                  {grupo.cuotas.length > 1 && (
                    <p className="text-[11px] text-gray-400">Total de {grupo.cuotas.length} cuotas</p>
                  )}
                </td>
                <td className="px-6 py-3">
                  {grupo.comprobanteUrl ? (
                    <a
                      href={grupo.comprobanteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Ver comprobante
                    </a>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="px-6 py-3">
                  {grupo.estadoValidacion === "PENDIENTE_REVISION" ? (
                    <AccionesPago
                      pagoId={grupo.id}
                      pagoIds={grupo.pagoIds}
                      cantidadCuotas={grupo.cuotas.length}
                      cuotasTexto={grupo.cuotas.map((c) => c.periodo).join(", ")}
                    />
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {total > 0 && (
          <div className="flex flex-col items-center justify-between gap-4 border-t border-surface-border px-6 py-4 sm:flex-row">
            <span className="text-sm text-gray-500">
              Mostrando {(pageSegura - 1) * PAGE_SIZE + 1}-{Math.min(pageSegura * PAGE_SIZE, total)} de {total} pagos
            </span>
            <nav aria-label="Paginación" className="flex items-center gap-2">
              <Link
                href={queryStringConPage(Math.max(1, pageSegura - 1))}
                aria-disabled={pageSegura === 1}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border text-gray-500 transition-colors hover:bg-surface-muted ${
                  pageSegura === 1 ? "pointer-events-none opacity-40" : ""
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </Link>
              
              {(() => {
                const delta = 1;
                const range: (number | "...")[] = [];
                const start = Math.max(2, pageSegura - delta);
                const end = Math.min(totalPaginas - 1, pageSegura + delta);

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
                      aria-current={p === pageSegura ? "page" : undefined}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        p === pageSegura
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
                href={queryStringConPage(Math.min(totalPaginas, pageSegura + 1))}
                aria-disabled={pageSegura === totalPaginas}
                className={`flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border text-gray-500 transition-colors hover:bg-surface-muted ${
                  pageSegura === totalPaginas ? "pointer-events-none opacity-40" : ""
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}