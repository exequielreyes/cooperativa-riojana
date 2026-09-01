"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { PasswordInput } from "@/components/ui/PasswordInput";

export function CambiarPasswordForm() {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setMensaje(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const passwordNueva = formData.get("passwordNueva");
    const confirmar = formData.get("confirmar");

    if (passwordNueva !== confirmar) {
      setMensaje({ tipo: "error", texto: "Las contraseñas nuevas no coinciden." });
      setEnviando(false);
      return;
    }

    const res = await fetch("/api/perfil/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        passwordActual: formData.get("passwordActual"),
        passwordNueva,
      }),
    });

    setEnviando(false);

    if (!res.ok) {
      const data = await res.json();
      setMensaje({ tipo: "error", texto: data.error ?? "No se pudo cambiar la contraseña." });
      return;
    }

   setMensaje({ tipo: "ok", texto: "Contraseña actualizada. Cerrando sesión..." });
    form.reset(); 
    setTimeout(() => signOut({ callbackUrl: "/login" }), 1500);
  }

  return (
    <div className="card">
      <p className="mb-4 font-medium text-primary-dark">Seguridad</p>

      {!mostrarForm ? (
        <button className="btn-secondary w-full" onClick={() => setMostrarForm(true)}>
          Cambiar Contraseña
        </button>
      ) : (
        <form className="space-y-3" onSubmit={handleSubmit}>
          <PasswordInput name="passwordActual" placeholder="Contraseña actual" required />
          <PasswordInput name="passwordNueva" placeholder="Contraseña nueva (mín. 8 caracteres)" required minLength={8} />
          <PasswordInput name="confirmar" placeholder="Confirmar contraseña nueva" required />

          {mensaje && (
            <p className={`text-sm ${mensaje.tipo === "ok" ? "text-status-success" : "text-status-danger"}`}>
              {mensaje.texto}
            </p>
          )}

          <div className="flex gap-3">
            <button type="button" className="btn-secondary" onClick={() => setMostrarForm(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={enviando}>
              {enviando ? "Guardando..." : "Guardar Contraseña"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
