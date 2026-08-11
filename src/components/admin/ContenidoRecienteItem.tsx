"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

interface NoticiaItem {
  id: string;
  slug: string;
  titulo: string;
  estado: string;
  categoria: string;
  imagenUrl: string | null;
  redes: string[];
}

export function ContenidoRecienteItem({ noticia }: { noticia: NoticiaItem }) {
  const router = useRouter();
  const [eliminando, setEliminando] = useState(false);

  async function eliminar() {
    if (!confirm(`¿Eliminar "${noticia.titulo}"? Esta acción no se puede deshacer.`)) return;
    setEliminando(true);
    await fetch(`/api/noticias/${noticia.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex items-center gap-3 border-b border-surface-border py-3 last:border-0">
      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-surface-muted">
        {noticia.imagenUrl && (
          <Image src={noticia.imagenUrl} alt={noticia.titulo} fill className="object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-primary-dark">{noticia.titulo}</p>
        <p className="text-xs text-gray-400">
          {noticia.estado === "PUBLICADO" ? "Publicado" : "Borrador"} · {noticia.categoria}
          {noticia.redes.length > 0 && ` · ${noticia.redes.join(", ")}`}
        </p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2 text-gray-400">
        {noticia.estado === "PUBLICADO" ? (
          <Link href={`/noticias/${noticia.slug}`} target="_blank" className="hover:text-primary">
            <Eye size={16} />
          </Link>
        ) : (
          <Eye size={16} className="opacity-30" />
        )}
        <Link href={`/admin/contenidos/${noticia.id}/editar`} className="hover:text-primary">
          <Pencil size={16} />
        </Link>
        <button onClick={eliminar} disabled={eliminando} className="hover:text-status-danger disabled:opacity-40">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
