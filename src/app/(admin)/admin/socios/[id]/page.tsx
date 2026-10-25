import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { MarcarPagadoEfectivo } from "@/components/admin/MarcarPagadoEfectivo";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { BotonBajaFamiliar } from "@/components/admin/BotonBajaFamiliar";
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
      pagos: {
        orderBy: { fechaPago: "desc" },
        take: 5,
        include: { cuota: true, validadoPor: true },
      },
      cuotas: {
        orderBy: { fechaVencimiento: "desc" },
        include: { pagos: { orderBy: { fechaPago: "desc" }, take: 1 } },
      },
    }
  });
  if (!socio) notFound();

  const cuotasPendientes = socio.cuotas.filter((c) => c.estado !== "PAGADO");
  const deudaTotal = cuotasPendientes.reduce((acc, c) => acc + Number(c.monto), 0);

  let nuevoTitular: {
    id: string;
    nombre: string;
    apellido: string;
    dni: string;
    parentesco: string;
    email: string | null;
    telefono: string | null;
  } | null = null;

  let exTitularId: string | null = null;
  let grupoFamiliarMostrar: any[] = [];

  if (socio.idCooperativa.includes("-BAJA")) {
    // Perfil del titular anterior (inactivo tras traspaso)
    const cuentaId = socio.idCooperativa.split("-BAJA")[0];
    const cuentaActiva = await prisma.socio.findFirst({
      where: { idCooperativa: cuentaId },
      include: { grupoFamiliar: true },
    });

    if (cuentaActiva) {
      nuevoTitular = {
        id: cuentaActiva.id,
        nombre: cuentaActiva.nombre,
        apellido: cuentaActiva.apellido,
        dni: cuentaActiva.dni,
        parentesco: "Nuevo Titular (Asumió titularidad)",
        email: cuentaActiva.email,
        telefono: cuentaActiva.telefono,
      };

      // Fecha límite del traspaso: solo familiares que ya estaban con el titular anterior antes de la baja,
      // no los nuevos integrantes que agregó el nuevo titular con posterioridad.
      const fechaCorteTimestamp = new Date(socio.fechaBaja || socio.createdAt).getTime() + 60 * 60 * 1000;

      const familiaresDirectos = socio.grupoFamiliar.filter(
        (f) => f.activo !== false && !f.parentesco.startsWith("Titular Anterior")
      );

      if (familiaresDirectos.length > 0) {
        grupoFamiliarMostrar = familiaresDirectos;
      } else {
        grupoFamiliarMostrar = cuentaActiva.grupoFamiliar.filter(
          (f) =>
            f.activo !== false &&
            f.dni !== socio.dni &&
            !f.parentesco.startsWith("Titular Anterior") &&
            new Date(f.createdAt).getTime() <= fechaCorteTimestamp
        );
      }
    } else {
      grupoFamiliarMostrar = socio.grupoFamiliar.filter(
        (f) => f.activo !== false && !f.parentesco.startsWith("Titular Anterior")
      );
    }
  } else {
    // Perfil del titular activo (nuevo titular o titular regular)
    // Mostramos a sus adherentes activos y además a la persona que fue Titular Anterior
    grupoFamiliarMostrar = socio.grupoFamiliar.filter(
      (f) => f.activo !== false || f.parentesco.startsWith("Titular Anterior")
    );

    const exTitular = await prisma.socio.findFirst({
      where: { idCooperativa: { startsWith: `${socio.idCooperativa}-BAJA` } },
      select: { id: true },
    });
    if (exTitular) {
      exTitularId = exTitular.id;
    }
  }

  const totalFamiliares = (nuevoTitular ? 1 : 0) + grupoFamiliarMostrar.length;

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
                  N° Socio: <span className="text-primary">{socio.idCooperativa}</span> • Área: <span className="font-semibold text-gray-700">{socio.area}</span> • Ingresó el {socio.fechaing ? new Date(socio.fechaing).toLocaleDateString("es-AR", { timeZone: "UTC" }) : "-"}
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

                      const fv = new Date(cuota.fechaVencimiento);
                      const hoy = new Date();
                      const fvMidnight = new Date(fv.getFullYear(), fv.getMonth(), fv.getDate()).getTime();
                      const hoyMidnight = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime();
                      const diffDays = Math.round((fvMidnight - hoyMidnight) / (1000 * 60 * 60 * 24));

                      const esVencida = cuota.estado === "VENCIDO" || diffDays < 0;
                      const esPorVencer = !esVencida && diffDays <= 3;

                      return (
                      <tr
                        key={cuota.id}
                        className={cn(
                          "transition-colors",
                          esVencida
                            ? "bg-red-50/40 hover:bg-red-50/70"
                            : esPorVencer
                            ? "bg-amber-50/40 hover:bg-amber-50/70"
                            : "hover:bg-gray-50/50"
                        )}
                      >
                        <td className={cn(
                          "px-5 py-4 font-medium",
                          esVencida ? "text-status-danger font-bold" : esPorVencer ? "text-amber-800 font-bold" : "text-gray-900"
                        )}>
                          {cuota.periodo}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn(
                              "font-medium",
                              esVencida
                                ? "text-status-danger font-semibold"
                                : esPorVencer
                                ? "text-amber-700 font-semibold"
                                : "text-gray-600"
                            )}>
                              {formatDate(cuota.fechaVencimiento)}
                            </span>
                            {esVencida && (
                              <StatusBadge label="Vencida" tone="danger" />
                            )}
                            {esPorVencer && (
                              <StatusBadge
                                label={diffDays === 0 ? "Vence hoy" : `Por vencer (${diffDays}d)`}
                                tone="warning"
                              />
                            )}
                          </div>
                        </td>
                        <td className={cn(
                          "px-5 py-4 font-semibold",
                          esVencida ? "text-status-danger" : esPorVencer ? "text-amber-800" : "text-gray-900"
                        )}>
                          {formatCurrency(Number(cuota.monto))}
                        </td>
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
              <CreditCard size={18} className="text-gray-500" />
              <h3 className="font-semibold text-gray-900">Historial de Pagos Recientes</h3>
            </div>
            
            {socio.pagos.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">
                No hay pagos registrados para este socio.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50/30 text-left text-xs text-gray-500">
                      <th className="px-5 py-3 font-medium">Período / Cuota</th>
                      <th className="px-5 py-3 font-medium">Fecha</th>
                      <th className="px-5 py-3 font-medium">Método</th>
                      <th className="px-5 py-3 font-medium">Monto</th>
                      <th className="px-5 py-3 font-medium">Registrado por</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {socio.pagos.map((pago) => (
                      <tr key={pago.id} className="transition-colors hover:bg-gray-50/50">
                        <td className="px-5 py-3 text-xs font-semibold text-gray-900">
                          {pago.cuota?.periodo || "Cuota Social"}
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-600">
                          {formatDate(pago.fechaPago)}
                        </td>
                        <td className="px-5 py-3 text-xs">
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            pago.metodo === "EFECTIVO" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"
                          }`}>
                            {pago.metodo}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-xs font-bold text-gray-900">
                          {formatCurrency(Number(pago.monto))}
                        </td>
                        <td className="px-5 py-3 text-xs text-gray-600">
                          {pago.validadoPor?.nombre || pago.validadoPor?.email || (pago.metodo === "EFECTIVO" ? "Cobrador" : "Administración")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 p-5">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-gray-500" />
                <h3 className="font-semibold text-gray-900">Grupo Familiar</h3>
                {socio.area === "CONSUMO" ? (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                    Sin cobertura de consumo (exclusivo titular)
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                    Cobertura de Sepelio extendida
                  </span>
                )}
              </div>
              <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-gray-200 px-1.5 text-xs font-semibold text-gray-600">
                {totalFamiliares}
              </span>
            </div>
            
            {socio.area === "CONSUMO" && (
              <div className="border-b border-amber-100 bg-amber-50/60 p-4 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Área Consumo (Cobertura Directa al Titular):</strong> A diferencia del área de Sepelio, los beneficios, servicios, obligaciones y registros de Consumo no se extienden al grupo familiar. Las operaciones se asocian directamente al socio titular y se mantienen separadas de las reglas de cobertura familiar.
                </p>
              </div>
            )}

            {totalFamiliares === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-500">No hay adherentes cargados en este grupo familiar.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {/* Si hubo traspaso de titularidad, mostramos quién asumió como nuevo titular */}
                {nuevoTitular && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-gray-50/50 bg-blue-50/15">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-sm">
                        {nuevoTitular.nombre ? nuevoTitular.nombre[0].toLowerCase() : "t"}
                      </div>
                      <div>
                        <Link href={`/admin/socios/${nuevoTitular.id}`} className="font-bold text-gray-900 hover:underline hover:text-primary">
                          {nuevoTitular.nombre} {nuevoTitular.apellido}
                        </Link>
                        <p className="mt-0.5 text-xs font-semibold text-primary">
                          {nuevoTitular.parentesco}
                        </p>
                        {nuevoTitular.dni && (
                          <p className="mt-0.5 text-xs text-gray-500">
                            DNI: {nuevoTitular.dni}
                          </p>
                        )}
                      </div>
                    </div>
                    {(nuevoTitular.email || nuevoTitular.telefono) && (
                      <div className="flex items-center gap-1.5 rounded-md bg-white border border-gray-100 px-3 py-1.5 text-xs text-gray-600">
                        <Phone size={12} className="text-gray-400" />
                        {[nuevoTitular.email, nuevoTitular.telefono].filter(Boolean).join(" • ")}
                      </div>
                    )}
                  </div>
                )}

                {/* Adherentes que tenía el grupo familiar */}
                {grupoFamiliarMostrar.map((asociado) => (
                  <div key={asociado.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-gray-50/50">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-500 text-sm">
                        {asociado.nombre ? asociado.nombre[0].toLowerCase() : "f"}
                      </div>
                      <div>
                        {asociado.parentesco.startsWith("Titular Anterior") && exTitularId ? (
                          <Link href={`/admin/socios/${exTitularId}`} className="font-bold text-gray-900 hover:underline hover:text-primary">
                            {asociado.nombre} {asociado.apellido}
                          </Link>
                        ) : (
                          <p className="font-bold text-gray-900">{asociado.nombre} {asociado.apellido}</p>
                        )}
                        <p className={`mt-0.5 text-xs ${asociado.parentesco.startsWith("Titular Anterior") ? "font-medium text-gray-600" : "font-medium text-primary"}`}>
                          {asociado.parentesco}
                        </p>
                        {asociado.dni && (
                          <p className="mt-0.5 text-xs text-gray-500">
                            DNI: {asociado.dni}
                          </p>
                        )}
                      </div>
                    </div>
                    {(asociado.email || asociado.telefono) && (
                      <div className="flex items-center gap-1.5 rounded-md bg-gray-50 px-3 py-1.5 text-xs text-gray-600">
                        <Phone size={12} className="text-gray-400" />
                        {[asociado.email, asociado.telefono].filter(Boolean).join(" • ")}
                      </div>
                    )}
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
