import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CambiarPasswordForm } from "@/components/socio/CambiarPasswordForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ConfiguracionCobradorPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/cobrador"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors"
      >
        <ArrowLeft size={16} />
        Volver al Panel de Cobros
      </Link>
      <div>
        <h1 className="text-2xl font-semibold text-primary-dark">Configuración de la Cuenta</h1>
        <p className="text-sm text-gray-500">
          Modificá tu contraseña de acceso para mantener la seguridad de tus operaciones.
        </p>
      </div>

      <CambiarPasswordForm />
    </div>
  );
}
