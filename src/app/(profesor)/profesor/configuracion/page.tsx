import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CambiarPasswordForm } from "@/components/socio/CambiarPasswordForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function ConfiguracionProfesorPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-10">
      <Link
        href="/profesor"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary"
      >
        <ArrowLeft size={16} />
        Volver
      </Link>
      <h1 className="text-2xl font-semibold text-primary-dark">Configuración</h1>

      <CambiarPasswordForm />
    </div>
  );
}
