import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { EditarNoticiaForm } from "@/components/admin/EditarNoticiaForm";

export default async function EditarNoticiaPage({ params }: { params: { id: string } }) {
  const noticia = await prisma.noticia.findUnique({
    where: { id: params.id },
    include: { redesSociales: true },
  });
  if (!noticia) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-primary-dark">Editar Contenido</h1>
      <EditarNoticiaForm
        noticia={{
          id: noticia.id,
          titulo: noticia.titulo,
          contenido: noticia.contenido,
          categoria: noticia.categoria,
          estado: noticia.estado,
          redesSociales: noticia.redesSociales.map((r) => r.redSocial),
        }}
      />
    </div>
  );
}
