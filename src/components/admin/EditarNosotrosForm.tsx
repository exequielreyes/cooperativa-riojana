"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { ValorInstitucional, IniciativaSocial } from "@/lib/contenidoNosotrosDefault";

type ContenidoNosotros = {
  heroBadge: string;
  heroTitulo: string;
  heroDescripcion: string;
  heroBotonTexto: string;
  heroImagenUrl: string | null;

  textoMision: string;
  textoVision: string;
  valores: ValorInstitucional[];

  origenesLabel: string;
  origenesTitulo: string;
  origenesParrafo1: string;
  origenesParrafo2: string;
  origenesParrafo3: string;
  origenesImagenUrl: string | null;
  origenesBadgeNumero: string;
  origenesBadgeTexto: string;
  origenesHito1Titulo: string;
  origenesHito1Texto: string;
  origenesHito2Titulo: string;
  origenesHito2Texto: string;

  compromisoTitulo: string;
  compromisoDescripcion: string;
  iniciativas: IniciativaSocial[];
};

function CampoImagen({
  label,
  urlActual,
  onSeleccionar,
  archivoSeleccionado,
}: {
  label: string;
  urlActual: string | null;
  onSeleccionar: (archivo: File | null) => void;
  archivoSeleccionado: File | null;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs text-gray-400">{label}</label>
      <label className="relative flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-surface-border text-center text-xs text-gray-400 hover:bg-surface-muted">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onSeleccionar(e.target.files?.[0] ?? null)}
        />
        {archivoSeleccionado ? (
          <span className="px-2">{archivoSeleccionado.name}</span>
        ) : urlActual ? (
          <>
            <Image src={urlActual} alt="" fill className="object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity hover:opacity-100">
              Cambiar imagen
            </span>
          </>
        ) : (
          "Click para subir una imagen"
        )}
      </label>
    </div>
  );
}

