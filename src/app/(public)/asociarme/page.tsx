"use client";

import { useState } from "react";

export default function AsociarmePage() {
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      nombre: formData.get("nombre"),
      apellido: formData.get("apellido"),
      dni: formData.get("dni"),
      email: formData.get("email"),
      telefono: formData.get("telefono"),
      region: formData.get("region"),
      tipoMiembro: formData.get("tipoMiembro"),
      estado: "PENDIENTE",
    };

    const res = await fetch("/api/socios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEnviando(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.formErrors?.[0] ?? data.error ?? "No se pudo enviar la solicitud.");
      return;
    }

    setEnviado(true);
  }

  if (enviado) {
    return (
      <div className="mx-auto max-w-lg px-6 py-14 text-center">
        <h1 className="mb-3 text-2xl font-semibold text-primary-dark">¡Solicitud enviada!</h1>
        <p className="text-gray-600">
          Nuestro equipo administrativo va a validar tus datos y se pondrá en
          contacto por correo con los siguientes pasos.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="mb-2 text-center text-3xl font-semibold text-primary-dark">
        Únete a nuestra Cooperativa
      </h1>
      <p className="mx-auto mb-10 max-w-lg text-center text-gray-600">
        Completa tus datos y comienza el proceso para ser un nuevo socio de
        Cooperativa Riojana.
      </p>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="card">
          <p className="mb-4 font-medium text-primary-dark">Información Personal</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="input" placeholder="Nombre" name="nombre" required />
            <input className="input" placeholder="Apellidos" name="apellido" required />
          </div>
          <input className="input mt-4" placeholder="DNI / NIE" name="dni" required />
        </div>

        <div className="card">
          <p className="mb-4 font-medium text-primary-dark">Detalles de Contacto</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="input" type="email" placeholder="Correo Electrónico" name="email" required />
            <input className="input" placeholder="Teléfono" name="telefono" />
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
          <select className="input" name="tipoMiembro" defaultValue="PRODUCTOR">
            <option value="PRODUCTOR">Productor</option>
            <option value="ADHERENTE">Adherente</option>
            <option value="HONORARIO">Honorario</option>
          </select>
        </div>

        <label className="flex items-start gap-2 text-xs text-gray-500">
          <input type="checkbox" required className="mt-0.5" />
          Acepto el Estatuto Social y autorizo a Cooperativa Riojana Ltda. a
          procesar mis datos personales para fines institucionales.
        </label>

        {error && <p className="text-sm text-status-danger">{error}</p>}

        <button type="submit" className="btn-primary w-full" disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar Solicitud"}
        </button>
      </form>
    </div>
  );
}
