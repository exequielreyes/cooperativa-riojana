import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import { TendenciaCobranzaChart, NuevosSociosChart } from "@/components/admin/DashboardCharts";
import { getContadoresPendientes } from "@/lib/contadores";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function ultimosSeisMeses() {
  const hoy = new Date();
  const meses = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    meses.push({ year: d.getFullYear(), month: d.getMonth() });
  }
  return meses;
}

export default async function AdminMetricasPage() {
  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const rango = ultimosSeisMeses();
  const desde = new Date(rango[0].year, rango[0].month, 1);

  const [sociosActivos, recaudacionMes, talleresActivos, pagosRango, sociosRango, contadores] =
    await Promise.all([
      prisma.socio.count({ where: { estado: "ACTIVO" } }),
      prisma.pago.aggregate({
        _sum: { monto: true },
        where: { estadoValidacion: "APROBADO", fechaPago: { gte: inicioMes } },
      }),
      prisma.taller.count({ where: { estado: "ACTIVO" } }),
      prisma.pago.findMany({
        where: { estadoValidacion: "APROBADO", fechaPago: { gte: desde } },
        select: { monto: true, fechaPago: true },
      }),
      prisma.socio.findMany({
        where: { createdAt: { gte: desde } },
        select: { createdAt: true },
      }),
      // Misma función que usa el layout para los badges del sidebar,
      // así evitamos repetir las queries de conteo.
      getContadoresPendientes(),
    ]);

  const cobranzaPorMes = rango.map(({ year, month }) => {
    const total = pagosRango
      .filter((p) => p.fechaPago.getFullYear() === year && p.fechaPago.getMonth() === month)
      .reduce((acc, p) => acc + Number(p.monto), 0);
    return { mes: MESES[month], valor: total };
  });

  const sociosPorMes = rango.map(({ year, month }) => {
    const total = sociosRango.filter(
      (s) => s.createdAt.getFullYear() === year && s.createdAt.getMonth() === month
    ).length;
    return { mes: MESES[month], valor: total };
  });

  const metricas = [
    { label: "Socios Activos", valor: sociosActivos.toString() },
    { label: "Recaudación Mensual", valor: formatCurrency(Number(recaudacionMes._sum.monto ?? 0)) },
    // { label: "Solicitudes Pendientes", valor: contadores.socios.toString() },
    { label: "Talleres Activos", valor: talleresActivos.toString() },
  ];

  const pendientesAccion = [
    {
      label: "Pagos por Revisar",
      valor: contadores.pagos,
      href: "/admin/pagos?estado=PENDIENTE_REVISION",
    },
    {
      label: "Solicitud de Socios Nuevos",
      valor: contadores.socios,
      href: "/admin/socios",
    },
    {
      label: "Inscripciones a Talleres Pendientes",
      valor: contadores.talleres,
      href: "/admin/talleres",
    },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary-dark">Panel de Control</h1>
          <p className="text-sm text-gray-500">Visualiza el estado general de la cooperativa y gestiona las operaciones diarias.</p>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {pendientesAccion.map((p) => (
          <Link
            key={p.label}
            href={p.href}
            className={`card flex items-center justify-between transition hover:shadow-md ${
              p.valor > 0 ? "border-l-4 border-status-danger" : ""
            }`}
          >
            <div>
              <p className="text-xs text-gray-400">{p.label}</p>
              <p className={`mt-1 text-2xl font-semibold ${p.valor > 0 ? "text-status-danger" : "text-primary-dark"}`}>
                {p.valor}
              </p>
            </div>
            <span className="text-xs text-primary">Revisar →</span>
          </Link>
        ))}
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {metricas.map((metrica) => (
          <div key={metrica.label} className="card">
            <p className="text-xs text-gray-400">{metrica.label}</p>
            <p className="mt-1 text-2xl font-semibold text-primary-dark">{metrica.valor}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <p className="mb-4 font-medium text-primary-dark">Tendencia de Cobranza</p>
          <TendenciaCobranzaChart datos={cobranzaPorMes} />
        </div>
        <div className="card">
          <p className="mb-4 font-medium text-primary-dark">Nuevos Socios</p>
          <NuevosSociosChart datos={sociosPorMes} />
        </div>
      </div>
    </div>
  );
}