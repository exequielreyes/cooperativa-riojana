const roles = [
  { nombre: "Ricardo Martínez", rol: "Super Admin", ultimoAcceso: "Hoy, 09:12" },
  { nombre: "Elena López", rol: "Editor Contenidos", ultimoAcceso: "Ayer, 18:45" },
];

// TODO: reemplazar por prisma.usuario.findMany({ where: { rol: { not: "SOCIO" } } })
export default function AdminConfiguracionPage() {
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

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-medium text-primary-dark">Gestión de Roles</p>
          <button className="btn-secondary text-sm">+ Invitar Admin</button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400">
              <th className="pb-2 font-normal">Usuario</th>
              <th className="pb-2 font-normal">Rol</th>
              <th className="pb-2 font-normal">Último Acceso</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.nombre} className="border-t border-surface-border">
                <td className="py-2.5">{r.nombre}</td>
                <td className="py-2.5">
                  <span className="badge bg-primary/10 text-primary">{r.rol}</span>
                </td>
                <td className="py-2.5 text-gray-400">{r.ultimoAcceso}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
