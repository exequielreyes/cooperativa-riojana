"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical } from "lucide-react";

export function AccionesSocio({ socioId, estado, email, nombre }: { socioId: string; estado: string; email: string; nombre: string }) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [credenciales, setCredenciales] = useState<{ email: string; passwordTemporal: string } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function cambiarEstado(nuevoEstado: "ACTIVO" | "INACTIVO") {
    setCargando(true);
    const res = await fetch(`/api/socios/${socioId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    setCargando(false);
    setAbierto(false);

    if (res.ok) {
      const data = await res.json();
      if (data.passwordTemporal) {
        setCredenciales({ email, passwordTemporal: data.passwordTemporal });
      }
    }
    router.refresh();
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
              onClick={() => cambiarEstado("ACTIVO")}
            >
              Aprobar Solicitud
            </button>
          )}
          {estado === "ACTIVO" && (
            <button
              className="block w-full px-4 py-2 text-left text-sm text-status-danger hover:bg-surface-muted"
              onClick={() => cambiarEstado("INACTIVO")}
            >
              Dar de Baja
            </button>
          )}
          {estado === "INACTIVO" && (
            <button
              className="block w-full px-4 py-2 text-left text-sm text-status-success hover:bg-surface-muted"
              onClick={() => cambiarEstado("ACTIVO")}
            >
              Reactivar
            </button>
          )}
        </div>
      )}

      {credenciales && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setCredenciales(null)}
        >
          <div className="card w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <p className="mb-2 font-medium text-status-success">Solicitud aprobada</p>
            <p className="mb-4 text-sm text-gray-600">
              Compartile estas credenciales temporales al socio (o implementá el envío por email):
            </p>
            <p className="text-sm"><strong>Usuario:</strong> {credenciales.email}</p>
            <p className="mb-4 text-sm"><strong>Contraseña temporal:</strong> {credenciales.passwordTemporal}</p>
            <button className="btn-primary w-full" onClick={() => setCredenciales(null)}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
