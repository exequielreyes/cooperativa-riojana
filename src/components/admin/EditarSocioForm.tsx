"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SocioEditable {
  id: string;
  nombre: string;
  apellido: string;
  telefono: string;
  direccion: string;
  region: string;
  tipoMiembro: string;
  estado: string;
  idCooperativa: string;
  email: string;
}

export function EditarSocioForm({ socio }: { socio: SocioEditable }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      nombre: formData.get("nombre"),
      apellido: formData.get("apellido"),
      telefono: formData.get("telefono"),
      direccion: formData.get("direccion"),
      region: formData.get("region"),
      tipoMiembro: formData.get("tipoMiembro"),
      estado: formData.get("estado"),
    };

    const res = await fetch(`/api/socios/${socio.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setEnviando(false);

    if (!res.ok) {
      setError("No se pudo guardar los cambios.");
      return;
    }

    router.push("/admin/socios");
    router.refresh();
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="card">
        <p className="mb-4 font-medium text-primary-dark">Información Personal</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <input className="input" name="nombre" defaultValue={socio.nombre} placeholder="Nombre" required />
          <input className="input" name="apellido" defaultValue={socio.apellido} placeholder="Apellidos" required />
          <input className="input bg-surface-muted" value={socio.email} disabled />
          <input className="input bg-surface-muted" value={socio.idCooperativa} disabled />
        </div>
      </div>

      <div className="card">
        <p className="mb-4 font-medium text-primary-dark">Detalles de Contacto</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <input className="input" name="telefono" defaultValue={socio.telefono} placeholder="Teléfono" />
          <select className="input" name="region" defaultValue={socio.region}>
            <option value="">Seleccione una región</option>
            <option value="Rioja Alta">Rioja Alta</option>
            <option value="Rioja Oriental">Rioja Oriental</option>
            <option value="Valle del Ebro">Valle del Ebro</option>
          </select>
        </div>
        <input className="input mt-4" name="direccion" defaultValue={socio.direccion} placeholder="Dirección Completa" />
      </div>

      <div className="card">
        <p className="mb-4 font-medium text-primary-dark">Datos de la Cooperativa</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <select className="input" name="tipoMiembro" defaultValue={socio.tipoMiembro}>
            <option value="PRODUCTOR">Productor</option>
            <option value="ADHERENTE">Adherente</option>
            <option value="HONORARIO">Honorario</option>
          </select>
          <select className="input" name="estado" defaultValue={socio.estado}>
            <option value="ACTIVO">Activo</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
        </div>
      </div>

      {error && <p className="text-sm text-status-danger">{error}</p>}

      <div className="flex justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={() => router.push("/admin/socios")}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={enviando}>
          {enviando ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}
