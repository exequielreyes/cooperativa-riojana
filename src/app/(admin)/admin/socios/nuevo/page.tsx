"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevoSocioPage() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credenciales, setCredenciales] = useState<{ email: string; passwordTemporal: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    const formData = new FormData(e.currentTarget);
    const payload = {
      nombre: formData.get("nombre"),
      apellido: formData.get("apellido"),
      dni: formData.get("dni"),
      email: formData.get("email"),
      telefono: formData.get("telefono"),
      region: formData.get("region"),
      tipoMiembro: formData.get("tipoMiembro"),
      estado: formData.get("estado"),
    };

    const res = await fetch("/api/socios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEnviando(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.formErrors?.[0] ?? data.error ?? "No se pudo crear el socio.");
      return;
    }

    const data = await res.json();
    setCredenciales({ email: data.usuario.email, passwordTemporal: data.passwordTemporal });
  }

  if (credenciales) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="card">
          <p className="mb-2 font-medium text-status-success">Socio creado correctamente</p>
          <p className="mb-4 text-sm text-gray-600">
            Compartile estas credenciales temporales (o implementá el envío por email):
          </p>
          <p className="text-sm"><strong>Usuario:</strong> {credenciales.email}</p>
          <p className="mb-4 text-sm"><strong>Contraseña temporal:</strong> {credenciales.passwordTemporal}</p>
          <button className="btn-primary" onClick={() => router.push("/admin/socios")}>
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold text-primary-dark">Añadir Nuevo Socio</h1>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="card">
          <p className="mb-4 font-medium text-primary-dark">Información Personal</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="input" name="nombre" placeholder="Nombre" required />
            <input className="input" name="apellido" placeholder="Apellidos" required />
            <input className="input" name="dni" placeholder="DNI / NIE" required />
          </div>
        </div>

        <div className="card">
          <p className="mb-4 font-medium text-primary-dark">Detalles de Contacto</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="input" type="email" name="email" placeholder="Correo Electrónico" required />
            <input className="input" name="telefono" placeholder="Teléfono" />
          </div>
          <select className="input mt-4" name="region" defaultValue="">
            <option value="" disabled>Seleccione una región</option>
            <option value="Rioja Alta">Rioja Alta</option>
            <option value="Rioja Oriental">Rioja Oriental</option>
            <option value="Valle del Ebro">Valle del Ebro</option>
          </select>
        </div>

        <div className="card">
          <p className="mb-4 font-medium text-primary-dark">Datos de la Cooperativa</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <select className="input" name="tipoMiembro" defaultValue="PRODUCTOR">
              <option value="PRODUCTOR">Productor</option>
              <option value="ADHERENTE">Adherente</option>
              <option value="HONORARIO">Honorario</option>
            </select>
            <select className="input" name="estado" defaultValue="ACTIVO">
              <option value="ACTIVO">Activo</option>
              <option value="PENDIENTE">Pendiente</option>
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-status-danger">{error}</p>}

        <div className="flex justify-end gap-3">
          <button type="button" className="btn-secondary" onClick={() => router.back()}>
            Cancelar
          </button>
          <button type="submit" className="btn-primary" disabled={enviando}>
            {enviando ? "Guardando..." : "Guardar Socio"}
          </button>
        </div>
      </form>
    </div>
  );
}
