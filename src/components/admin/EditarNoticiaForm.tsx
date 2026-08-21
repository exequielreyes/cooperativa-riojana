// "use client";

// import { useRef, useState } from "react";
// import { useRouter } from "next/navigation";

// const REDES_SOCIALES = [
//   { id: "INSTAGRAM", label: "Instagram" },
//   { id: "TIKTOK", label: "TikTok" },
//   { id: "YOUTUBE", label: "YouTube" },
//   { id: "LINKEDIN", label: "LinkedIn" },
// ] as const;

// interface NoticiaEditable {
//   id: string;
//   titulo: string;
//   contenido: string;
//   categoria: string;
//   estado: string;
//   redesSociales: string[];
// }

// export function EditarNoticiaForm({ noticia }: { noticia: NoticiaEditable }) {
//   const router = useRouter();
//   const formRef = useRef<HTMLFormElement>(null);
//   const [redesSeleccionadas, setRedesSeleccionadas] = useState<string[]>(noticia.redesSociales);
//   const [enviando, setEnviando] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   function toggleRed(id: string) {
//     setRedesSeleccionadas((prev) =>
//       prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
//     );
//   }

//   async function guardar(publicar?: boolean) {
//     if (!formRef.current) return;
//     setEnviando(true);
//     setError(null);

//     const formData = new FormData(formRef.current);
//     const payload: Record<string, unknown> = {
//       titulo: formData.get("titulo"),
//       contenido: formData.get("contenido"),
//       categoria: formData.get("categoria"),
//       redesSociales: redesSeleccionadas,
//     };
//     if (publicar !== undefined) {
//       payload.accion = publicar ? "PUBLICAR" : "DESPUBLICAR";
//     }

//     const res = await fetch(`/api/noticias/${noticia.id}`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify(payload),
//     });

//     setEnviando(false);

//     if (!res.ok) {
//       setError("No se pudieron guardar los cambios.");
//       return;
//     }

//     router.push("/admin/contenidos");
//     router.refresh();
//   }

//   return (
//     <form
//       className="card space-y-4"
//       ref={formRef}
//       onSubmit={(e) => {
//         e.preventDefault();
//         guardar();
//       }}
//     >
//       <div className="flex items-center justify-between">
//         <p className="font-medium text-primary-dark">Editar Contenido</p>
//         <span className={noticia.estado === "PUBLICADO" ? "badge-success" : "badge-warning"}>
//           {noticia.estado === "PUBLICADO" ? "Publicado" : "Borrador"}
//         </span>
//       </div>

//       <input className="input" name="titulo" defaultValue={noticia.titulo} required />
//       <textarea className="input h-40 resize-none" name="contenido" defaultValue={noticia.contenido} required />

//       <div>
//         <label className="mb-1 block text-xs text-gray-400">Categoría</label>
//         <select className="input" name="categoria" defaultValue={noticia.categoria}>
//           <option>Noticias</option>
//           <option>Institucional</option>
//           <option>Comunidad</option>
//           <option>Técnico</option>
//         </select>
//       </div>

//       <div>
//         <label className="mb-2 block text-xs text-gray-400">Redes Sociales</label>
//         <div className="grid grid-cols-2 gap-2">
//           {REDES_SOCIALES.map((red) => (
//             <label key={red.id} className="flex items-center gap-2 text-sm text-gray-600">
//               <input
//                 type="checkbox"
//                 checked={redesSeleccionadas.includes(red.id)}
//                 onChange={() => toggleRed(red.id)}
//               />
//               {red.label}
//             </label>
//           ))}
//         </div>
//       </div>

//       {error && <p className="text-sm text-status-danger">{error}</p>}

