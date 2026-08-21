"use client";

import { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";

type Tipo = "DOCUMENTO" | "VIDEO" | "ENLACE";

export function SubirContenidoForm({ tallerId }: { tallerId: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [tipo, setTipo] = useState<Tipo>("DOCUMENTO");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const res = await fetch(`/api/talleres/${tallerId}/contenidos`, {
      method: "POST",
      body: formData,
    });

    setEnviando(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "No se pudo subir el contenido.");
      return;
    }

    formRef.current?.reset();
    setTipo("DOCUMENTO");
    router.refresh();
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="card space-y-4">
      <p className="font-medium text-primary-dark">Agregar contenido</p>

      <input className="input" name="titulo" placeholder="Título (ej: Clase 1 — Introducción)" required />
      <textarea
        className="input h-20 resize-none"
        name="descripcion"
        placeholder="Descripción breve (opcional)"
      />

      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-primary-dark">
          Tipo de contenido
        </label>
        <select
          className="input"
          name="tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as Tipo)}
        >
          <option value="DOCUMENTO">Documento (subir archivo: PDF, Word, PPT, Excel, imagen)</option>
          <option value="VIDEO">Video (link de YouTube / Vimeo)</option>
          <option value="ENLACE">Enlace externo (Drive, sitio, etc.)</option>
        </select>
      </div>

      {tipo === "DOCUMENTO" ? (
        <div>
          <input
            className="input"
            type="file"
            name="archivo"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.webp"
            required
          />
          <p className="mt-1.5 text-xs text-gray-400">Tamaño máximo: 5MB.</p>
        </div>
      ) : (
        <input
          className="input"
          name="url"
          type="url"
          placeholder={tipo === "VIDEO" ? "https://youtube.com/watch?v=..." : "https://..."}
          required
        />
      )}

      {error && <p className="text-sm text-status-danger">{error}</p>}

      <button type="submit" className="btn-primary" disabled={enviando}>
        {enviando ? "Subiendo..." : "Agregar contenido"}
      </button>
    </form>
  );
}
