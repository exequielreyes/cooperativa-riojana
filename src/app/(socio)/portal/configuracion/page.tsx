import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PerfilForm } from "@/components/socio/PerfilForm";
import { CambiarPasswordForm } from "@/components/socio/CambiarPasswordForm";
import { VolverAlPanel } from "@/components/socio/VolverAlPanel";

export default async function ConfiguracionSocioPage() {
  const session = await getServerSession(authOptions);
  const socio = await prisma.socio.findUnique({ where: { id: session!.user.socioId! } });

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <VolverAlPanel />
      <h1 className="text-2xl font-semibold text-primary-dark">Configuración</h1>

      <PerfilForm
        socio={{
          nombre: socio!.nombre,
          apellido: socio!.apellido,
          telefono: socio!.telefono ?? "",
          email: socio!.email,
          fotoUrl: socio!.fotoUrl,
          fechaNacimiento: socio!.fechaNacimiento ? socio!.fechaNacimiento.toISOString().split("T")[0] : "",
        }}
      />

      <CambiarPasswordForm />

      <div className="card">
        <p className="mb-4 font-medium text-primary-dark">Preferencias de Notificaciones</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-gray-400">
              <th className="pb-2 font-normal">Tipo</th>
              <th className="pb-2 font-normal">Email</th>
              <th className="pb-2 font-normal">SMS</th>
            </tr>
          </thead>
          <tbody>
            {["Reportes", "Confirmaciones de pago", "Noticias Institucionales"].map((tipo) => (
              <tr key={tipo} className="border-t border-surface-border">
                <td className="py-2.5">{tipo}</td>
                <td className="py-2.5"><input type="checkbox" defaultChecked /></td>
                <td className="py-2.5"><input type="checkbox" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-gray-400">
          Estas preferencias son visuales por ahora — todavía no están conectadas al envío real de notificaciones.
        </p>
      </div>
    </div>
  );
}