//       <div className="flex flex-wrap gap-3">
//         <button type="button" className="btn-secondary" onClick={() => router.push("/admin/contenidos")}>
//           Cancelar
//         </button>
//         <button type="submit" className="btn-secondary" disabled={enviando}>
//           {enviando ? "Guardando..." : "Guardar Cambios"}
//         </button>
//         {noticia.estado === "BORRADOR" ? (
//           <button type="button" className="btn-primary" disabled={enviando} onClick={() => guardar(true)}>
//             Guardar y Publicar
//           </button>
//         ) : (
//           <button type="button" className="btn-primary" disabled={enviando} onClick={() => guardar(false)}>
//             Guardar y Despublicar
//           </button>
//         )}
//       </div>
//     </form>
//   );
// }



"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Bold, Heading, Link2, Video } from "lucide-react";
import { aplicarNegrita, aplicarSubtitulo, aplicarLink, aplicarVideo } from "@/lib/editorContenido";

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
  imagenUrl: string | null;
  redesSociales: string[];
}

export function EditarNoticiaForm({ noticia }: { noticia: NoticiaEditable }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const contenidoRef = useRef<HTMLTextAreaElement>(null);
  const [redesSeleccionadas, setRedesSeleccionadas] = useState<string[]>(noticia.redesSociales);
  const [imagenNueva, setImagenNueva] = useState<File | null>(null);
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
    redesSeleccionadas.forEach((red) => formData.append("redesSociales", red));
    if (imagenNueva) formData.append("imagen", imagenNueva);
    if (publicar !== undefined) {
      formData.set("accion", publicar ? "PUBLICAR" : "DESPUBLICAR");
    }

    const res = await fetch(`/api/noticias/${noticia.id}`, { method: "PATCH", body: formData });

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
      className="space-y-6"
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        guardar();
      }}
    >
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-medium text-primary-dark">Editar Contenido</p>
          <span className={noticia.estado === "PUBLICADO" ? "badge-success" : "badge-warning"}>
            {noticia.estado === "PUBLICADO" ? "Publicado" : "Borrador"}
          </span>
        </div>

        <input className="input mb-3" name="titulo" defaultValue={noticia.titulo} required />

        <div className="flex items-center gap-3 rounded-t-lg border border-b-0 border-surface-border bg-surface-muted px-3 py-2 text-gray-500">
          <button type="button" onClick={() => contenidoRef.current && aplicarNegrita(contenidoRef.current)} className="hover:text-primary" title="Negrita">
            <Bold size={15} />
          </button>
          <button type="button" onClick={() => contenidoRef.current && aplicarSubtitulo(contenidoRef.current)} className="hover:text-primary" title="Subtítulo (letra más grande)">
            <Heading size={15} />
          </button>
          <button type="button" onClick={() => contenidoRef.current && aplicarLink(contenidoRef.current)} className="hover:text-primary" title="Insertar link">
            <Link2 size={15} />
          </button>
          <button type="button" onClick={() => contenidoRef.current && aplicarVideo(contenidoRef.current)} className="hover:text-primary" title="Insertar video de YouTube o TikTok">
            <Video size={15} />
          </button>
        </div>
        <textarea
          className="input h-40 resize-none rounded-t-none"
          name="contenido"
          defaultValue={noticia.contenido}
          ref={contenidoRef}
          required
        />
      </div>

      <div className="card">
        <p className="mb-4 font-medium text-primary-dark">Ajustes de Publicación</p>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-gray-400">Categoría</label>
            <select className="input mb-4" name="categoria" defaultValue={noticia.categoria}>
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

          <div>
            <label className="mb-2 block text-xs text-gray-400">Imagen Destacada</label>
            <label className="relative flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-surface-border text-center text-xs text-gray-400 hover:bg-surface-muted">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setImagenNueva(e.target.files?.[0] ?? null)}
              />
              {imagenNueva ? (
                <span className="px-2">{imagenNueva.name}</span>
              ) : noticia.imagenUrl ? (
                <>
                  <Image src={noticia.imagenUrl} alt={noticia.titulo} fill className="object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity hover:opacity-100">
                    Cambiar imagen
                  </span>
                </>
              ) : (
                "Click para subir una imagen"
              )}
            </label>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-status-danger">{error}</p>}

      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-surface-border pt-6">
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
