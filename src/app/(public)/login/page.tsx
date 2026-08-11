"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    setCargando(false);

    if (result?.error) {
      setError("Correo/usuario o contraseña incorrectos.");
      return;
    }

    // Redirigimos según el rol de la sesión recién creada
    const session = await getSession();
    if (session?.user?.rol === "SOCIO") {
      router.push("/portal");
    } else {
      router.push("/admin");
    }
    router.refresh();
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-surface-muted px-6">
      <div className="card w-full max-w-sm">
        <h1 className="mb-1 text-center font-semibold text-primary-dark">Bienvenido al Portal</h1>
        <p className="mb-6 text-center text-xs text-gray-500">
          Ingrese sus credenciales para gestionar su cuenta y servicios.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input className="input" placeholder="Correo electrónico o Usuario" name="email" type="email" required />
          <input className="input" type="password" placeholder="Contraseña" name="password" required />
          {error && <p className="text-xs text-status-danger">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={cargando}>
            {cargando ? "Ingresando..." : "Acceder al Portal"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-gray-400">
          <span className="h-px flex-1 bg-surface-border" />
          ¿No es socio aún?
          <span className="h-px flex-1 bg-surface-border" />
        </div>

        <Link href="/asociarme" className="btn-secondary block text-center">
          Solicitar Asociación →
        </Link>
      </div>
    </div>
  );
}
