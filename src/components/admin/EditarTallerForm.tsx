"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Profesor {
  id: string;
  nombre: string | null;
  email: string;
}

interface TallerEditable {
  id: string;
  titulo: string;
  descripcion: string;
  categoria: string;
  instructor: string | null;
  profesorId: string | null;
  ubicacion: string | null;
  modalidad: string;
  fecha: string;
  horaInicio: string;
  horaFin: string | null;
  cuposTotales: number;
  requisitos: string | null;
  materialUrl: string | null;
  esPago: boolean;
  precio: number | null;
  descuento: number | null;
}

export function EditarTallerForm({ taller }: { taller: TallerEditable }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [esPago, setEsPago] = useState(taller.esPago);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [profesorId, setProfesorId] = useState(taller.profesorId || "");

  useEffect(() => {
    fetch("/api/usuarios/profesores")
      .then((res) => (res.ok ? res.json() : []))
      .then(setProfesores)
      .catch(() => setProfesores([]));
  }, []);

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
      profesorId: profesorId || null,
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

    const res = await fetch(`/api/talleres/${taller.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEnviando(false);

    if (!res.ok) {
      setError("No se pudo guardar los cambios del taller. Revisá los campos.");
      return;
    }

    router.push("/admin/talleres");
    router.refresh();
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="card">
        <p className="mb-4 font-medium text-primary-dark">Información del Taller</p>
        <input className="input mb-4" name="titulo" defaultValue={taller.titulo} placeholder="Título del taller" required />
        <textarea className="input h-28 resize-none" name="descripcion" defaultValue={taller.descripcion} placeholder="Descripción" required />
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <select className="input" name="categoria" defaultValue={taller.categoria}>
            <option>Salud</option>
            <option>Educación</option>
            <option>Cultura</option>
            <option>Social</option>
            <option>Técnico</option>
          </select>
          <input className="input" name="instructor" defaultValue={taller.instructor || ""} placeholder="Instructor (texto para mostrar, opcional)" />
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs text-gray-400">
            Profesor a cargo (con acceso al panel para subir material y ver inscriptos)
          </label>
          <select className="input" value={profesorId} onChange={(e) => setProfesorId(e.target.value)}>
            <option value="">Sin asignar</option>
            {profesores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre ?? p.email}
              </option>
            ))}
          </select>
          {profesores.length === 0 && (
            <p className="mt-1 text-xs text-gray-400">
              Todavía no hay profesores creados — dalos de alta desde Configuración.
            </p>
          )}
        </div>
      </div>

      <div className="card">
        <p className="mb-4 font-medium text-primary-dark">Fecha y Ubicación</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <input 
            className="input" 
            type="date" 
            name="fecha" 
            defaultValue={taller.fecha}
            required 
            min={new Date().toISOString().split("T")[0]} 
          />
          <select className="input" name="modalidad" defaultValue={taller.modalidad}>
            <option value="PRESENCIAL">Presencial</option>
            <option value="VIRTUAL">Virtual</option>
          </select>
          <input className="input" name="horaInicio" defaultValue={taller.horaInicio} placeholder="Hora de inicio (ej: 17:00)" required />
          <input className="input" name="horaFin" defaultValue={taller.horaFin || ""} placeholder="Hora de fin (opcional)" />
        </div>
        <input className="input mt-4" name="ubicacion" defaultValue={taller.ubicacion || ""} placeholder="Ubicación (opcional)" />
      </div>

      <div className="card">
        <p className="mb-4 font-medium text-primary-dark">Cupos y Requisitos</p>
        <input className="input mb-4" type="number" min={1} name="cuposTotales" defaultValue={taller.cuposTotales} placeholder="Cupos totales" required />
        <textarea className="input h-20 resize-none" name="requisitos" defaultValue={taller.requisitos || ""} placeholder="Requisitos (opcional)" />
      </div>

      <div className="card">
        <p className="mb-4 font-medium text-primary-dark">Material de Estudio</p>
        <input className="input" name="materialUrl" defaultValue={taller.materialUrl || ""} placeholder="Link al material (Drive, PDF, etc. — opcional)" />
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
              defaultValue={taller.precio || ""}
              placeholder="Precio ($)"
              required={esPago}
            />
            <input
              className="input flex-1"
              type="number"
              min="0"
              max="100"
              name="descuento"
              defaultValue={taller.descuento || ""}
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
          {enviando ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}
