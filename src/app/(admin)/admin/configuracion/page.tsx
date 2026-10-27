import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GestorCuentasAvanzado } from "@/components/admin/GestorCuentasAvanzado";
import { InformacionCooperativaCard } from "@/components/admin/InformacionCooperativaCard";

export default async function AdminConfiguracionPage() {
  const session = await getServerSession(authOptions);
  const esSuperAdmin = session?.user.rol === "SUPER_ADMIN";

  const [usuarios, configuracion] = await Promise.all([
    prisma.usuario.findMany({
      where: {
        rol: {
          in: ["PROFESOR", "PROMOTOR", "COBRADOR"],
        },
      },
      select: {
        id: true,
        nombre: true,
        dni: true,
        codigoIdentificador: true,
        email: true,
        rol: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.configuracionCooperativa.upsert({
      where: { id: "singleton" },
      update: {},
      create: { id: "singleton" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold text-primary-dark">Configuración del Sistema</h1>

      <InformacionCooperativaCard
        cbuInicial={configuracion.cbu ?? ""}
        aliasInicial={configuracion.alias ?? ""}
      />

      {esSuperAdmin && <GestorCuentasAvanzado usuarios={usuarios} />}

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-medium text-primary-dark">Alertas y Notificaciones</p>
          <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-800 shadow-2xs">
            Próximamente
          </span>
        </div>
        <label className="flex items-center justify-between border-b border-surface-border py-3 text-sm text-gray-400 cursor-not-allowed">
          Notificar inmediatamente cuando una transacción de socio sea rechazada
          <input type="checkbox" defaultChecked disabled className="cursor-not-allowed opacity-60" />
        </label>
        <label className="flex items-center justify-between py-3 text-sm text-gray-400 cursor-not-allowed">
          Recibir resumen diario de nuevos socios adheridos
          <input type="checkbox" disabled className="cursor-not-allowed opacity-60" />
        </label>
      </div>
    </div>
  );
}
