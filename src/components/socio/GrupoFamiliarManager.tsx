"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UserMinus, History, Users, AlertCircle, UserCheck } from "lucide-react";

export interface Asociado {
  id: string;
  nombre: string;
  apellido: string;
  dni: string | null;
  parentesco: string;
  email: string | null;
  telefono: string | null;
  fechaNacimiento?: string | null;
  activo?: boolean;
  motivoBaja?: string | null;
  fechaBaja?: string | null;
}

export function GrupoFamiliarManager({
  asociadosIniciales,
  isAdmin = false,
  socioId,
  area,
}: {
  asociadosIniciales: Asociado[];
  isAdmin?: boolean;
  socioId?: string;
  area?: string;
}) {
  const esConsumo = area === "CONSUMO";
  const [asociados, setAsociados] = useState<Asociado[]>(asociadosIniciales);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [asociadoEnEdicion, setAsociadoEnEdicion] = useState<Asociado | null>(null);
  
  // Pestaña activa: "activos" vs "historial_bajas"
  const [tab, setTab] = useState<"activos" | "bajas">("activos");

  // Modal de registro de baja / egreso
  const [asociadoParaBaja, setAsociadoParaBaja] = useState<Asociado | null>(null);
  const [motivoBaja, setMotivoBaja] = useState("Baja voluntaria");
  const [otroMotivo, setOtroMotivo] = useState("");
  const [errorBaja, setErrorBaja] = useState<string | null>(null);

  // Modal y estado de reactivación de integrante
  const [asociadoParaReactivar, setAsociadoParaReactivar] = useState<Asociado | null>(null);
  const [errorReactivar, setErrorReactivar] = useState<string | null>(null);

  const esTitularAnterior = (a: Asociado) => a.parentesco?.startsWith("Titular Anterior");
  const activos = asociados.filter((a) => a.activo !== false && !esTitularAnterior(a));
  const egresados = asociados.filter((a) => a.activo === false || esTitularAnterior(a));

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
      ...(socioId ? { socioId } : {}),
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
        setAsociados((prev) =>
          prev.map((a) => (a.id === actualizado.id ? { ...a, ...actualizado } : a))
        );
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

  async function confirmarBaja() {
    if (!asociadoParaBaja) return;
    setEnviando(true);
    setErrorBaja(null);

    const motivoFinal = motivoBaja === "OTRO" ? (otroMotivo.trim() || "Otro motivo") : motivoBaja;

    try {
      const res = await fetch(`/api/grupo-familiar/${asociadoParaBaja.id}/baja`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ motivoBaja: motivoFinal }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const mensaje =
          typeof data.error === "string"
            ? data.error
            : data.error?.formErrors?.[0] ||
              (data.error?.fieldErrors && (Object.values(data.error.fieldErrors)[0] as any)?.[0]) ||
              "No se pudo registrar la baja.";
        throw new Error(mensaje);
      }

      const fechaActualIso = new Date().toISOString();
      setAsociados((prev) =>
        prev.map((a) =>
          a.id === asociadoParaBaja.id
            ? {
                ...a,
                activo: false,
                motivoBaja: motivoFinal,
                fechaBaja: fechaActualIso,
              }
            : a
        )
      );

      setAsociadoParaBaja(null);
      setMotivoBaja("Baja voluntaria");
      setOtroMotivo("");
    } catch (err: any) {
      setErrorBaja(err.message || "Error al procesar la baja");
    } finally {
      setEnviando(false);
    }
  }

  async function confirmarReactivacion() {
    if (!asociadoParaReactivar) return;
    setEnviando(true);
    setErrorReactivar(null);

    try {
      const res = await fetch(`/api/grupo-familiar/${asociadoParaReactivar.id}/reactivar`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const mensaje =
          typeof data.error === "string"
            ? data.error
            : "No se pudo reactivar el integrante.";
        throw new Error(mensaje);
      }

      setAsociados((prev) =>
        prev.map((a) =>
          a.id === asociadoParaReactivar.id
            ? {
                ...a,
                activo: true,
                motivoBaja: null,
                fechaBaja: null,
              }
            : a
        )
      );

      setAsociadoParaReactivar(null);
    } catch (err: any) {
      setErrorReactivar(err.message || "Error al reactivar el integrante");
    } finally {
      setEnviando(false);
    }
  }

  function iniciarEdicion(asociado: Asociado) {
    if (asociado.parentesco.startsWith("Titular Anterior")) return;
    setAsociadoEnEdicion(asociado);
    setMostrarForm(true);
  }

  function cancelarFormulario() {
    setMostrarForm(false);
    setAsociadoEnEdicion(null);
  }

  const defaultFechaNacimiento = asociadoEnEdicion?.fechaNacimiento
    ? typeof asociadoEnEdicion.fechaNacimiento === "string"
      ? asociadoEnEdicion.fechaNacimiento.split("T")[0]
      : new Date(asociadoEnEdicion.fechaNacimiento).toISOString().split("T")[0]
    : "";

  return (
    <div className="space-y-4">
      {/* Barra superior: Tabs y botón agregar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 border border-gray-200 text-sm">
          <button
            type="button"
            onClick={() => setTab("activos")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-medium transition-colors ${
              tab === "activos"
                ? "bg-white text-primary-dark shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Users size={16} />
            <span>Integrantes Activos ({activos.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("bajas")}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-medium transition-colors ${
              tab === "bajas"
                ? "bg-white text-status-danger shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <History size={16} />
            <span>Historial de Bajas / Egresos ({egresados.length})</span>
          </button>
        </div>

        {tab === "activos" && !esConsumo && (
          <button
            className="btn-primary"
            onClick={() => (mostrarForm ? cancelarFormulario() : setMostrarForm(true))}
          >
            {mostrarForm ? "Cancelar" : "+ Añadir Integrante"}
          </button>
        )}
      </div>

      {/* Formulario de Alta / Edición */}
      {mostrarForm && (!esConsumo || asociadoEnEdicion) && (
        <form
          key={asociadoEnEdicion?.id || "nuevo"}
          className="card mb-4 grid gap-3 sm:grid-cols-2"
          onSubmit={guardarAsociado}
        >
          <input
            className="input"
            name="nombre"
            placeholder="Nombre"
            required
            defaultValue={asociadoEnEdicion?.nombre || ""}
          />
          <input
            className="input"
            name="apellido"
            placeholder="Apellido"
            required
            defaultValue={asociadoEnEdicion?.apellido || ""}
          />
          <input
            className="input"
            name="dni"
            placeholder="DNI (opcional)"
            defaultValue={asociadoEnEdicion?.dni || ""}
          />

          <select
            className="input"
            name="parentesco"
            required
            defaultValue={asociadoEnEdicion?.parentesco || ""}
          >
            <option value="" disabled>
              Seleccionar parentesco
            </option>
            <option value="Esposo/a">Esposo/a</option>
            <option value="Hijo/a">Hijo/a</option>
            <option value="Padre/Madre">Padre/Madre</option>
            <option value="Hermano/a">Hermano/a</option>
            <option value="Pariente">Pariente</option>
          </select>

          <input
            className="input"
            type="date"
            name="fechaNacimiento"
            placeholder="Fecha de Nacimiento"
            required
            defaultValue={defaultFechaNacimiento}
          />

          <input
            className="input"
            name="email"
            type="email"
            placeholder="Email de contacto (opcional)"
            defaultValue={asociadoEnEdicion?.email || ""}
          />
          <input
            className="input"
            name="telefono"
            placeholder="Celular de contacto (opcional)"
            defaultValue={asociadoEnEdicion?.telefono || ""}
          />

          <button type="submit" className="btn-primary sm:col-span-2" disabled={enviando}>
            {enviando
              ? "Guardando..."
              : asociadoEnEdicion
              ? "Guardar Cambios"
              : "Guardar Integrante"}
          </button>
        </form>
      )}

      {/* LISTA DE ACTIVOS */}
      {tab === "activos" && (
        <div className="card divide-y divide-surface-border p-0 overflow-hidden">
          {activos.length === 0 && (
            <p className="px-6 py-8 text-center text-sm text-gray-400">
              No hay integrantes activos en este grupo familiar.
            </p>
          )}
          {activos.map((asociado) => (
            <div
              key={asociado.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 hover:bg-gray-50 transition-colors"
            >
              <div>
                <p className="font-semibold text-primary-dark">
                  {asociado.nombre} {asociado.apellido}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  <span className="font-medium text-primary">{asociado.parentesco}</span>
                  {asociado.dni ? ` • DNI ${asociado.dni}` : ""}
                </p>
                {(asociado.email || asociado.telefono) && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {[asociado.email, asociado.telefono].filter(Boolean).join(" • ")}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="text-sm text-primary hover:underline font-medium"
                  onClick={() => iniciarEdicion(asociado)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-sm font-medium text-status-danger hover:underline"
                  onClick={() => {
                    setAsociadoParaBaja(asociado);
                    setMotivoBaja("Baja voluntaria");
                    setOtroMotivo("");
                    setErrorBaja(null);
                  }}
                >
                  <UserMinus size={14} />
                  Dar de baja / Egreso
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HISTORIAL DE BAJAS / EGRESOS */}
      {tab === "bajas" && (
        <div className="card divide-y divide-surface-border p-0 overflow-hidden">
          {egresados.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-gray-400">
              No se registraron bajas o egresos en este grupo familiar. Todos los datos históricos se conservan aquí cuando se dé de baja a un integrante.
            </div>
          ) : (
            egresados.map((asociado) => {
              const fechaBajaFormateada = asociado.fechaBaja
                ? new Date(asociado.fechaBaja).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })
                : "—";

              const motivoMostrar = asociado.motivoBaja || 
                (asociado.parentesco.includes("Baja:") 
                  ? asociado.parentesco.split("Baja:")[1].replace(")", "").trim() 
                  : "Baja de titularidad");

              const esTitular = esTitularAnterior(asociado);
              const puedeReactivar = !esTitular && asociado.motivoBaja?.startsWith("Baja voluntaria");

              return (
                <div
                  key={asociado.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 bg-gray-50/50 hover:bg-gray-100/60 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-700">
                        {asociado.nombre} {asociado.apellido}
                      </p>
                      <StatusBadge label={esTitular ? "Inactivo" : "Baja Registrada"} tone="neutral" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      <span className="font-medium">{asociado.parentesco}</span>
                      {asociado.dni ? ` • DNI ${asociado.dni}` : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="rounded bg-rose-50 border border-rose-200 px-2 py-0.5 font-medium text-rose-700">
                        Motivo: {motivoMostrar}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">
                        Fecha de egreso: {fechaBajaFormateada}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-2 text-xs text-gray-400">
                    {puedeReactivar ? (
                      <button
                        type="button"
                        onClick={() => {
                          setAsociadoParaReactivar(asociado);
                          setErrorReactivar(null);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-sm"
                      >
                        <UserCheck size={14} />
                        Reactivar integrante
                      </button>
                    ) : (
                      <>
                        <p>Datos históricos protegidos</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">No afecta al titular ni al resto del grupo</p>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODAL PARA REGISTRAR MOTIVO DE BAJA */}
      {asociadoParaBaja && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => !enviando && setAsociadoParaBaja(null)}
        >
          <div
            className="card w-full max-w-md space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  Registrar baja / egreso de integrante
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Estás por registrar la baja de{" "}
                  <strong>
                    {asociadoParaBaja.nombre} {asociadoParaBaja.apellido}
                  </strong>{" "}
                  ({asociadoParaBaja.parentesco}).
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 leading-relaxed">
              <strong>Importante:</strong> Esta baja afecta <u>únicamente</u> a este familiar. El socio titular y el resto de los integrantes del grupo continúan activos con normalidad. Sus datos quedan archivados en el histórico.
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Motivo de la baja o egreso *
              </label>
              <select
                value={motivoBaja}
                onChange={(e) => setMotivoBaja(e.target.value)}
                className="input text-sm"
                disabled={enviando}
              >
                <option value="Baja voluntaria">Baja voluntaria</option>
                <option value="Fallecimiento">Fallecimiento</option>
                <option value="OTRO">Otro motivo</option>
              </select>

              {motivoBaja === "OTRO" && (
                <input
                  type="text"
                  placeholder="Detalle el motivo del egreso"
                  value={otroMotivo}
                  onChange={(e) => setOtroMotivo(e.target.value)}
                  className="input mt-2 text-sm"
                  disabled={enviando}
                  autoFocus
                />
              )}
            </div>

            {errorBaja && (
              <p className="rounded bg-rose-50 border border-rose-200 p-2 text-xs text-rose-600">
                {errorBaja}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                onClick={() => setAsociadoParaBaja(null)}
                disabled={enviando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
                onClick={confirmarBaja}
                disabled={enviando}
              >
                {enviando ? "Registrando..." : "Confirmar Baja"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PARA CONFIRMAR REACTIVACIÓN */}
      {asociadoParaReactivar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => !enviando && setAsociadoParaReactivar(null)}
        >
          <div
            className="card w-full max-w-md space-y-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <UserCheck size={22} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">
                  Reactivar integrante
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Estás por reactivar a{" "}
                  <strong>
                    {asociadoParaReactivar.nombre} {asociadoParaReactivar.apellido}
                  </strong>{" "}
                  ({asociadoParaReactivar.parentesco}).
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 leading-relaxed">
              El integrante volverá a figurar en la lista de <strong>Integrantes Activos</strong> conservando todos los datos que ya tenía registrados (DNI, parentesco, contacto y fecha de nacimiento).
            </div>

            {errorReactivar && (
              <p className="rounded bg-rose-50 border border-rose-200 p-2 text-xs text-rose-600">
                {errorReactivar}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                onClick={() => setAsociadoParaReactivar(null)}
                disabled={enviando}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                onClick={confirmarReactivacion}
                disabled={enviando}
              >
                {enviando ? "Reactivando..." : "Confirmar Reactivación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
