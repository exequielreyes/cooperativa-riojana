"use client";

import { useEffect, useState } from "react";

export function GestorRoles() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [creando, setCreando] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [passwordGenerada, setPasswordGenerada] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);


useEffect(() => {
    if (!passwordGenerada) return;

    const timer = setTimeout(() => {
      setPasswordGenerada(null);
    }, 10000); // 10 segundos

    return () => clearTimeout(timer);
  }, [passwordGenerada]);

  async function crearProfesor(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!nombre.trim() || !email.trim()) return;

    setCreando(true);
    setMensajeError(null);
    setPasswordGenerada(null);
    setCopiado(false);

    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMensajeError(data.error || "Ocurrió un error al crear la cuenta.");
        return;
      }

      setPasswordGenerada(data.passwordTemporal);
      setNombre("");
      setEmail("");
    } catch {
      setMensajeError("Error de conexión con el servidor.");
    } finally {
      setCreando(false);
    }
  }

  function copiarPassword() {
    if (!passwordGenerada) return;
    navigator.clipboard.writeText(passwordGenerada);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <p className="mb-4 font-medium text-primary-dark">Nueva Cuenta de Profesor</p>
<form onSubmit={crearProfesor} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="input"
            placeholder="Nombre y apellido"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
          <input
            className="input"
            placeholder="Correo"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {mensajeError && (
          <p className="text-xs text-red-600">{mensajeError}</p>
        )}

        <button
          type="submit"
          className="btn-primary mt-1 text-sm"
          disabled={creando}
        >
          {creando ? "Creando..." : "+ Crear cuenta de Profesor"}
        </button>
      </form>
        {passwordGenerada && (
          <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs text-primary-dark space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm">¡Cuenta de Profesor creada con éxito!</p>
              <button
                type="button"
                onClick={() => setPasswordGenerada(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
                title="Cerrar mensaje"
              >
                ✕
              </button>
            </div>
            
            <p>Contraseña temporal asignada:</p>
            
            <div className="flex items-center gap-2">
              <span className="rounded bg-white px-2.5 py-1 font-mono text-sm font-bold border border-surface-border">
                {passwordGenerada}
              </span>
              <button
                type="button"
                onClick={copiarPassword}
                className="btn-secondary text-xs px-2.5 py-1"
              >
                {copiado ? "¡Copiado!" : "Copiar"}
              </button>
            </div>
            
            <p className="text-gray-500">
              Compartila con el profesor para que pueda iniciar sesión (este mensaje se ocultará en 10 segundos).
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
