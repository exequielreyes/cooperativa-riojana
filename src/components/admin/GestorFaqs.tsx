"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

interface Faq {
  id: string;
  pregunta: string;
  respuesta: string;
  orden: number;
  activa: boolean;
}

export function GestorFaqs({ faqsIniciales }: { faqsIniciales: Faq[] }) {
  const [faqs, setFaqs] = useState<Faq[]>(faqsIniciales);
  const [pregunta, setPregunta] = useState("");
  const [respuesta, setRespuesta] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function agregar() {
    if (!pregunta.trim() || !respuesta.trim()) return;
    setEnviando(true);

    const res = await fetch("/api/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pregunta, respuesta, orden: faqs.length }),
    });

    setEnviando(false);
    if (res.ok) {
      const nueva = await res.json();
      setFaqs((prev) => [...prev, nueva]);
      setPregunta("");
      setRespuesta("");
    }
  }

  async function eliminar(id: string) {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    await fetch(`/api/faqs/${id}`, { method: "DELETE" });
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <p className="mb-4 font-medium text-primary-dark">Nueva Pregunta</p>
        <input
          className="input mb-3"
          placeholder="Pregunta"
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
        />
        <textarea
          className="input h-24 resize-none"
          placeholder="Respuesta"
          value={respuesta}
          onChange={(e) => setRespuesta(e.target.value)}
        />
        <button className="btn-primary mt-3" onClick={agregar} disabled={enviando}>
          {enviando ? "Agregando..." : "+ Agregar Pregunta"}
        </button>
      </div>

      <div className="card p-0">
        {faqs.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">Todavía no hay preguntas cargadas.</p>
        ) : (
          faqs.map((faq) => (
            <div key={faq.id} className="flex items-start justify-between gap-4 border-b border-surface-border p-4 last:border-0">
              <div>
                <p className="text-sm font-medium text-primary-dark">{faq.pregunta}</p>
                <p className="mt-1 text-xs text-gray-500">{faq.respuesta}</p>
              </div>
              <button onClick={() => eliminar(faq.id)} className="shrink-0 text-gray-400 hover:text-status-danger" title="Eliminar">
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
