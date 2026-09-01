"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function OlvideContrasenaPage() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);

    // Siempre mostramos el mismo mensaje de éxito, sin importar la
    // respuesta exacta del servidor — evita revelar qué emails existen.
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => null);

    setEnviando(false);
    setEnviado(true);
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-surface-muted px-6">
      <div className="card w-full max-w-sm">
        <Link
          href="/login"
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-dark"
        >
          <ArrowLeft size={13} />
          Volver al login
        </Link>

        <h1 className="mb-1 text-center font-semibold text-primary-dark">
          ¿Olvidaste tu contraseña?
        </h1>

        {enviado ? (
          <p className="mt-4 text-center text-sm text-gray-600">
            Si <strong>{email}</strong> está registrado en el sistema, te
            enviamos un email con un enlace para restablecer tu contraseña.
            Revisá también la carpeta de spam.
          </p>
        ) : (
          <>
            <p className="mb-6 text-center text-xs text-gray-500">
              Ingresá el correo con el que te registraste y te enviamos un
              enlace para crear una contraseña nueva.
            </p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <input
                className="input"
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn-primary w-full" disabled={enviando}>
                {enviando ? "Enviando..." : "Enviar enlace de recuperación"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
