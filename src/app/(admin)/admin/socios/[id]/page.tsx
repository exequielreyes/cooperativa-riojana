import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MarcarPagadoEfectivo } from "@/components/admin/MarcarPagadoEfectivo";
import { formatCurrency, formatDate } from "@/lib/utils";
import { User, Phone, Mail, MapPin, Briefcase, Calendar, CreditCard, Users, Edit, AlertCircle } from "lucide-react";

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
      cuotas: {
        orderBy: { fechaVencimiento: "desc" },
        include: { pagos: { orderBy: { fechaPago: "desc" }, take: 1 } },
      },
    }
  });
  if (!socio) notFound();

  const cuotasPendientes = socio.cuotas.filter((c) => c.estado !== "PAGADO");
  const deudaTotal = cuotasPendientes.reduce((acc, c) => acc + Number(c.monto), 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100">
        {/* Cover Background */}
        <div className="h-32 w-full bg-gradient-to-r from-[#0f4c4c] to-[#1a7373]"></div>
        
        <div className="px-8 pb-6">
          <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4">
            {/* Avatar overlapping */}
            <div className="flex items-end gap-5">
              <div className="relative -mt-12 h-28 w-28 shrink-0 overflow-hidden rounded-full border-4 border-white bg-white shadow-md">
                {socio.fotoUrl ? (
                  <Image src={socio.fotoUrl} alt={socio.nombre} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary/10 text-4xl font-bold text-primary">
                    {socio.nombre[0]}
                  </div>
                )}
              </div>
              
              <div className="pb-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900">{socio.nombre} {socio.apellido}</h1>
                  <StatusBadge 
                    label={
                      socio.estado === "INACTIVO" && socio.motivoBaja === "Fallecimiento" ? "Inactivo (Fallecido)" :
                      socio.estado === "INACTIVO" && socio.motivoBaja === "Falta de pago" ? "Inactivo (Falta de Pago)" :
                      socio.estado === "INACTIVO" && socio.motivoBaja === "Baja voluntaria" ? "Inactivo (Voluntaria)" :
                      estadoLabel[socio.estado]
                    } 
                    tone={estadoTone[socio.estado]} 
                  />
                </div>
                <p className="mt-1 text-sm font-medium text-gray-500">
                  N° Socio: <span className="text-primary">{socio.idCooperativa}</span> • Ingresó el {socio.fechaing ? new Date(socio.fechaing).toLocaleDateString("es-AR", { timeZone: "UTC" }) : "-"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="pb-2">
              <Link href={`/admin/socios/${socio.id}/editar`} className="flex w-fit items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200">
                <Edit size={16} />
                Editar Perfil
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* LEFT COLUMN: User Info */}
        <div className="space-y-6 md:col-span-1">
          {/* Info Card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-base font-semibold text-gray-900">Datos Personales</h3>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-gray-50 p-2 text-gray-400">
                  <Mail size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="truncate text-sm font-medium text-gray-900" title={socio.email}>{socio.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-gray-50 p-2 text-gray-400">
                  <Phone size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Teléfono</p>
                  <p className="text-sm font-medium text-gray-900">{socio.telefono ?? "-"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-gray-50 p-2 text-gray-400">
                  <User size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">DNI / CUIL</p>
                  <p className="text-sm font-medium text-gray-900">{socio.dni} {socio.cuil ? `(CUIL: ${socio.cuil})` : ""}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-gray-50 p-2 text-gray-400">
                  <MapPin size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ubicación</p>
                  <p className="text-sm font-medium text-gray-900">{socio.region ?? "-"}{socio.barrio ? `, ${socio.barrio}` : ""}</p>
                  {socio.entrecalles && <p className="mt-0.5 text-xs text-gray-500">Entre: {socio.entrecalles}</p>}
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-gray-50 p-2 text-gray-400">
                  <Briefcase size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Ocupación</p>
                  <p className="text-sm font-medium text-gray-900">{socio.ocupacion || "-"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-gray-50 p-2 text-gray-400">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fecha de Nacimiento</p>
                  <p className="text-sm font-medium text-gray-900">{socio.fechaNacimiento ? new Date(socio.fechaNacimiento).toLocaleDateString("es-AR", { timeZone: "UTC" }) : "-"}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Deuda Card inside left col */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-gray-900">Estado de Cuenta</h3>
            <div className="flex items-center gap-4">
              <div className={`rounded-full p-3 ${deudaTotal > 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"}`}>
                <CreditCard size={24} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Deuda Total</p>
                <p className={`text-2xl font-bold ${deudaTotal > 0 ? "text-red-600" : "text-emerald-600"}`}>
                  {formatCurrency(deudaTotal)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Cuotas & Family */}
        <div className="space-y-6 md:col-span-2">
          
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/50 p-5">
              <AlertCircle size={18} className="text-gray-500" />
              <h3 className="font-semibold text-gray-900">Cuotas Pendientes</h3>
            </div>
            
            {cuotasPendientes.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-500">El socio está al día con sus pagos. ¡Excelente! ✨</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/30 text-left text-xs text-gray-500">
                      <th className="px-5 py-3 font-medium">Período</th>
                      <th className="px-5 py-3 font-medium">Vencimiento</th>
                      <th className="px-5 py-3 font-medium">Monto</th>
                      <th className="px-5 py-3 font-medium">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {cuotasPendientes.map((cuota) => {
                      const enRevision = cuota.pagos[0]?.estadoValidacion === "PENDIENTE_REVISION";
                      return (
                      <tr key={cuota.id} className="transition-colors hover:bg-gray-50/50">
                        <td className="px-5 py-4 font-medium text-gray-900">{cuota.periodo}</td>
                        <td className="px-5 py-4 text-gray-600">{formatDate(cuota.fechaVencimiento)}</td>
                        <td className="px-5 py-4 font-semibold text-gray-900">{formatCurrency(Number(cuota.monto))}</td>
                        <td className="px-5 py-4">
                          {enRevision ? (
                              <StatusBadge label="En revisión" tone="warning" />
                            ) : (
                              <MarcarPagadoEfectivo cuotaId={cuota.id} />
                            )}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/50 p-5">
              <Users size={18} className="text-gray-500" />
              <h3 className="font-semibold text-gray-900">Grupo Familiar Adherido</h3>
            </div>
            
            {socio.grupoFamiliar.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-500">No hay adherentes cargados en este grupo familiar.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {socio.grupoFamiliar.map((asociado) => (
                  <div key={asociado.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-gray-50/50">
                    <div>
                      <p className="font-medium text-gray-900">{asociado.nombre} {asociado.apellido}</p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        <span className="font-medium text-primary">{asociado.parentesco}</span>
                        {asociado.dni ? ` • DNI ${asociado.dni}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-md bg-gray-50 px-3 py-1.5 text-xs text-gray-600">
                      <Phone size={12} className="text-gray-400" />
                      {[asociado.email, asociado.telefono].filter(Boolean).join(" • ") || "Sin contacto"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
