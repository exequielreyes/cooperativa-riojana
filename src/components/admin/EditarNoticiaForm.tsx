"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const REDES_SOCIALES = [
  { id: "INSTAGRAM", label: "Instagram" },
  { id: "TIKTOK", label: "TikTok" },
  { id: "YOUTUBE", label: "YouTube" },
  { id: "LINKEDIN", label: "LinkedIn" },
] as const;

interface NoticiaEditable {
  id: string;
  titulo: string;
  contenido: string;
  categoria: string;
  estado: string;
  redesSociales: string[];
}

export function EditarNoticiaForm({ noticia }: { noticia: NoticiaEditable }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [redesSeleccionadas, setRedesSeleccionadas] = useState<string[]>(noticia.redesSociales);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleRed(id: string) {
    setRedesSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  }

  async function guardar(publicar?: boolean) {
    if (!formRef.current) return;
    setEnviando(true);
    setError(null);

    const formData = new FormData(formRef.current);
    const payload: Record<string, unknown> = {
      titulo: formData.get("titulo"),
      contenido: formData.get("contenido"),
      categoria: formData.get("categoria"),
      redesSociales: redesSeleccionadas,
    };
    if (publicar !== undefined) {
      payload.accion = publicar ? "PUBLICAR" : "DESPUBLICAR";
    }

    const res = await fetch(`/api/noticias/${noticia.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEnviando(false);

    if (!res.ok) {
      setError("No se pudieron guardar los cambios.");
      return;
    }

    router.push("/admin/contenidos");
    router.refresh();
  }

  return (
    <form
      className="card space-y-4"
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        guardar();
      }}
    >
      <div className="flex items-center justify-between">
        <p className="font-medium text-primary-dark">Editar Contenido</p>
        <span className={noticia.estado === "PUBLICADO" ? "badge-success" : "badge-warning"}>
          {noticia.estado === "PUBLICADO" ? "Publicado" : "Borrador"}
        </span>
      </div>

      <input className="input" name="titulo" defaultValue={noticia.titulo} required />
      <textarea className="input h-40 resize-none" name="contenido" defaultValue={noticia.contenido} required />

      <div>
        <label className="mb-1 block text-xs text-gray-400">Categoría</label>
        <select className="input" name="categoria" defaultValue={noticia.categoria}>
          <option>Noticias</option>
          <option>Institucional</option>
          <option>Comunidad</option>
          <option>Técnico</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-xs text-gray-400">Redes Sociales</label>
        <div className="grid grid-cols-2 gap-2">
          {REDES_SOCIALES.map((red) => (
            <label key={red.id} className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={redesSeleccionadas.includes(red.id)}
                onChange={() => toggleRed(red.id)}
              />
              {red.label}
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-status-danger">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn-secondary" onClick={() => router.push("/admin/contenidos")}>
          Cancelar
        </button>
        <button type="submit" className="btn-secondary" disabled={enviando}>
          {enviando ? "Guardando..." : "Guardar Cambios"}
        </button>
        {noticia.estado === "BORRADOR" ? (
          <button type="button" className="btn-primary" disabled={enviando} onClick={() => guardar(true)}>
            Guardar y Publicar
          </button>
        ) : (
          <button type="button" className="btn-primary" disabled={enviando} onClick={() => guardar(false)}>
            Guardar y Despublicar
          </button>
        )}
      </div>
    </form>
  );
}
