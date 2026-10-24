import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GestorCuentasAvanzado } from "@/components/admin/GestorCuentasAvanzado";

export default async function AdminConfiguracionPage() {
const session = await getServerSession(authOptions);
const esSuperAdmin = session?.user.rol === "SUPER_ADMIN";

const usuarios = await prisma.usuario.findMany({
  where: {
    rol: {
      in: ["PROFESOR", "PROMOTOR", "COBRADOR"]
    }
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
    createdAt: "desc"
  }
});

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold text-primary-dark">Configuración del Sistema</h1>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-medium text-primary-dark">Información de la Cooperativa</p>
          <button className="btn-primary">Guardar Cambios</button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <input className="input" defaultValue="Cooperativa Riojana Limitada" placeholder="Nombre de la Institución" />
          <input className="input" defaultValue="30-71000000-9" placeholder="CUIT / Identificación Fiscal" />
        </div>
      </div>

      {esSuperAdmin && (
        <GestorCuentasAvanzado usuarios={usuarios} />
      )}

      <div className="card">
        <p className="mb-4 font-medium text-primary-dark">Alertas y Notificaciones</p>
        <label className="flex items-center justify-between border-b border-surface-border py-3 text-sm text-gray-600">
          Notificar inmediatamente cuando una transacción de socio sea rechazada
          <input type="checkbox" defaultChecked />
        </label>
        <label className="flex items-center justify-between py-3 text-sm text-gray-600">
          Recibir resumen diario de nuevos socios adheridos
          <input type="checkbox" />
        </label>
      </div>
    </div>
  );
}
