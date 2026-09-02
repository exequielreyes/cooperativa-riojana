"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NuevoTallerForm() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [esPago, setEsPago] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      titulo: formData.get("titulo"),
      descripcion: formData.get("descripcion"),
      categoria: formData.get("categoria"),
      instructor: formData.get("instructor"),
      ubicacion: formData.get("ubicacion"),
      modalidad: formData.get("modalidad"),
      fecha: formData.get("fecha"),
      horaInicio: formData.get("horaInicio"),
      horaFin: formData.get("horaFin"),
      cuposTotales: formData.get("cuposTotales"),
      requisitos: formData.get("requisitos"),
      materialUrl: formData.get("materialUrl"),
      esPago,
      precio: esPago ? formData.get("precio") : null,
      descuento: esPago ? formData.get("descuento") : null,
    };

    const res = await fetch("/api/talleres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEnviando(false);

    if (!res.ok) {
      setError("No se pudo crear el taller. Revisá los campos.");
      return;
    }

    router.push("/admin/talleres");
    router.refresh();
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="card">
        <p className="mb-4 font-medium text-primary-dark">Información del Taller</p>
        <input className="input mb-4" name="titulo" placeholder="Título del taller" required />
        <textarea className="input h-28 resize-none" name="descripcion" placeholder="Descripción" required />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <select className="input" name="categoria" defaultValue="Educación">
            <option>Salud</option>
            <option>Educación</option>
            <option>Cultura</option>
            <option>Social</option>
            <option>Técnico</option>
          </select>
          <input className="input" name="instructor" placeholder="Instructor (opcional)" />
        </div>
      </div>

      <div className="card">
        <p className="mb-4 font-medium text-primary-dark">Fecha y Ubicación</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <input 
            className="input" 
            type="date" 
            name="fecha" 
            required 
            min={new Date().toISOString().split("T")[0]} 
          />
          <select className="input" name="modalidad" defaultValue="PRESENCIAL">
            <option value="PRESENCIAL">Presencial</option>
            <option value="VIRTUAL">Virtual</option>
          </select>
          <input className="input" name="horaInicio" placeholder="Hora de inicio (ej: 17:00)" required />
          <input className="input" name="horaFin" placeholder="Hora de fin (opcional)" />
        </div>
        <input className="input mt-4" name="ubicacion" placeholder="Ubicación (opcional)" />
      </div>

      <div className="card">
        <p className="mb-4 font-medium text-primary-dark">Cupos y Requisitos</p>
        <input className="input mb-4" type="number" min={1} name="cuposTotales" placeholder="Cupos totales" required />
        <textarea className="input h-20 resize-none" name="requisitos" placeholder="Requisitos (opcional)" />
      </div>

      <div className="card">
        <p className="mb-4 font-medium text-primary-dark">Material de Estudio</p>
        <input className="input" name="materialUrl" placeholder="Link al material (Drive, PDF, etc. — opcional)" />
        <p className="mt-2 text-xs text-gray-400">
          Los socios inscriptos van a poder acceder a este link desde "Mis Talleres".
        </p>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-2">
          <p className="font-medium text-primary-dark">Costo de Inscripción</p>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input 
              type="checkbox" 
              className="rounded border-gray-300 text-primary focus:ring-primary"
              checked={esPago}
              onChange={(e) => setEsPago(e.target.checked)}
            />
            Es un taller pago
          </label>
        </div>
        
        {!esPago ? (
          <p className="text-sm text-gray-400">El taller es gratuito para los socios.</p>
        ) : (
          <div className="mt-4 flex gap-4">
            <input 
              className="input flex-1" 
              type="number" 
              min="0" 
              step="0.01" 
              name="precio" 
              placeholder="Precio ($)" 
              required={esPago} 
            />
            <input 
              className="input flex-1" 
              type="number" 
              min="0" 
              max="100" 
              name="descuento" 
              placeholder="Descuento (%) — opcional" 
            />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-status-danger">{error}</p>}

      <div className="flex justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={() => router.push("/admin/talleres")}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={enviando}>
          {enviando ? "Guardando..." : "Publicar Taller"}
        </button>
      </div>
    </form>
  );
}
