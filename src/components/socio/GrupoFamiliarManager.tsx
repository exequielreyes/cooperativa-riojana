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
  fechaNacimiento?: string | null;
}

export function GrupoFamiliarManager({ asociadosIniciales }: { asociadosIniciales: Asociado[] }) {
  const [asociados, setAsociados] = useState(asociadosIniciales);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [asociadoEnEdicion, setAsociadoEnEdicion] = useState<Asociado | null>(null);

  async function guardarAsociado(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const payload = {
      nombre: formData.get("nombre"),
      apellido: formData.get("apellido"),
      dni: formData.get("dni"),
      parentesco: formData.get("parentesco"),
      fechaNacimiento: formData.get("fechaNacimiento"),
      email: formData.get("email"),
      telefono: formData.get("telefono"),
    };

    if (asociadoEnEdicion) {
      const res = await fetch(`/api/grupo-familiar/${asociadoEnEdicion.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setEnviando(false);
      if (res.ok) {
        const actualizado = await res.json();
        setAsociados((prev) => prev.map(a => a.id === actualizado.id ? actualizado : a));
        form.reset();
        setMostrarForm(false);
        setAsociadoEnEdicion(null);
      }
    } else {
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
  }

  async function quitarAsociado(id: string) {
    setAsociados((prev) => prev.filter((a) => a.id !== id));
    await fetch(`/api/grupo-familiar/${id}`, { method: "DELETE" });
  }

  function iniciarEdicion(asociado: Asociado) {
    setAsociadoEnEdicion(asociado);
    setMostrarForm(true);
  }

  function cancelarFormulario() {
    setMostrarForm(false);
    setAsociadoEnEdicion(null);
  }

  // Convert API ISO date to YYYY-MM-DD for the date input
  const defaultFechaNacimiento = asociadoEnEdicion?.fechaNacimiento 
    ? (typeof asociadoEnEdicion.fechaNacimiento === "string"
        ? asociadoEnEdicion.fechaNacimiento.split("T")[0]
        : new Date(asociadoEnEdicion.fechaNacimiento).toISOString().split("T")[0])
    : "";

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button className="btn-primary" onClick={() => mostrarForm ? cancelarFormulario() : setMostrarForm(true)}>
          {mostrarForm ? "Cancelar" : "+ Añadir Asociado"}
        </button>
      </div>

      {mostrarForm && (
        <form key={asociadoEnEdicion?.id || 'nuevo'} className="card mb-4 grid gap-3 sm:grid-cols-2" onSubmit={guardarAsociado}>
          <input className="input" name="nombre" placeholder="Nombre" required defaultValue={asociadoEnEdicion?.nombre || ""} />
          <input className="input" name="apellido" placeholder="Apellido" required defaultValue={asociadoEnEdicion?.apellido || ""} />
          <input className="input" name="dni" placeholder="DNI (opcional)" defaultValue={asociadoEnEdicion?.dni || ""} />
          
          <select className="input" name="parentesco" required defaultValue={asociadoEnEdicion?.parentesco || ""}>
            <option value="" disabled>Seleccionar parentesco</option>
            <option value="Esposo/a">Esposo/a</option>
            <option value="Hijo/a">Hijo/a</option>
            <option value="Pariente">Pariente</option>
          </select>

          <input className="input" type="date" name="fechaNacimiento" placeholder="Fecha de Nacimiento" required defaultValue={defaultFechaNacimiento} />

          <input className="input" name="email" type="email" placeholder="Email de contacto (opcional)" defaultValue={asociadoEnEdicion?.email || ""} />
          <input className="input" name="telefono" placeholder="Celular de contacto (opcional)" defaultValue={asociadoEnEdicion?.telefono || ""} />
          
          <button type="submit" className="btn-primary sm:col-span-2" disabled={enviando}>
            {enviando ? "Guardando..." : (asociadoEnEdicion ? "Guardar Cambios" : "Guardar Asociado")}
          </button>
        </form>
      )}

      <div className="card divide-y divide-surface-border p-0">
        {asociados.length === 0 && (
          <p className="px-6 py-6 text-sm text-gray-400">Todavía no cargaste a nadie de tu grupo familiar.</p>
        )}
        {asociados.map((asociado) => (
          <div key={asociado.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
            <div>
              <p className="font-medium text-primary-dark">{asociado.nombre} {asociado.apellido}</p>
              <p className="text-xs text-gray-400">
                {asociado.parentesco}{asociado.dni ? ` • DNI ${asociado.dni}` : ""}
              </p>
              {(asociado.email || asociado.telefono) && (
                <p className="text-xs text-gray-400">
                  {[asociado.email, asociado.telefono].filter(Boolean).join(" • ")}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button className="text-sm text-primary hover:underline" onClick={() => iniciarEdicion(asociado)}>
                Editar
              </button>
              <button className="text-sm text-status-danger hover:underline" onClick={() => quitarAsociado(asociado.id)}>
                Quitar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
