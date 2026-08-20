import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { VolverAlPanel } from "@/components/socio/VolverAlPanel";
import { formatCurrency, formatDate } from "@/lib/utils";

const estadoLabel: Record<string, string> = {
  APROBADO: "Completado",
  PENDIENTE_REVISION: "En revisión",
  RECHAZADO: "Rechazado",
};
const estadoTone: Record<string, "success" | "warning" | "danger"> = {
  APROBADO: "success",
  PENDIENTE_REVISION: "warning",
  RECHAZADO: "danger",
};

export default async function HistorialCuotasPage() {
  const session = await getServerSession(authOptions);
  const socioId = session!.user.socioId!;

  const cuotas = await prisma.cuota.findMany({
    where: { socioId },
    include: { pago: true },
    orderBy: { fechaVencimiento: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <VolverAlPanel />
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary-dark">Historial de Cuotas</h1>
        <Link href="/portal/pagos/reportar" className="btn-primary">
          Reportar Pago
        </Link>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-border text-left text-xs text-gray-400">
              <th className="px-6 py-3 font-normal">Período / Concepto</th>
              <th className="px-6 py-3 font-normal">Importe</th>
              <th className="px-6 py-3 font-normal">Fecha de Pago</th>
              <th className="px-6 py-3 font-normal">Método</th>
              <th className="px-6 py-3 font-normal">Estado</th>
            </tr>
          </thead>
          <tbody>
            {cuotas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                  Todavía no tenés cuotas registradas.
                </td>
              </tr>
            )}
            {cuotas.map((cuota) => (
              <tr key={cuota.id} className="border-b border-surface-border last:border-0">
                <td className="px-6 py-3">{cuota.concepto} {cuota.periodo}</td>
                <td className="px-6 py-3">{formatCurrency(Number(cuota.monto))}</td>
                <td className="px-6 py-3">
                  {cuota.pago ? formatDate(cuota.pago.fechaPago) : "—"}
                </td>
                <td className="px-6 py-3">{cuota.pago?.metodo ?? "—"}</td>
                <td className="px-6 py-3">
                  {cuota.pago ? (
                    <>
                      <StatusBadge
                        label={estadoLabel[cuota.pago.estadoValidacion]}
                        tone={estadoTone[cuota.pago.estadoValidacion]}
                      />
                      {cuota.pago.estadoValidacion === "RECHAZADO" && cuota.pago.notaRechazo && (
                        <p className="mt-1 max-w-xs text-xs text-gray-400">{cuota.pago.notaRechazo}</p>
                      )}
                    </>
                  ) : (
                    <StatusBadge label="Pendiente" tone="warning" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}