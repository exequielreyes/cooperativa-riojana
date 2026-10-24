import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { VolverAlPanel } from "@/components/socio/VolverAlPanel";
import { User, Phone, Mail, MapPin, Briefcase, Calendar, Users, Edit, CreditCard, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";

const estadoLabel: Record<string, string> = { ACTIVO: "Activo", PENDIENTE: "Pendiente", INACTIVO: "Inactivo" };
const estadoTone: Record<string, "success" | "warning" | "neutral"> = {
  ACTIVO: "success",
  PENDIENTE: "warning",
  INACTIVO: "neutral",
};

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);
  const socio = await prisma.socio.findUnique({ 
    where: { id: session!.user.socioId! },
    include: {
      grupoFamiliar: true
    }
  });

  if (!socio) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <VolverAlPanel />

      <div className="mt-4 flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        {/* Encabezado Principal (Hero) */}
        <div className="relative h-32 bg-gradient-to-r from-primary/90 to-primary-dark sm:h-40">
          <div className="absolute -bottom-12 left-6 flex items-end sm:-bottom-16 sm:left-8">
            <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-white shadow-md sm:h-32 sm:w-32">
              {socio.fotoUrl ? (
                <Image src={socio.fotoUrl} alt={socio.nombre} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-100 text-3xl font-bold text-gray-400">
                  {socio.nombre[0]}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resumen Superior */}
        <div className="px-6 pb-6 pt-16 sm:px-8 sm:pt-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">{socio.nombre} {socio.apellido}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <StatusBadge 
                  label={estadoLabel[socio.estado]} 
                  tone={estadoTone[socio.estado]} 
                />
                <span className="flex items-center gap-1">
                  <CreditCard size={14} className="text-gray-400" />
                  N° Socio: <span className="font-semibold text-primary-dark">{socio.idCooperativa}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} className="text-gray-400" />
                  Ingreso: {socio.fechaing ? new Date(socio.fechaing).toLocaleDateString("es-AR", { timeZone: "UTC" }) : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contenido Principal */}
        <div className="border-t border-gray-100 bg-gray-50/50 p-6 sm:p-8">
          <div className="grid gap-6 sm:grid-cols-2">
            
            {/* Columna Izquierda */}
            <div className="space-y-6">
              
              {/* Tarjeta: Datos Personales */}
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                  <User size={18} className="text-primary" />
                  Información Personal
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Documento (DNI)</p>
                    <p className="font-medium text-gray-900">{socio.dni} {socio.cuil ? "(CUIL: " + socio.cuil + ")" : ""}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Fecha de Nacimiento</p>
                    <p className="font-medium text-gray-900">{socio.fechaNacimiento ? new Date(socio.fechaNacimiento).toLocaleDateString("es-AR", { timeZone: "UTC" }) : "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Ocupación</p>
                    <p className="font-medium text-gray-900">{socio.ocupacion || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Tarjeta: Membresía */}
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                  <CreditCard size={18} className="text-primary" />
                  Datos de Membresía
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Área Asignada</p>
                    <p className="font-medium text-gray-900">{socio.area}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Cuotas de Capital</p>
                    <p className="font-medium text-gray-900">{socio.cuotasCapital} cuota(s)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha */}
            <div className="space-y-6">
              
              {/* Tarjeta: Contacto y Ubicación */}
              <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 font-semibold text-gray-900">
                  <MapPin size={18} className="text-primary" />
                  Contacto y Domicilio
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Correo Electrónico</p>
                    <p className="font-medium text-gray-900">{socio.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Teléfono / Celular</p>
                    <p className="font-medium text-gray-900">{socio.telefono || "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Domicilio</p>
                    <p className="font-medium text-gray-900">
                      {socio.direccion ? socio.direccion : (socio.region || "-")}
                      {socio.barrio ? ", Barrio " + socio.barrio : ""}
                    </p>
                    {socio.entrecalles && <p className="text-xs text-gray-500 mt-0.5">Entre: {socio.entrecalles}</p>}
                  </div>
                </div>
              </div>

              {/* Enlace a Grupo Familiar */}
              <Link 
                href="/portal/perfil/grupo-familiar" 
                className="group flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 p-5 transition-colors hover:bg-primary/10"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary-dark group-hover:text-primary">Mi Grupo Familiar</h3>
                    <p className="text-sm text-gray-600">
                      {socio.grupoFamiliar.filter((f) => f.activo !== false && !f.parentesco.startsWith("Titular Anterior")).length} adherente(s) activo(s){socio.grupoFamiliar.some((f) => f.activo === false || f.parentesco.startsWith("Titular Anterior")) ? ' (' + socio.grupoFamiliar.filter((f) => f.activo === false || f.parentesco.startsWith("Titular Anterior")).length + ' baja/egreso)' : ''}
                    </p>
                  </div>
                </div>
                <ChevronRight className="text-primary/40 transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
