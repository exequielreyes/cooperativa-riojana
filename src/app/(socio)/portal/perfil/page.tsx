import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { VolverAlPanel } from "@/components/socio/VolverAlPanel";

export default async function PerfilPage() {
  const session = await getServerSession(authOptions);
  const socio = await prisma.socio.findUnique({ where: { id: session!.user.socioId! } });

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <VolverAlPanel />
      <h1 className="mb-6 text-2xl font-semibold text-primary-dark">Mi Perfil</h1>

      <div className="card mb-6">
        <p className="mb-4 font-medium text-primary-dark">Datos Personales</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-gray-400">Nombre Completo</p>
            <p className="text-sm text-primary-dark">{socio?.nombre} {socio?.apellido}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">ID de Socio</p>
            <p className="text-sm text-primary-dark">{socio?.idCooperativa}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Correo Electrónico</p>
            <p className="text-sm text-primary-dark">{socio?.email}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Teléfono</p>
            <p className="text-sm text-primary-dark">{socio?.telefono ?? "—"}</p>
          </div>
        </div>
      </div>

      <Link href="/portal/perfil/grupo-familiar" className="card block hover:bg-surface-muted">
        <p className="font-medium text-primary-dark">Grupo Familiar →</p>
        <p className="text-sm text-gray-500">Gestioná los asociados a tu perfil (cónyuge, hijos, etc.)</p>
      </Link>
    </div>
  );
}
