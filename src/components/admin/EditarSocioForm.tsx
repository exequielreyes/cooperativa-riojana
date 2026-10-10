"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface SocioEditable {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  direccion: string;
  region: string;
  tipoMiembro: string;
  estado: string;
  idCooperativa: string;
  email: string;
  motivoBaja?: string | null;
  fechaNacimiento: string;
  cuil?: string | null;
  ocupacion?: string | null;
  barrio?: string | null;
  entrecalles?: string | null;
  fechaing?: string | null;
}

export function EditarSocioForm({ socio }: { socio: SocioEditable }) {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [estadoActual, setEstadoActual] = useState(socio.estado);
  const [error, setError] = useState<string | null>(null);
  const [credenciales, setCredenciales] = useState<{
    email: string;
    passwordTemporal: string;
    emailEnviado: boolean;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const payload = {
      nombre: formData.get("nombre"),
      apellido: formData.get("apellido"),
      dni: formData.get("dni"),
      telefono: formData.get("telefono"),
      direccion: formData.get("direccion"),
      region: formData.get("region"),
      barrio: formData.get("barrio"),
      entrecalles: formData.get("entrecalles"),
      cuil: formData.get("cuil"),
      ocupacion: formData.get("ocupacion"),
      fechaing: formData.get("fechaing") ? `${formData.get("fechaing")}T00:00:00.000Z` : null,
      tipoMiembro: formData.get("tipoMiembro"),
      estado: formData.get("estado"),
      motivoBaja: formData.get("estado") === "INACTIVO" ? formData.get("motivoBaja") : null,
      fechaNacimiento: formData.get("fechaNacimiento") ? `${formData.get("fechaNacimiento")}T00:00:00.000Z` : null,
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

    const data = await res.json();

  
    if (data.passwordTemporal) {
      setCredenciales({
        email: socio.email,
        passwordTemporal: data.passwordTemporal,
        emailEnviado: Boolean(data.emailEnviado),
      });
      return;
    }

    router.push("/admin/socios");
    router.refresh();
  }

  if (credenciales) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="card">
          <p className="mb-2 font-medium text-status-success">Socio aprobado correctamente</p>
          {credenciales.emailEnviado ? (
            <p className="mb-4 text-sm text-gray-600">
              Le enviamos las credenciales por email a <strong>{credenciales.email}</strong>.
              Este es un resumen por si lo necesitÃ¡s compartir de otra forma:
            </p>
          ) : (
            <p className="mb-4 text-sm text-gray-600">
              No se pudo enviar el email automatico (revisa¡ la configuración
              de Resend). Compartile estas credenciales al socio manualmente:
            </p>
          )}
          <p className="text-sm"><strong>Usuario:</strong> {credenciales.email}</p>
          <p className="mb-4 text-sm"><strong>Contraseña temporal:</strong> {credenciales.passwordTemporal}</p>
          <button
            className="btn-primary"
            onClick={() => {
              router.push("/admin/socios");
              router.refresh();
            }}
          >
            Volver al listado
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="card">
        <p className="mb-4 font-medium text-primary-dark">Informacion Personal</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-gray-500">Nombre</label>
            <input className="input" name="nombre" defaultValue={socio.nombre} required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-500">Apellidos</label>
            <input className="input" name="apellido" defaultValue={socio.apellido} required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-500">Correo Electronico</label>
            <input className="input bg-surface-muted" value={socio.email} disabled />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-500">Nº Socio</label>
            <input className="input bg-surface-muted" value={socio.idCooperativa} disabled />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-500">DNI / NIE</label>
            <input className="input" name="dni" defaultValue={socio.dni} required />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-500">CUIL (Opcional)</label>
            <input className="input" name="cuil" defaultValue={socio.cuil || ""} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-500">Fecha de nacimiento</label>
            <input className="input" type="date" name="fechaNacimiento" defaultValue={socio.fechaNacimiento} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-500">Ocupación (Opcional)</label>
            <input className="input" name="ocupacion" defaultValue={socio.ocupacion || ""} />
          </div>
        </div>
      </div>

      <div className="card">
        <p className="mb-4 font-medium text-primary-dark">Detalles de Contacto</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-gray-500">Teléfono</label>
            <input className="input" name="telefono" defaultValue={socio.telefono} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-500">Región</label>
            <select className="input" name="region" defaultValue={socio.region}>
              <option value="">Seleccione una región</option>
              <option value="Zona Sur">Zona Sur</option>
              <option value="Zona Norte">Zona Norte</option>
              <option value="Zona Este">Zona Este</option>
              <option value="Zona Oeste">Zona Oeste</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-500">Calle (Nombre de la calle)</label>
            <input className="input" name="direccion" defaultValue={socio.direccion} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-500">Entre calles (Opcional)</label>
            <input className="input" name="entrecalles" defaultValue={socio.entrecalles || ""} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-500">Barrio</label>
            <input className="input" name="barrio" defaultValue={socio.barrio || ""} />
          </div>
        </div>
      </div>

      <div className="card">
        <p className="mb-4 font-medium text-primary-dark">Datos de la Cooperativa</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm text-gray-500">Fecha de ingreso</label>
            <input className="input" type="date" name="fechaing" defaultValue={socio.fechaing || ""} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-500">Tipo de miembro</label>
            <select className="input" name="tipoMiembro" defaultValue={socio.tipoMiembro}>
              <option value="PRODUCTOR">Productor</option>
              <option value="ADHERENTE">Adherente</option>
              <option value="HONORARIO">Honorario</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-500">Estado</label>
            <select className="input" name="estado" value={estadoActual} onChange={(e) => setEstadoActual(e.target.value)}>
              <option value="ACTIVO">Activo</option>
              <option value="INACTIVO">Inactivo</option>
            </select>
          </div>
        </div>
        {estadoActual === "INACTIVO" && (
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-primary-dark">Motivo de Baja</label>
            <select className="input" name="motivoBaja" defaultValue={socio.motivoBaja || "Baja voluntaria"}>
              <option value="Baja voluntaria">Baja voluntaria</option>
              <option value="Fallecimiento">Fallecimiento</option>
              <option value="Falta de pago">Falta de pagos</option>
            </select>
          </div>
        )}
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
