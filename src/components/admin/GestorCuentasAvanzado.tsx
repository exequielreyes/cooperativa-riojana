"use client";

import { useEffect, useState } from "react";
import { GestorRoles } from "./GestorRoles";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

const PAGE_SIZE = 7;

export function GestorCuentasAvanzado({ usuarios }: { usuarios: any[] }) {
  const [vista, setVista] = useState<"profesor" | "promotor_cobrador" | null>(null);
  
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [dni, setDni] = useState("");
  const [rol, setRol] = useState<"PROMOTOR" | "COBRADOR">("COBRADOR");
  const [creando, setCreando] = useState(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [passwordGenerada, setPasswordGenerada] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [rolCreado, setRolCreado] = useState<"PROMOTOR" | "COBRADOR">("COBRADOR");
  
  const [filtroRol, setFiltroRol] = useState<string>("TODOS");
  const [busqueda, setBusqueda] = useState<string>("");
  const [page, setPage] = useState<number>(1);

  const [usuarioAEliminar, setUsuarioAEliminar] = useState<any | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (!passwordGenerada) return;

    const timer = setTimeout(() => {
      setPasswordGenerada(null);
    }, 10000); // 10 segundos

    return () => clearTimeout(timer);
  }, [passwordGenerada]);

  async function crearPromotorCobrador(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) return;
    
    setCreando(true);
    setMensajeError(null);
    setPasswordGenerada(null);
    setCopiado(false);
    
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, dni, rol }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        const msg = typeof data.error === "string" ? data.error : "Ocurrió un error al crear la cuenta.";
        setMensajeError(msg);
        return;
      }
      
      setRolCreado(rol);
      setPasswordGenerada(data.passwordTemporal);
      setNombre("");
      setEmail("");
      setDni("");
      router.refresh();
    } catch {
      setMensajeError("Error de conexión con el servidor.");
    } finally {
      setCreando(false);
    }
  }

  function copiarPassword() {
    if (!passwordGenerada) return;
    navigator.clipboard.writeText(passwordGenerada);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  async function confirmarEliminacion() {
    if (!usuarioAEliminar) return;
    setEliminando(true);
    try {
      const res = await fetch(`/api/usuarios/${usuarioAEliminar.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUsuarioAEliminar(null);
        router.refresh();
      } else {
        alert("Error al eliminar la cuenta");
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setEliminando(false);
    }
  }

  const usuariosFiltrados = usuarios.filter((u) => {
    const coincideRol = filtroRol === "TODOS" || u.rol === filtroRol;
    const termino = busqueda.toLowerCase().trim();
    const coincideBusqueda =
      !termino ||
      (u.nombre && u.nombre.toLowerCase().includes(termino)) ||
      (u.email && u.email.toLowerCase().includes(termino)) ||
      (u.dni && u.dni.toLowerCase().includes(termino)) ||
      (u.codigoIdentificador && u.codigoIdentificador.toLowerCase().includes(termino));

    return coincideRol && coincideBusqueda;
  });

  const total = usuariosFiltrados.length;
  const totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginaActual = Math.min(page, totalPaginas);
  const usuariosPaginados = usuariosFiltrados.slice(
    (paginaActual - 1) * PAGE_SIZE,
    paginaActual * PAGE_SIZE
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <button 
          className={`btn ${vista === "profesor" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setVista(vista === "profesor" ? null : "profesor")}
        >
          Crear profesor
        </button>
        <button 
          className={`btn ${vista === "promotor_cobrador" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setVista(vista === "promotor_cobrador" ? null : "promotor_cobrador")}
        >
          Crear Promotor o Cobrador
        </button>
      </div>

      {vista === "profesor" && (
        <GestorRoles />
      )}

      {vista === "promotor_cobrador" && (
        <div className="card">
          <p className="mb-4 font-medium text-primary-dark">Nueva Cuenta de Promotor o Cobrador</p>
          <form onSubmit={crearPromotorCobrador} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="input"
                placeholder="Nombre y apellido"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
              <input
                className="input"
                placeholder="Correo"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                className="input"
                placeholder="DNI"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                required
              />
              <select
                className="input bg-white"
                value={rol}
                onChange={(e) => setRol(e.target.value as "PROMOTOR" | "COBRADOR")}
              >
                <option value="COBRADOR">Cobrador</option>
                <option value="PROMOTOR">Promotor</option>
              </select>
            </div>
            
            {mensajeError && (
              <p className="text-xs text-red-600">{mensajeError}</p>
            )}

            <button type="submit" className="btn-primary mt-1 text-sm" disabled={creando}>
              {creando ? "Creando..." : "+ Crear cuenta"}
            </button>
          </form>
          
          {passwordGenerada && (
            <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs text-primary-dark space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-sm">
                  ¡Cuenta de {rolCreado === "PROMOTOR" ? "Promotor" : "Cobrador"} creada con éxito!
                </p>
                <button
                  type="button"
                  onClick={() => setPasswordGenerada(null)}
                  className="text-gray-400 hover:text-gray-600 text-sm font-bold"
                  title="Cerrar mensaje"
                >
                  ✕
                </button>
              </div>
              
              <p>Contraseña temporal asignada:</p>
              
              <div className="flex items-center gap-2">
                <span className="rounded bg-white px-2.5 py-1 font-mono text-sm font-bold border border-surface-border">
                  {passwordGenerada}
                </span>
                <button
                  type="button"
                  onClick={copiarPassword}
                  className="btn-secondary text-xs px-2.5 py-1"
                >
                  {copiado ? "¡Copiado!" : "Copiar"}
                </button>
              </div>
              
              <p className="text-gray-500">
                Compartila con el {rolCreado === "PROMOTOR" ? "promotor" : "cobrador"} para que pueda iniciar sesión (este mensaje se ocultará en 10 segundos).
              </p>
            </div>
          )}
        </div>
      )}

      <div className="card mt-6">
        <p className="mb-4 font-medium text-primary-dark">Gestión de Cuentas (Profesores, Promotores, Cobradores)</p>
        
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            type="text"
            className="input sm:max-w-xs"
            placeholder="Buscar por nombre, correo, DNI o ID..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPage(1);
            }}
          />
          <select
            className="input bg-white sm:max-w-[200px]"
            value={filtroRol}
            onChange={(e) => {
              setFiltroRol(e.target.value);
              setPage(1);
            }}
          >
            <option value="TODOS">Todos los roles</option>
            <option value="PROFESOR">Profesor</option>
            <option value="PROMOTOR">Promotor</option>
            <option value="COBRADOR">Cobrador</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400">
                <th className="pb-2 font-normal">ID</th>
                <th className="pb-2 font-normal">Nombre</th>
                <th className="pb-2 font-normal">DNI</th>
                <th className="pb-2 font-normal">Correo</th>
                <th className="pb-2 font-normal">Rol</th>
                <th className="pb-2 font-normal">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosPaginados.map(u => (
                <tr key={u.id} className="border-t border-surface-border">
                  <td className="py-2.5 text-gray-500">{u.codigoIdentificador || "-"}</td>
                  <td className="py-2.5">{u.nombre}</td>
                  <td className="py-2.5 text-gray-500">{u.dni || "-"}</td>
                  <td className="py-2.5">{u.email}</td>
                  <td className="py-2.5">
                    <span className="badge bg-primary/10 text-primary">{u.rol}</span>
                  </td>
                  <td className="py-2.5">
                    <button
                      onClick={() => setUsuarioAEliminar(u)}
                      className="text-red-500 hover:text-red-700 text-xs font-semibold"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {usuariosPaginados.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-400">
                    No hay usuarios para mostrar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t border-surface-border pt-4 sm:flex-row">
            <span className="text-sm text-gray-500">
              Mostrando {(paginaActual - 1) * PAGE_SIZE + 1}-{Math.min(paginaActual * PAGE_SIZE, total)} de {total} cuentas
            </span>
            <nav aria-label="Paginación" className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, paginaActual - 1))}
                disabled={paginaActual === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border text-gray-500 transition-colors hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-40"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>

              {(() => {
                const delta = 1;
                const range: (number | "...")[] = [];
                const start = Math.max(2, paginaActual - delta);
                const end = Math.min(totalPaginas - 1, paginaActual + delta);

                range.push(1);
                if (start > 2) range.push("...");
                for (let i = start; i <= end; i++) range.push(i);
                if (end < totalPaginas - 1) range.push("...");
                if (totalPaginas > 1) range.push(totalPaginas);

                return range.map((p, idx) =>
                  p === "..." ? (
                    <span key={`dots-${idx}`} className="px-1 text-sm text-gray-400">
                      …
                    </span>
                  ) : (
                    <button
                      type="button"
                      key={p}
                      onClick={() => setPage(p as number)}
                      aria-current={p === paginaActual ? "page" : undefined}
                      className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        p === paginaActual
                          ? "bg-primary text-white"
                          : "border border-surface-border text-gray-600 hover:bg-surface-muted"
                      }`}
                    >
                      {p}
                    </button>
                  )
                );
              })()}

              <button
                type="button"
                onClick={() => setPage(Math.min(totalPaginas, paginaActual + 1))}
                disabled={paginaActual === totalPaginas}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border text-gray-500 transition-colors hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-40"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </button>
            </nav>
          </div>
        )}
      </div>

      <ConfirmModal
        open={Boolean(usuarioAEliminar)}
        title="¿Eliminar esta cuenta?"
        description={
          usuarioAEliminar
            ? `Se eliminará de forma permanente la cuenta de ${usuarioAEliminar.nombre || usuarioAEliminar.email} (${usuarioAEliminar.rol}). Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Sí, eliminar"
        tone="danger"
        loading={eliminando}
        onConfirm={confirmarEliminacion}
        onCancel={() => !eliminando && setUsuarioAEliminar(null)}
      />
    </div>
  );
}
