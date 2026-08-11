"use client";

import { useState } from "react";

interface Asociado {
  id: string;
  nombre: string;
  apellido: string;
  dni: string | null;
  parentesco: string;
  email: string | null;
  telefono: string | null;
}

export function GrupoFamiliarManager({ asociadosIniciales }: { asociadosIniciales: Asociado[] }) {
  const [asociados, setAsociados] = useState(asociadosIniciales);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [enviando, setEnviando] = useState(false);

  async function agregarAsociado(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      nombre: formData.get("nombre"),
      apellido: formData.get("apellido"),
      dni: formData.get("dni"),
      parentesco: formData.get("parentesco"),
      email: formData.get("email"),
      telefono: formData.get("telefono"),
    };

    const res = await fetch("/api/grupo-familiar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEnviando(false);
    if (res.ok) {
      const nuevo = await res.json();
      setAsociados((prev) => [...prev, nuevo]);
     form.reset(); 
      setMostrarForm(false); 
    }
  }

  async function quitarAsociado(id: string) {
    setAsociados((prev) => prev.filter((a) => a.id !== id));
    await fetch(`/api/grupo-familiar/${id}`, { method: "DELETE" });
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button className="btn-primary" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? "Cancelar" : "+ Añadir Asociado"}
        </button>
      </div>

      {mostrarForm && (
        <form className="card mb-4 grid gap-3 sm:grid-cols-2" onSubmit={agregarAsociado}>
          <input className="input" name="nombre" placeholder="Nombre" required />
          <input className="input" name="apellido" placeholder="Apellido" required />
          <input className="input" name="dni" placeholder="DNI (opcional)" />
          <input className="input" name="parentesco" placeholder="Parentesco (ej: Cónyuge, Hijo/a)" required />
          <input className="input" name="email" type="email" placeholder="Email de contacto (opcional)" />
          <input className="input" name="telefono" placeholder="Celular de contacto (opcional)" />
          <button type="submit" className="btn-primary sm:col-span-2" disabled={enviando}>
            {enviando ? "Guardando..." : "Guardar Asociado"}
          </button>
        </form>
      )}

      <div className="card divide-y divide-surface-border p-0">
        {asociados.length === 0 && (
          <p className="px-6 py-6 text-sm text-gray-400">Todavía no cargaste a nadie de tu grupo familiar.</p>
        )}
        {asociados.map((asociado) => (
          <div key={asociado.id} className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="font-medium text-primary-dark">{asociado.nombre} {asociado.apellido}</p>
              <p className="text-xs text-gray-400">
                {asociado.parentesco}{asociado.dni ? ` · DNI ${asociado.dni}` : ""}
              </p>
              {(asociado.email || asociado.telefono) && (
                <p className="text-xs text-gray-400">
                  {[asociado.email, asociado.telefono].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <button className="text-sm text-status-danger hover:underline" onClick={() => quitarAsociado(asociado.id)}>
              Quitar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
