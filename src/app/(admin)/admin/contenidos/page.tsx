import Link from "next/link";
import { NoticiaForm } from "@/components/admin/NoticiaForm";
import { ContenidoRecienteItem } from "@/components/admin/ContenidoRecienteItem";
import { prisma } from "@/lib/db";
import { Trash2 } from "lucide-react";
import { AdminPagination } from "@/components/ui/AdminPagination";

const PAGE_SIZE = 6;

export default async function AdminContenidosPage({
  searchParams,
}: {
  searchParams?: { page?: string };
}) {
  const page = Math.max(1, parseInt(searchParams?.page ?? "1", 10) || 1);

  const totalNoticias = await prisma.noticia.count();
  const totalPaginas = Math.max(1, Math.ceil(totalNoticias / PAGE_SIZE));
  const pageSegura = Math.min(page, totalPaginas);

  const recientes = await prisma.noticia.findMany({
    orderBy: { createdAt: "desc" },
    skip: (pageSegura - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    include: { redesSociales: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-primary-dark">Gestión de Contenidos</h1>
      </div>

      <NoticiaForm />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <p className="mb-3 font-medium text-primary-dark">Contenidos Recientes</p>
          {recientes.length === 0 ? (
            <p className="text-sm text-gray-400">Todavía no cargaste ninguna noticia.</p>
          ) : (
            <div>
              {recientes.map((noticia) => (
                <ContenidoRecienteItem
                  key={noticia.id}
                  noticia={{
                    id: noticia.id,
                    slug: noticia.slug,
                    titulo: noticia.titulo,
                    estado: noticia.estado,
                    categoria: noticia.categoria,
                    imagenUrl: noticia.imagenUrl,
                    redes: noticia.redesSociales.map((r) => r.redSocial),
                  }}
                />
              ))}

              <div className="-mx-6 -mb-6 mt-4">
                <AdminPagination
                  page={pageSegura}
                  totalPaginas={totalPaginas}
                  totalItems={totalNoticias}
                  pageSize={PAGE_SIZE}
                  itemLabel="noticias"
                  basePath="/admin/contenidos"
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card border-status-danger/30">
            <div className="mb-2 flex items-center gap-2 text-status-danger">
              <Trash2 size={18} />
              <p className="font-medium">Limpieza de Archivo</p>
            </div>
            <p className="mb-3 text-sm text-gray-500">
              Elimina automáticamente contenidos con más de 2 años de antigüedad
              para optimizar el almacenamiento del portal.
            </p>
            <button className="btn-secondary w-full cursor-not-allowed text-status-danger opacity-60" disabled>
              Eliminar Contenido Antiguo
            </button>
            <p className="mt-2 text-center text-[10px] uppercase tracking-wide text-gray-400">
              Acción irreversible · Próximamente
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
