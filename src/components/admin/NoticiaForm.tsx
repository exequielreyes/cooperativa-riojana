"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bold, Italic, List, ListOrdered, Link2, Image as ImageIcon, Paperclip } from "lucide-react";

const REDES_SOCIALES = [
  { id: "INSTAGRAM", label: "Instagram" },
  { id: "TIKTOK", label: "TikTok" },
  { id: "YOUTUBE", label: "YouTube" },
  { id: "LINKEDIN", label: "LinkedIn" },
] as const;

export function NoticiaForm() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [redesSeleccionadas, setRedesSeleccionadas] = useState<string[]>([]);
  const [imagen, setImagen] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  function toggleRed(id: string) {
    setRedesSeleccionadas((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  }

  async function enviar(estado: "BORRADOR" | "PUBLICADO") {
    if (!formRef.current) return;
    setEnviando(true);
    setMensaje(null);

    const formData = new FormData(formRef.current);
    formData.set("estado", estado);
    redesSeleccionadas.forEach((red) => formData.append("redesSociales", red));
    if (imagen) formData.append("imagen", imagen);

    const res = await fetch("/api/noticias", { method: "POST", body: formData });
    setEnviando(false);

    if (!res.ok) {
      setMensaje("No se pudo guardar la noticia.");
      return;
    }

    setMensaje(estado === "PUBLICADO" ? "¡Noticia publicada!" : "Noticia guardada como borrador.");
    setRedesSeleccionadas([]);
    setImagen(null);
    formRef.current.reset();
    router.refresh();
  }

  return (
    <form
      className="grid gap-6 lg:col-span-3 lg:grid-cols-3"
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        enviar("BORRADOR");
      }}
    >
      <div className="card lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-medium text-primary-dark">Crear Nuevo Contenido</p>
          <span className="badge-warning">Borrador</span>
        </div>
        <input className="input mb-3" name="titulo" placeholder="Título de la publicación" required />

        {/* Barra de formato decorativa (todavía no aplica estilos al texto) */}
        <div className="flex items-center gap-3 rounded-t-lg border border-b-0 border-surface-border bg-surface-muted px-3 py-2 text-gray-400">
          <Bold size={15} /><Italic size={15} /><List size={15} /><ListOrdered size={15} />
          <Link2 size={15} /><ImageIcon size={15} /><Paperclip size={15} />
        </div>
        <textarea
          className="input h-40 resize-none rounded-t-none"
          name="contenido"
          placeholder="Escribe el cuerpo de la noticia o taller aquí..."
          required
        />

        {mensaje && <p className="mt-3 text-sm text-gray-500">{mensaje}</p>}

        <div className="mt-4 flex gap-3">
          <button type="submit" className="btn-secondary" disabled={enviando}>
            {enviando ? "Guardando..." : "Guardar Borrador"}
          </button>
          <button type="button" className="btn-primary" disabled={enviando} onClick={() => enviar("PUBLICADO")}>
            Publicar Contenido
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="card">
          <p className="mb-3 font-medium text-primary-dark">Ajustes de Publicación</p>
          <label className="mb-1 block text-xs text-gray-400">Categoría</label>
          <select className="input mb-4" name="categoria" defaultValue="Noticias">
            <option>Noticias</option>
            <option>Institucional</option>
            <option>Comunidad</option>
            <option>Técnico</option>
          </select>

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

        <div className="card">
          <p className="mb-2 font-medium text-primary-dark">Imagen Destacada</p>
          <label className="flex h-24 cursor-pointer items-center justify-center rounded-lg border border-dashed border-surface-border text-xs text-gray-400 hover:bg-surface-muted">
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setImagen(e.target.files?.[0] ?? null)} />
            {imagen ? imagen.name : "Click para subir o arrastrar archivo"}
          </label>
        </div>
      </div>
    </form>
  );
}
