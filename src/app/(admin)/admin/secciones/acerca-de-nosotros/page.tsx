import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/db";
import { CONTENIDO_NOSOTROS_DEFAULT, type ValorInstitucional, type IniciativaSocial } from "@/lib/contenidoNosotrosDefault";
import { EditarNosotrosForm } from "@/components/admin/EditarNosotrosForm";

export default async function AcercaDeNosotrosAdminPage() {
  const contenido = await prisma.contenidoNosotros.upsert({
    where: { id: "singleton" },
    update: {},
    create: CONTENIDO_NOSOTROS_DEFAULT,
  });

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/secciones"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-dark"
      >
        <ArrowLeft size={14} />
        Volver a Secciones
      </Link>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary-dark">Acerca de Nosotros</h1>
          <p className="text-sm text-gray-500">
            Editá el texto y las imágenes de la página pública "Quiénes Somos".
          </p>
        </div>
        <a
          href="/quienes-somos"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          Ver página <ExternalLink size={13} />
        </a>
      </div>

      <EditarNosotrosForm
        contenido={{
          ...contenido,
          valores: contenido.valores as unknown as ValorInstitucional[],
          iniciativas: contenido.iniciativas as unknown as IniciativaSocial[],
        }}
      />
    </div>
  );
}
