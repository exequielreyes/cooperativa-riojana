"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, ImageIcon } from "lucide-react";

interface Profesor {
  id: string;
  nombre: string | null;
  email: string;
}

export function NuevoTallerForm() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [esPago, setEsPago] = useState(false);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [profesorId, setProfesorId] = useState("");

  const [imagen, setImagen] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/usuarios/profesores")
      .then((res) => (res.ok ? res.json() : []))
      .then(setProfesores)
      .catch(() => setProfesores([]));
  }, []);

  function handleImagenChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("La imagen no puede superar los 5MB.");
        return;
      }
      setError(null);
      setImagen(file);
      const url = URL.createObjectURL(file);
      setImagenPreview(url);
    }
  }

  function handleQuitarImagen() {
    setImagen(null);
    if (imagenPreview) {
      URL.revokeObjectURL(imagenPreview);
    }
    setImagenPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const data = new FormData();
    data.append("titulo", formData.get("titulo") as string);
    data.append("descripcion", formData.get("descripcion") as string);
    data.append("categoria", formData.get("categoria") as string);
    if (formData.get("instructor")) {
      data.append("instructor", formData.get("instructor") as string);
    }
    if (profesorId) {
      data.append("profesorId", profesorId);
    }
    if (formData.get("ubicacion")) {
      data.append("ubicacion", formData.get("ubicacion") as string);
    }
    data.append("modalidad", formData.get("modalidad") as string);
    data.append("fecha", formData.get("fecha") as string);
    data.append("horaInicio", formData.get("horaInicio") as string);
    if (formData.get("horaFin")) {
      data.append("horaFin", formData.get("horaFin") as string);
    }
    data.append("cuposTotales", formData.get("cuposTotales") as string);
    if (formData.get("requisitos")) {
      data.append("requisitos", formData.get("requisitos") as string);
    }
    if (formData.get("queAprenderas")) {
      data.append("queAprenderas", formData.get("queAprenderas") as string);
    }
    if (formData.get("materialUrl")) {
      data.append("materialUrl", formData.get("materialUrl") as string);
    }
    data.append("esPago", String(esPago));
    if (esPago && formData.get("precio")) {
      data.append("precio", formData.get("precio") as string);
    }
    if (esPago && formData.get("descuento")) {
      data.append("descuento", formData.get("descuento") as string);
    }
    if (imagen) {
      data.append("imagen", imagen);
    }

    try {
      const res = await fetch("/api/talleres", {
        method: "POST",
        body: data,
      });

      setEnviando(false);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        setError(errorData.error || "No se pudo crear el taller. Revisá los campos.");
        return;
      }

      router.push("/admin/talleres");
      router.refresh();
    } catch (err) {
      setEnviando(false);
      setError("Ocurrió un error al enviar el formulario.");
    }
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
          <input className="input" name="instructor" placeholder="Instructor (texto para mostrar, opcional)" />
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

      {/* IMAGEN REPRESENTATIVA DEL TALLER */}
      <div className="card">
        <div className="flex items-center gap-2 mb-1">
          <ImageIcon size={18} className="text-primary" />
          <p className="font-medium text-primary-dark">Imagen Representativa del Taller</p>
        </div>
        <p className="mb-4 text-xs text-gray-500">
          Esta imagen identificará al taller en la grilla pública y en su página de detalles.
        </p>

        {imagenPreview ? (
          <div className="space-y-3">
            <div className="relative aspect-[16/9] w-full max-w-md overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-xs">
              <img
                src={imagenPreview}
                alt="Vista previa del taller"
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={handleQuitarImagen}
                className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80"
                title="Quitar imagen"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-xs transition hover:bg-gray-50">
                <Upload size={14} />
                Cambiar imagen
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImagenChange}
                />
              </label>
              <button
                type="button"
                onClick={handleQuitarImagen}
                className="text-xs text-status-danger hover:underline font-medium"
              >
                Quitar imagen
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-8 text-center cursor-pointer transition hover:border-primary hover:bg-gray-50/50">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleImagenChange}
            />
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-primary">
              <Upload size={22} />
            </div>
            <p className="text-sm font-semibold text-gray-800">
              Cargar imagen representativa
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Formatos soportados: JPG, PNG o WEBP (máximo 5MB)
            </p>
          </label>
        )}
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
        <p className="mb-4 font-medium text-primary-dark">Cupos, Aprendizaje y Requisitos</p>
        <input className="input mb-4" type="number" min={1} name="cuposTotales" placeholder="Cupos totales" required />
        <div className="mb-4">
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-primary-dark">
            Qué aprenderás (opcional)
          </label>
          <textarea
            className="input h-24 resize-none"
            name="queAprenderas"
            placeholder="Puntos principales que aprenderán los alumnos (un punto por línea, ej:&#10;• Técnicas prácticas para ejercitar la memoria&#10;• Ejercicios de concentración adaptados a la vida cotidiana)"
          />
          <p className="mt-1 text-xs text-gray-400">
            Se mostrará con viñetas en la sección &quot;💡 Qué aprenderás&quot; de la página del taller.
          </p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-primary-dark">
            Requisitos (opcional)
          </label>
          <textarea className="input h-20 resize-none" name="requisitos" placeholder="Requisitos (opcional)" />
        </div>
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