export function EditarNosotrosForm({ contenido }: { contenido: ContenidoNosotros }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  const [valores, setValores] = useState<ValorInstitucional[]>(contenido.valores);
  const [iniciativas, setIniciativas] = useState<IniciativaSocial[]>(contenido.iniciativas);

  const [heroImagen, setHeroImagen] = useState<File | null>(null);
  const [origenesImagen, setOrigenesImagen] = useState<File | null>(null);
  const [iniciativaImagenes, setIniciativaImagenes] = useState<(File | null)[]>([null, null, null]);

  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardadoOk, setGuardadoOk] = useState(false);

  function actualizarValor(index: number, campo: keyof ValorInstitucional, valor: string) {
    setValores((prev) => prev.map((v, i) => (i === index ? { ...v, [campo]: valor } : v)));
  }

  function actualizarIniciativa(index: number, campo: "titulo" | "descripcion", valor: string) {
    setIniciativas((prev) => prev.map((it, i) => (i === index ? { ...it, [campo]: valor } : it)));
  }

  function setIniciativaImagen(index: number, archivo: File | null) {
    setIniciativaImagenes((prev) => prev.map((f, i) => (i === index ? archivo : f)));
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    if (!formRef.current) return;
    setEnviando(true);
    setError(null);
    setGuardadoOk(false);

    const formData = new FormData(formRef.current);
    formData.set("valores", JSON.stringify(valores));
    formData.set("iniciativas", JSON.stringify(iniciativas));

    if (heroImagen) formData.append("heroImagen", heroImagen);
    if (origenesImagen) formData.append("origenesImagen", origenesImagen);
    iniciativaImagenes.forEach((archivo, index) => {
      if (archivo) formData.append(`iniciativa${index}Imagen`, archivo);
    });

    const res = await fetch("/api/contenido-nosotros", { method: "PATCH", body: formData });

    setEnviando(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "No se pudieron guardar los cambios.");
      return;
    }

    setHeroImagen(null);
    setOrigenesImagen(null);
    setIniciativaImagenes([null, null, null]);
    setGuardadoOk(true);
    router.refresh();
  }

  return (
    <form ref={formRef} onSubmit={guardar} className="space-y-6">
      {/* --- HERO --- */}
      <div className="card">
        <p className="mb-4 font-medium text-primary-dark">Portada (Hero)</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-gray-400">Texto del badge</label>
              <input className="input" name="heroBadge" defaultValue={contenido.heroBadge} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Título principal</label>
              <input className="input" name="heroTitulo" defaultValue={contenido.heroTitulo} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Descripción</label>
              <textarea
                className="input h-24 resize-none"
                name="heroDescripcion"
                defaultValue={contenido.heroDescripcion}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Texto del botón</label>
              <input className="input" name="heroBotonTexto" defaultValue={contenido.heroBotonTexto} />
            </div>
          </div>

          <CampoImagen
            label="Imagen de fondo"
            urlActual={contenido.heroImagenUrl}
            onSeleccionar={setHeroImagen}
            archivoSeleccionado={heroImagen}
          />
        </div>
      </div>

      {/* --- MISIÓN / VISIÓN / VALORES --- */}
      <div className="card">
        <p className="mb-4 font-medium text-primary-dark">Misión, Visión y Valores</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-gray-400">Misión</label>
            <textarea className="input h-28 resize-none" name="textoMision" defaultValue={contenido.textoMision} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-400">Visión</label>
            <textarea className="input h-28 resize-none" name="textoVision" defaultValue={contenido.textoVision} />
          </div>
        </div>

        <p className="mb-2 mt-6 text-xs text-gray-400">
          Valores institucionales (4 tarjetas, en este orden)
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {valores.map((valor, index) => (
            <div key={index} className="rounded-lg border border-surface-border p-3">
              <input
                className="input mb-2"
                placeholder="Título"
                value={valor.titulo}
                onChange={(e) => actualizarValor(index, "titulo", e.target.value)}
              />
              <textarea
                className="input h-16 resize-none"
                placeholder="Descripción"
                value={valor.descripcion}
                onChange={(e) => actualizarValor(index, "descripcion", e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* --- NUESTROS ORÍGENES --- */}
      <div className="card">
        <p className="mb-4 font-medium text-primary-dark">Nuestros Orígenes</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-gray-400">Etiqueta pequeña</label>
              <input className="input" name="origenesLabel" defaultValue={contenido.origenesLabel} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Título</label>
              <input className="input" name="origenesTitulo" defaultValue={contenido.origenesTitulo} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Párrafo 1</label>
              <textarea className="input h-20 resize-none" name="origenesParrafo1" defaultValue={contenido.origenesParrafo1} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Párrafo 2</label>
              <textarea className="input h-20 resize-none" name="origenesParrafo2" defaultValue={contenido.origenesParrafo2} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Párrafo 3</label>
              <textarea className="input h-20 resize-none" name="origenesParrafo3" defaultValue={contenido.origenesParrafo3} />
            </div>
          </div>

          <div className="space-y-4">
            <CampoImagen
              label="Foto histórica"
              urlActual={contenido.origenesImagenUrl}
              onSeleccionar={setOrigenesImagen}
              archivoSeleccionado={origenesImagen}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-400">Número (badge)</label>
                <input className="input" name="origenesBadgeNumero" defaultValue={contenido.origenesBadgeNumero} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">Texto del badge</label>
                <input className="input" name="origenesBadgeTexto" defaultValue={contenido.origenesBadgeTexto} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-gray-400">Hito 1 — título</label>
                <input className="input mb-2" name="origenesHito1Titulo" defaultValue={contenido.origenesHito1Titulo} />
                <label className="mb-1 block text-xs text-gray-400">Hito 1 — texto</label>
                <input className="input" name="origenesHito1Texto" defaultValue={contenido.origenesHito1Texto} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">Hito 2 — título</label>
                <input className="input mb-2" name="origenesHito2Titulo" defaultValue={contenido.origenesHito2Titulo} />
                <label className="mb-1 block text-xs text-gray-400">Hito 2 — texto</label>
                <input className="input" name="origenesHito2Texto" defaultValue={contenido.origenesHito2Texto} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- COMPROMISO SOCIAL --- */}
      <div className="card">
        <p className="mb-4 font-medium text-primary-dark">Compromiso Social y Ambiental</p>

        <div className="mb-4">
          <label className="mb-1 block text-xs text-gray-400">Título</label>
          <input className="input mb-3" name="compromisoTitulo" defaultValue={contenido.compromisoTitulo} />
          <label className="mb-1 block text-xs text-gray-400">Descripción</label>
          <textarea
            className="input h-20 resize-none"
            name="compromisoDescripcion"
            defaultValue={contenido.compromisoDescripcion}
          />
        </div>

        <p className="mb-2 text-xs text-gray-400">Iniciativas (3 tarjetas, en este orden)</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {iniciativas.map((item, index) => (
            <div key={index} className="space-y-2 rounded-lg border border-surface-border p-3">
              <input
                className="input"
                placeholder="Título"
                value={item.titulo}
                onChange={(e) => actualizarIniciativa(index, "titulo", e.target.value)}
              />
              <textarea
                className="input h-20 resize-none"
                placeholder="Descripción"
                value={item.descripcion}
                onChange={(e) => actualizarIniciativa(index, "descripcion", e.target.value)}
              />
              <CampoImagen
                label="Imagen"
                urlActual={item.imagenUrl}
                onSeleccionar={(archivo) => setIniciativaImagen(index, archivo)}
                archivoSeleccionado={iniciativaImagenes[index]}
              />
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-status-danger">{error}</p>}
      {guardadoOk && !error && (
        <p className="text-sm text-status-success">
          Cambios guardados. Ya se ven en{" "}
          <a href="/quienes-somos" target="_blank" rel="noopener noreferrer" className="underline">
            la página pública
          </a>
          .
        </p>
      )}

      <div className="flex justify-end border-t border-surface-border pt-6">
        <button type="submit" className="btn-primary" disabled={enviando}>
          {enviando ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}
