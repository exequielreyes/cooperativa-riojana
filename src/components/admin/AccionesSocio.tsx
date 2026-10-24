"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

type AccionConfirmable = "APROBAR" | "BAJA" | "REACTIVAR";

const CONFIRM_CONFIG: Record<
  AccionConfirmable,
  {
    nuevoEstado: "ACTIVO" | "INACTIVO";
    title: string;
    description: string;
    confirmLabel: string;
    tone?: "default" | "danger";
  }
> = {
  APROBAR: {
    nuevoEstado: "ACTIVO",
    title: "¿Aprobar esta solicitud?",
    description:
      "El socio pasará a estado Activo y se generará una contraseña temporal para que pueda ingresar al portal.",
    confirmLabel: "Sí, aprobar",
  },
  BAJA: {
    nuevoEstado: "INACTIVO",
    title: "¿Dar de baja a este socio?",
    description:
      "El socio quedará Inactivo y perderá acceso inmediato al portal, incluso si tiene una sesión ya abierta.",
    confirmLabel: "Sí, dar de baja",
    tone: "danger",
  },
  REACTIVAR: {
    nuevoEstado: "ACTIVO",
    title: "¿Reactivar a este socio?",
    description: "El socio recuperará el acceso al portal con su contraseña actual.",
    confirmLabel: "Sí, reactivar",
  },
};

export function AccionesSocio({
  socioId,
  estado,
  email,
  nombre,
  grupoFamiliar = [],
}: {
  socioId: string;
  estado: string;
  email: string;
  nombre: string;
  grupoFamiliar?: { id: string; nombre: string; apellido: string; parentesco?: string; activo?: boolean }[];
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [confirmando, setConfirmando] = useState<AccionConfirmable | null>(null);
  const [credenciales, setCredenciales] = useState<{
    email: string;
    passwordTemporal: string;
    emailEnviado: boolean;
  } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const [motivoBaja, setMotivoBaja] = useState<string>("");
  const [transferirAId, setTransferirAId] = useState<string>("");

  async function cambiarEstado(nuevoEstado: "ACTIVO" | "INACTIVO") {
    setCargando(true);
    const body: any = { estado: nuevoEstado };
    if (nuevoEstado === "INACTIVO" && confirmando === "BAJA") {
      body.motivoBaja = motivoBaja || null;
      if (motivoBaja === "FALLECIMIENTO" && transferirAId) {
        body.transferirAId = transferirAId;
      }
    }
    if (nuevoEstado === "ACTIVO") {
      body.motivoBaja = null;
    }
    
    const res = await fetch(`/api/socios/${socioId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setCargando(false);
    setConfirmando(null);
    setMotivoBaja("");
    setTransferirAId("");

    if (!res.ok) {
      const err = await res.json().catch(() => null);
      alert(err?.error || "Error al procesar la baja.");
      return;
    }

    const data = await res.json();
    if (data.passwordTemporal) {
      setCredenciales({
        email,
        passwordTemporal: data.passwordTemporal,
        emailEnviado: Boolean(data.emailEnviado),
      });
    }
    router.refresh();
  }

  function pedirConfirmacion(accion: AccionConfirmable) {
    setAbierto(false);
    setMotivoBaja("");
    setTransferirAId("");
    setConfirmando(accion);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        className="rounded p-1.5 text-gray-400 hover:bg-surface-muted hover:text-primary-dark"
        onClick={() => setAbierto((v) => !v)}
        disabled={cargando}
      >
        <MoreVertical size={16} />
      </button>

      {abierto && (
        <div className="absolute right-0 top-full z-10 mt-1 w-44 overflow-hidden rounded-lg border border-surface-border bg-white shadow-lg">
          <Link
            href={`/admin/socios/${socioId}`}
            className="block px-4 py-2 text-sm text-gray-600 hover:bg-surface-muted"
          >
            Ver Perfil
          </Link>
          <Link
            href={`/admin/socios/${socioId}/editar`}
            className="block px-4 py-2 text-sm text-gray-600 hover:bg-surface-muted"
          >
            Editar
          </Link>
          {estado === "PENDIENTE" && (
            <button
              className="block w-full px-4 py-2 text-left text-sm text-status-success hover:bg-surface-muted"
              onClick={() => pedirConfirmacion("APROBAR")}
            >
              Aprobar Solicitud
            </button>
          )}
          {estado === "ACTIVO" && (
            <button
              className="block w-full px-4 py-2 text-left text-sm text-status-danger hover:bg-surface-muted"
              onClick={() => pedirConfirmacion("BAJA")}
            >
              Dar de Baja
            </button>
          )}
          {estado === "INACTIVO" && (
            <button
              className="block w-full px-4 py-2 text-left text-sm text-status-success hover:bg-surface-muted"
              onClick={() => pedirConfirmacion("REACTIVAR")}
            >
              Reactivar
            </button>
          )}
        </div>
      )}

      {confirmando && (
        <ConfirmModal
          open
          title={CONFIRM_CONFIG[confirmando].title}
          description={CONFIRM_CONFIG[confirmando].description}
          confirmLabel={CONFIRM_CONFIG[confirmando].confirmLabel}
          tone={CONFIRM_CONFIG[confirmando].tone}
          loading={cargando}
          onConfirm={() => cambiarEstado(CONFIRM_CONFIG[confirmando].nuevoEstado)}
          onCancel={() => setConfirmando(null)}
        >
          {confirmando === "BAJA" && (
            <div className="mt-4 space-y-3.5">
              <select
                id="motivoBaja"
                value={motivoBaja}
                onChange={(e) => {
                  const val = e.target.value;
                  setMotivoBaja(val);
                  if (val !== "FALLECIMIENTO") {
                    setTransferirAId("");
                  }
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="">Seleccione un motivo (opcional)</option>
                <option value="BAJA_VOLUNTARIA">Baja voluntaria</option>
                <option value="FALLECIMIENTO">Fallecimiento</option>
                <option value="FALTA_PAGO">Falta de pagos</option>
              </select>

              {motivoBaja === "FALLECIMIENTO" && grupoFamiliar && grupoFamiliar.length > 0 && (
                <div className="rounded-xl border border-blue-100 bg-[#f0f6ff] p-3.5 text-left">
                  <p className="text-sm font-semibold text-[#1e40af]">Traspaso de titularidad</p>
                  <p className="mt-1 text-xs text-[#2563eb] leading-relaxed">
                    Este socio tiene un grupo familiar. Podés seleccionar un integrante para que asuma como titular de la cuenta.
                  </p>
                  <select
                    value={transferirAId}
                    onChange={(e) => setTransferirAId(e.target.value)}
                    className="mt-3 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">No transferir (Baja definitiva)</option>
                    {grupoFamiliar.filter((fam) => fam.activo !== false).map((fam) => (
                      <option key={fam.id} value={fam.id}>
                        Transferir a: {fam.nombre} {fam.apellido}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </ConfirmModal>
      )}

      {credenciales && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setCredenciales(null)}
        >
          <div className="card w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <p className="mb-2 font-medium text-status-success">Solicitud aprobada</p>
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
            <p className="text-sm">
              <strong>Usuario:</strong> {credenciales.email}
            </p>
            <p className="mb-4 text-sm">
              <strong>Contraseña temporal:</strong> {credenciales.passwordTemporal}
            </p>
            <button className="btn-primary w-full" onClick={() => setCredenciales(null)}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}