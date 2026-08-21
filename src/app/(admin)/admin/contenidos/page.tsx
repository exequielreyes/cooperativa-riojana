import Link from "next/link";
import { NoticiaForm } from "@/components/admin/NoticiaForm";
import { ContenidoRecienteItem } from "@/components/admin/ContenidoRecienteItem";
import { prisma } from "@/lib/db";
import { Trash2, GraduationCap } from "lucide-react";

export default async function AdminContenidosPage() {
  const recientes = await prisma.noticia.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
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
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* <div className="card">
            <div className="mb-2 flex items-center gap-2 text-primary-dark">
              <GraduationCap size={18} />
              <p className="font-medium">Talleres</p>
            </div>
            <p className="mb-3 text-sm text-gray-500">
              Publicá un nuevo taller para que los socios puedan inscribirse.
            </p>
            <Link href="/admin/contenidos/talleres/nuevo" className="btn-primary block text-center">
              + Subir Nuevo Taller
            </Link>
          </div> */}

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
