"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PasswordInput } from "@/components/ui/PasswordInput";

export default function RestablecerContrasenaPage() {
  return (
    <Suspense fallback={null}>
      <RestablecerContrasenaForm />
    </Suspense>
  );
}

function RestablecerContrasenaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("El enlace no es válido. Pedí uno nuevo desde \"¿Olvidaste tu contraseña?\".");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmacion) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setEnviando(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setEnviando(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "No se pudo restablecer la contraseña.");
      return;
    }

    setListo(true);
    setTimeout(() => router.push("/login"), 2500);
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-surface-muted px-6">
      <div className="card w-full max-w-sm">
        <h1 className="mb-1 text-center font-semibold text-primary-dark">
          Crear nueva contraseña
        </h1>

        {!token ? (
          <p className="mt-4 text-center text-sm text-status-danger">
            Este enlace no es válido.{" "}
            <Link href="/olvide-contrasena" className="underline">
              Pedí uno nuevo
            </Link>
            .
          </p>
        ) : listo ? (
          <p className="mt-4 text-center text-sm text-status-success">
            ¡Listo! Tu contraseña se actualizó. Te llevamos al login...
          </p>
        ) : (
          <>
            <p className="mb-6 text-center text-xs text-gray-500">
              Elegí una contraseña nueva para tu cuenta.
            </p>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <PasswordInput
                placeholder="Contraseña nueva (mín. 8 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <PasswordInput
                placeholder="Repetir contraseña"
                value={confirmacion}
                onChange={(e) => setConfirmacion(e.target.value)}
                required
              />
              {error && <p className="text-xs text-status-danger">{error}</p>}
              <button type="submit" className="btn-primary w-full" disabled={enviando}>
                {enviando ? "Guardando..." : "Restablecer contraseña"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
