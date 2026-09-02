"use client";

import { useState, useEffect } from "react";

export default function AsociarmePage() {
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cuotasCapital, setCuotasCapital] = useState(1);
  const [montoCapitalActual, setMontoCapitalActual] = useState(50000);

  useEffect(() => {
    fetch("/api/configuracion/public")
      .then((res) => res.json())
      .then((data) => setMontoCapitalActual(data.montoCapitalActual))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      nombre: formData.get("nombre"),
      apellido: formData.get("apellido"),
      dni: formData.get("dni"),
      fechaNacimiento: formData.get("fechaNacimiento") ? new Date(formData.get("fechaNacimiento") as string).toISOString() : null,
      email: formData.get("email"),
      telefono: formData.get("telefono"),
      region: formData.get("region"),
      tipoMiembro: formData.get("tipoMiembro"),
      estado: "PENDIENTE",
      cuotasCapital,
      montoCapital: montoCapitalActual,
    };

    const res = await fetch("/api/socios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEnviando(false);

    if (!res.ok) {
      const data = await res.json();
      const errObj = data.error;
      if (typeof errObj === "string") {
        setError(errObj);
      } else if (errObj && typeof errObj === "object") {
        const fieldErrs = Object.values(errObj.fieldErrors ?? {}) as string[][];
        setError(
          errObj.formErrors?.[0] ??
            fieldErrs[0]?.[0] ??
            "No se pudo enviar la solicitud."
        );
      } else {
        setError("No se pudo enviar la solicitud.");
      }
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
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <input className="input" placeholder="DNI / NIE" name="dni" required />
            <input className="input" type="date" placeholder="Fecha de Nacimiento" name="fechaNacimiento" required />
          </div>
        </div>

        <div className="card">
          <p className="mb-4 font-medium text-primary-dark">Detalles de Contacto</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <input className="input" type="email" placeholder="Correo Electrónico" name="email" required />
            <input className="input" placeholder="Teléfono" name="telefono" />
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
          <select className="input" name="tipoMiembro" defaultValue="PRODUCTOR">
            <option value="PRODUCTOR">Productor</option>
            <option value="ADHERENTE">Adherente</option>
            <option value="HONORARIO">Honorario</option>
          </select>
        </div>

        <div className="card">
          <p className="font-medium text-primary-dark">Cuota de Asociación</p>
          <p className="mb-4 text-sm text-gray-500">
            Elegí cómo querés abonar la cuota inicial de ingreso a la cooperativa.
          </p>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={`cursor-pointer rounded-lg border p-4 transition-colors ${cuotasCapital === 1 ? 'border-primary bg-primary/5' : 'border-surface-border hover:border-primary/30'}`}>
              <div className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="tipoPago" 
                  checked={cuotasCapital === 1} 
                  onChange={() => setCuotasCapital(1)} 
                  className="text-primary focus:ring-primary"
                />
                <span className="font-medium text-primary-dark">Pagar en el momento</span>
              </div>
              <p className="mt-1 text-sm text-gray-500 ml-5">Un único pago de contado al ser aprobado.</p>
            </label>
            
            <label className={`cursor-pointer rounded-lg border p-4 transition-colors ${cuotasCapital > 1 ? 'border-primary bg-primary/5' : 'border-surface-border hover:border-primary/30'}`}>
              <div className="flex items-center gap-2">
                <input 
                  type="radio" 
                  name="tipoPago" 
                  checked={cuotasCapital > 1} 
                  onChange={() => setCuotasCapital(12)} 
                  className="text-primary focus:ring-primary"
                />
                <span className="font-medium text-primary-dark">Financiar en cuotas</span>
              </div>
              <p className="mt-1 text-sm text-gray-500 ml-5">Mensuales, hasta 5 años (60 cuotas).</p>
            </label>
          </div>

          <p className="mt-3 text-sm font-medium text-primary-dark">
            Monto a financiar: ${Number(montoCapitalActual).toLocaleString("es-AR")}
          </p>

          {cuotasCapital > 1 && (
            <div className="mt-4">
              <label className="mb-1 block text-sm text-gray-600">¿En cuántas cuotas mensuales?</label>
              <input 
                type="number" 
                min={2} 
                max={60} 
                className="input" 
                value={cuotasCapital}
                onChange={(e) => setCuotasCapital(parseInt(e.target.value) || 2)}
                required 
              />
            </div>
          )}
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
