import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MarcarPagadoEfectivo } from "@/components/admin/MarcarPagadoEfectivo";
import { formatCurrency, formatDate } from "@/lib/utils";

const estadoLabel: Record<string, string> = { ACTIVO: "Activo", PENDIENTE: "Pendiente", INACTIVO: "Inactivo" };
const estadoTone: Record<string, "success" | "warning" | "neutral"> = {
  ACTIVO: "success",
  PENDIENTE: "warning",
  INACTIVO: "neutral",
};

export default async function PerfilSocioAdminPage({ params }: { params: { id: string } }) {
  const socio = await prisma.socio.findUnique({
    where: { id: params.id },
    include: {
      grupoFamiliar: true,
      cuotas: { orderBy: { fechaVencimiento: "desc" }, include: { pago: true } },
    },
  });
  if (!socio) notFound();

  const cuotasPendientes = socio.cuotas.filter((c) => c.estado !== "PAGADO");
  const deudaTotal = cuotasPendientes.reduce((acc, c) => acc + Number(c.monto), 0);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-full bg-primary/10">
            {socio.fotoUrl ? (
              <Image src={socio.fotoUrl} alt={socio.nombre} width={64} height={64} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-medium text-primary">
                {socio.nombre[0]}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-primary-dark">{socio.nombre} {socio.apellido}</h1>
            <p className="text-sm text-gray-500">{socio.idCooperativa} · {socio.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge label={estadoLabel[socio.estado]} tone={estadoTone[socio.estado]} />
          <Link href={`/admin/socios/${socio.id}/editar`} className="btn-secondary">
            Editar
          </Link>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card">
          <p className="text-xs text-gray-400">Teléfono</p>
          <p className="text-sm font-medium text-primary-dark">{socio.telefono ?? "—"}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400">Región</p>
          <p className="text-sm font-medium text-primary-dark">{socio.region ?? "—"}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-400">Deuda Total</p>
          <p className={`text-sm font-medium ${deudaTotal > 0 ? "text-status-danger" : "text-status-success"}`}>
            {formatCurrency(deudaTotal)}
          </p>
        </div>
      </div>

      <div className="card mb-6 p-0">
        <p className="p-6 pb-3 font-medium text-primary-dark">Cuotas Pendientes</p>
        {cuotasPendientes.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-gray-400">No tiene cuotas pendientes. 🎉</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-border text-left text-xs text-gray-400">
                <th className="px-6 py-2 font-normal">Período</th>
                <th className="px-6 py-2 font-normal">Vencimiento</th>
                <th className="px-6 py-2 font-normal">Monto</th>
                <th className="px-6 py-2 font-normal">Acción</th>
              </tr>
            </thead>
            <tbody>
              {cuotasPendientes.map((cuota) => (
                <tr key={cuota.id} className="border-b border-surface-border last:border-0">
                  <td className="px-6 py-3">{cuota.periodo}</td>
                  <td className="px-6 py-3">{formatDate(cuota.fechaVencimiento)}</td>
                  <td className="px-6 py-3">{formatCurrency(Number(cuota.monto))}</td>
                  <td className="px-6 py-3">
                    <MarcarPagadoEfectivo cuotaId={cuota.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card p-0">
        <p className="p-6 pb-3 font-medium text-primary-dark">Grupo Familiar</p>
        {socio.grupoFamiliar.length === 0 ? (
          <p className="px-6 pb-6 text-sm text-gray-400">No tiene asociados cargados.</p>
        ) : (
          <div className="divide-y divide-surface-border">
            {socio.grupoFamiliar.map((asociado) => (
              <div key={asociado.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm font-medium text-primary-dark">{asociado.nombre} {asociado.apellido}</p>
                  <p className="text-xs text-gray-400">
                    {asociado.parentesco}{asociado.dni ? ` · DNI ${asociado.dni}` : ""}
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  {[asociado.email, asociado.telefono].filter(Boolean).join(" · ") || "Sin contacto"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
