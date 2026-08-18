"use client";

import { useState, FormEvent } from "react";
import { Send, CheckCircle2, AlertTriangle } from "lucide-react";

type FormState = {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
};

type Status = "idle" | "loading" | "success" | "error";

const ESTADO_INICIAL: FormState = {
  nombre: "",
  email: "",
  asunto: "",
  mensaje: "",
};

export function ContactForm() {
  const [form, setForm] = useState<FormState>(ESTADO_INICIAL);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!form.nombre || !form.email || !form.mensaje) {
      setStatus("error");
      setErrorMsg("Completá nombre, correo y mensaje antes de enviar.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "No se pudo enviar la consulta.");
      }

      setStatus("success");
      setForm(ESTADO_INICIAL);
    } catch {
      setStatus("error");
      setErrorMsg(
        "Ocurrió un problema al enviar tu consulta. Intentá nuevamente."
      );
    }
  }

  return (
    <div className="card">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Campo label="Nombre y Apellido" htmlFor="nombre">
          <input
            id="nombre"
            name="nombre"
            type="text"
            placeholder="Ej: Juan Pérez"
            value={form.nombre}
            onChange={handleChange}
            className="input"
            autoComplete="name"
          />
        </Campo>

        <Campo label="Correo Electrónico" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            placeholder="juan@ejemplo.com"
            value={form.email}
            onChange={handleChange}
            className="input"
            autoComplete="email"
          />
        </Campo>

        <Campo label="Asunto" htmlFor="asunto">
          <input
            id="asunto"
            name="asunto"
            type="text"
            placeholder="Consulta sobre cuotas..."
            value={form.asunto}
            onChange={handleChange}
            className="input"
          />
        </Campo>

        <Campo label="Tu Mensaje" htmlFor="mensaje">
          <textarea
            id="mensaje"
            name="mensaje"
            rows={5}
            placeholder="Escribe aquí tu consulta detallada..."
            value={form.mensaje}
            onChange={handleChange}
            className="input resize-none"
          />
        </Campo>

        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-primary flex w-full items-center justify-center gap-2 py-3 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <Send size={16} />
          {status === "loading" ? "Enviando..." : "Enviar Consulta"}
        </button>

        {status === "success" && (
          <p className="flex items-center gap-2 text-sm font-medium text-status-success">
            <CheckCircle2 size={16} />
            ¡Gracias! Recibimos tu consulta y te responderemos a la brevedad.
          </p>
        )}

        {status === "error" && (
          <p className="flex items-center gap-2 text-sm font-medium text-status-danger">
            <AlertTriangle size={16} />
            {errorMsg}
          </p>
        )}
      </form>
    </div>
  );
}

function Campo({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-primary-dark"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
