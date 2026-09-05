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
  motivoBaja?: string | null;
  fechaNacimiento: string;
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
      telefono: formData.get("telefono"),
      direccion: formData.get("direccion"),
      region: formData.get("region"),
      tipoMiembro: formData.get("tipoMiembro"),
      estado: formData.get("estado"),
      motivoBaja: formData.get("estado") === "INACTIVO" ? formData.get("motivoBaja") : null,
      fechaNacimiento: formData.get("fechaNacimiento") ? new Date(formData.get("fechaNacimiento") as string).toISOString() : null,
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

    // Si esta edición aprobó a un socio pendiente, el PATCH generó una
    // contraseña nueva — la mostramos como respaldo por si el email falló.
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
              Este es un resumen por si lo necesitás compartir de otra forma:
            </p>
          ) : (
            <p className="mb-4 text-sm text-gray-600">
              No se pudo enviar el email automático (revisá la configuración
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
        <p className="mb-4 font-medium text-primary-dark">Información Personal</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <input className="input" name="nombre" defaultValue={socio.nombre} placeholder="Nombre" required />
          <input className="input" name="apellido" defaultValue={socio.apellido} placeholder="Apellidos" required />
          <input className="input bg-surface-muted" value={socio.email} disabled />
          <input className="input bg-surface-muted" value={socio.idCooperativa} disabled />
          <input className="input" type="date" name="fechaNacimiento" defaultValue={socio.fechaNacimiento} placeholder="Fecha de Nacimiento" />
        </div>
      </div>

      <div className="card">
        <p className="mb-4 font-medium text-primary-dark">Detalles de Contacto</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <input className="input" name="telefono" defaultValue={socio.telefono} placeholder="Teléfono" />
          <select className="input" name="region" defaultValue={socio.region}>
            <option value="">Seleccione una región</option>
           <option value="Zona Sur">Zona Sur</option>
            <option value="Zona Norte">Zona Norte</option>
            <option value="Zona Este">Zona Este</option>
            <option value="Zona Oeste">Zona Oeste</option>
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
          <select className="input" name="estado" value={estadoActual} onChange={(e) => setEstadoActual(e.target.value)}>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </select>
        </div>
        {estadoActual === "INACTIVO" && (
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-primary-dark">Motivo de Baja</label>
            <select className="input" name="motivoBaja" defaultValue={socio.motivoBaja || "BAJA_VOLUNTARIA"}>
              <option value="BAJA_VOLUNTARIA">Baja (voluntaria/estándar)</option>
              <option value="FALLECIMIENTO">Fallecimiento</option>
              <option value="FALTA_PAGO">Falta de pagos</option>
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
