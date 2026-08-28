"use client";

import { useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";

interface RespuestaChatbot {
  id: string;
  pregunta?: string | null;
  palabrasClave: string;
  respuesta: string;
  link?: string | null;
  linkTexto?: string | null;
  orden: number;
  activa: boolean;
}



// Opciones predefinidas de rutas internas
const OPCIONES_RUTAS = [
  { ruta: "", label: "Sin enlace", defaultTexto: "" },
  { ruta: "/asociarme", label: "Asociarme (/asociarme)", defaultTexto: "Ir al formulario de asociación →" },
  { ruta: "/beneficios", label: "Beneficios (/beneficios)", defaultTexto: "Ver beneficios →" },
  { ruta: "/talleres", label: "Talleres (/talleres)", defaultTexto: "Ver talleres disponibles →" },
  { ruta: "/noticias", label: "Noticias (/noticias)", defaultTexto: "Ver noticias y novedades →" },
  { ruta: "/contacto", label: "Contacto (/contacto)", defaultTexto: "Ir a Formulario de Contacto →" },
  { ruta: "/portal/pagos/reportar", label: "Reportar Pago (/portal/pagos/reportar)", defaultTexto: "Ir a Reportar Pago →" },
  { ruta: "/login", label: "Iniciar Sesión (/login)", defaultTexto: "Iniciar sesión en el Portal →" }
];


const FORM_VACIO = { pregunta: "", palabrasClave: "", respuesta: "", link: "", linkTexto: "" };


export function GestorChatbot({ respuestasIniciales }: { respuestasIniciales: RespuestaChatbot[] }) {
   const [respuestas, setRespuestas] = useState<RespuestaChatbot[]>(respuestasIniciales);
  const [form, setForm] = useState(FORM_VACIO);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

 function actualizarCampo(campo: keyof typeof FORM_VACIO, valor: string) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

function handleSeleccionarRuta(rutaSeleccionada: string) {
    const opcion = OPCIONES_RUTAS.find((o) => o.ruta === rutaSeleccionada);
    setForm((prev) => ({
      ...prev,
      link: rutaSeleccionada,
      // Si no hay texto personalizado o coincide con un default anterior, autocompletar el texto sugerido
      linkTexto: rutaSeleccionada ? opcion?.defaultTexto || prev.linkTexto : ""
    }));
  }




function iniciarEdicion(r: RespuestaChatbot) {
    setEditandoId(r.id);
    setForm({
      pregunta: r.pregunta ?? "",
      palabrasClave: r.palabrasClave,
      respuesta: r.respuesta,
      link: r.link ?? "",
      linkTexto: r.linkTexto ?? "",
    });
  }


  function cancelarEdicion() {
    setEditandoId(null);
    setForm(FORM_VACIO);
  }


  async function guardar() {
    if (!form.respuesta.trim() || (!form.pregunta.trim() && !form.palabrasClave.trim())) return;
    setEnviando(true);


    const payload = {
      pregunta: form.pregunta.trim(),
      palabrasClave: form.palabrasClave.trim() || form.pregunta.trim(),
      respuesta: form.respuesta.trim(),
      link: form.link.trim() || null,
      linkTexto: form.linkTexto.trim() || null,
      orden: respuestas.length,
    };

  
if (editandoId) {
      const res = await fetch(`/api/chatbot-respuestas/${editandoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setEnviando(false);
      if (res.ok) {
        const actualizada = await res.json();
        setRespuestas((prev) => prev.map((r) => (r.id === editandoId ? actualizada : r)));
        cancelarEdicion();
      }
      return;
    }



    const res = await fetch("/api/chatbot-respuestas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEnviando(false);
    if (res.ok) {
      const nueva = await res.json();
      setRespuestas((prev) => [...prev, nueva]);
      setForm(FORM_VACIO);
    }
  }

  async function eliminar(id: string) {
    setRespuestas((prev) => prev.filter((r) => r.id !== id));
    if (editandoId === id) cancelarEdicion();
    await fetch(`/api/chatbot-respuestas/${id}`, { method: "DELETE" });
  }


  return (
    <div className="space-y-6">
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-medium text-primary-dark">
            {editandoId ? "Editar Respuesta" : "Nueva Opción / Pregunta para el Bot"}
          </p>
          {editandoId && (
            <button onClick={cancelarEdicion} className="flex items-center gap-1 text-xs text-gray-400 hover:text-status-danger">
              <X size={13} /> Cancelar edición
            </button>
          )}
        </div>

        <label className="text-xs font-semibold text-gray-600">Pregunta / Texto del botón</label>
        <input
          className="input mb-3 mt-1"
          placeholder="Ej: ¿Cuáles son los horarios de atención?"
          value={form.pregunta}
          onChange={(e) => actualizarCampo("pregunta", e.target.value)}
        />

        <label className="text-xs font-semibold text-gray-600">Palabras clave</label>
        <input
          className="input mb-1 mt-1"
          placeholder="Separadas por coma (ej: horario, atencion, abren)"
          value={form.palabrasClave}
          onChange={(e) => actualizarCampo("palabrasClave", e.target.value)}
        />
        <p className="mb-3 text-xs text-gray-400">
          Si el mensaje del socio contiene alguna de estas palabras, se ofrece esta respuesta.
        </p>

        <label className="text-xs font-semibold text-gray-600">Respuesta</label>
        <textarea
          className="input mb-3 mt-1 h-24 resize-none"
          placeholder="Respuesta del chatbot"
          value={form.respuesta}
          onChange={(e) => actualizarCampo("respuesta", e.target.value)}
        />

        <label className="text-xs font-semibold text-gray-600">Link (opcional)</label>
        <div className="mt-1 grid gap-3 sm:grid-cols-2">
          <select
            className="input bg-white"
            value={form.link}
            onChange={(e) => handleSeleccionarRuta(e.target.value)}
          >
            {OPCIONES_RUTAS.map((opcion) => (
              <option key={opcion.ruta} value={opcion.ruta}>
                {opcion.label}
              </option>
            ))}
          </select>
          <input
            className="input"
            placeholder="Texto del botón (ej: Ver talleres →)"
            value={form.linkTexto}
            disabled={!form.link}
            onChange={(e) => actualizarCampo("linkTexto", e.target.value)}
          />
        </div>
        <p className="mb-1 mt-1 text-xs text-gray-400">
          Si lo completás, el chatbot va a mostrar un botón para ir directo a esa página.
        </p>

        <button
          className="btn-primary mt-3"
          onClick={guardar}
          disabled={enviando || (!form.pregunta.trim() && !form.palabrasClave.trim()) || !form.respuesta.trim()}
        >
          {enviando ? "Guardando..." : editandoId ? "Guardar Cambios" : "+ Agregar al Chatbot"}
        </button>
      </div>

      <div className="card p-0">
        {respuestas.length === 0 ? (
          <p className="p-6 text-sm text-gray-400">Todavía no hay respuestas configuradas.</p>
        ) : (
          respuestas.map((r) => (
            <div key={r.id} className="flex items-start justify-between gap-4 border-b border-surface-border p-4 last:border-0">
              <div className="space-y-1">
                {r.pregunta && (
                  <p className="text-sm font-semibold text-primary">
                    <span className="text-xs font-normal text-gray-500">Botón:</span> {r.pregunta}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Claves:</span> {r.palabrasClave}
                </p>
                <p className="mt-1 text-sm text-gray-700">{r.respuesta}</p>
                {r.link && (
                  <p className="text-xs text-primary">
                    🔗 {r.linkTexto || "Ver más →"} <span className="text-gray-400">({r.link})</span>
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  onClick={() => iniciarEdicion(r)}
                  className="text-gray-400 transition-colors hover:text-primary"
                  title="Editar"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => eliminar(r.id)}
                  className="text-gray-400 transition-colors hover:text-status-danger"
                  title="Eliminar"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
