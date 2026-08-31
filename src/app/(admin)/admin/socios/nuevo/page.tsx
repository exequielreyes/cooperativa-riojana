"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NuevoSocioPage() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<
    | { tipo: "activo"; email: string; passwordTemporal: string; emailEnviado: boolean }
    | { tipo: "pendiente" }
    | null
  >(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setEnviando(true);

    const formData = new FormData(e.currentTarget);
    const estado = formData.get("estado");
    const payload = {
      nombre: formData.get("nombre"),
      apellido: formData.get("apellido"),
      dni: formData.get("dni"),
      email: formData.get("email"),
      telefono: formData.get("telefono"),
      region: formData.get("region"),
      tipoMiembro: formData.get("tipoMiembro"),
      estado,
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

    if (estado === "ACTIVO") {
      setResultado({
        tipo: "activo",
        email: data.usuario.email,
        passwordTemporal: data.passwordTemporal,
        emailEnviado: Boolean(data.emailEnviado),
      });
    } else {
      setResultado({ tipo: "pendiente" });
    }
  }

  if (resultado?.tipo === "activo") {
    return (
      <div className="mx-auto max-w-lg">
        <div className="card">
          <p className="mb-2 font-medium text-status-success">Socio creado correctamente</p>
          {resultado.emailEnviado ? (
            <p className="mb-4 text-sm text-gray-600">
              Le enviamos las credenciales por email a <strong>{resultado.email}</strong>.
              Este es un resumen por si lo necesitás compartir de otra forma:
            </p>
          ) : (
            <p className="mb-4 text-sm text-gray-600">
              No se pudo enviar el email automático (revisá la configuración
              de Resend). Compartile estas credenciales al socio manualmente:
            </p>
          )}
          <p className="text-sm"><strong>Usuario:</strong> {resultado.email}</p>
          <p className="mb-4 text-sm"><strong>Contraseña temporal:</strong> {resultado.passwordTemporal}</p>
          <button className="btn-primary" onClick={() => router.push("/admin/socios")}>
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  if (resultado?.tipo === "pendiente") {
    return (
      <div className="mx-auto max-w-lg">
        <div className="card">
          <p className="mb-2 font-medium text-primary-dark">Socio registrado como pendiente</p>
          <p className="mb-4 text-sm text-gray-600">
            Todavía no se generó ni se envió ninguna contraseña. Cuando lo
            apruebes desde el listado (cambiándolo a "Activo"), el sistema va
            a generar la contraseña y enviársela automáticamente por email.
          </p>
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
             <option value="Zona Sur">Zona Sur</option>
            <option value="Zona Norte">Zona Norte</option>
            <option value="Zona Este">Zona Este</option>
            <option value="Zona Oeste">Zona Oeste</option>
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
