"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Wallet, 
  Receipt, 
  User, 
  Calendar,
  DollarSign,
  TrendingUp,
  Filter
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export interface CuotaCobrador {
  id: string;
  periodo: string;
  concepto: string;
  monto: number;
  fechaVencimiento: string;
  estado: string;
}

export interface SocioCobrador {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  idCooperativa: string;
  region: string | null;
  direccion: string | null;
  barrio: string | null;
  entrecalles: string | null;
  telefono: string | null;
  email: string;
  cuotasPendientes: CuotaCobrador[];
}

export interface CobroRealizado {
  id: string;
  monto: number;
  fechaPago: string;
  metodo: string;
  estadoValidacion: string;
  periodoCuota: string;
  conceptoCuota: string;
  talonarioNumero?: string | null;
  socio: {
    id: string;
    nombre: string;
    apellido: string;
    dni: string;
    idCooperativa: string;
    region: string | null;
  };
}

interface CobradorDashboardProps {
  sociosIniciales: SocioCobrador[];
  cobrosIniciales: CobroRealizado[];
  nombreCobrador: string;
}

const ZONAS_DISPONIBLES = ["Todas", "Zona 2", "Zona 3", "Zona 4", "Zona 5", "Zona 6"];
const PAGE_SIZE = 6;
const PAGE_SIZE_COBROS = 5;

export function CobradorDashboard({
  sociosIniciales,
  cobrosIniciales,
  nombreCobrador,
}: CobradorDashboardProps) {
  const router = useRouter();

  const [socios, setSocios] = useState<SocioCobrador[]>(sociosIniciales);
  const [cobros, setCobros] = useState<CobroRealizado[]>(cobrosIniciales);

  const [busqueda, setBusqueda] = useState("");
  const [zonaFiltro, setZonaFiltro] = useState("Todas");
  const [filtroEstado, setFiltroEstado] = useState<"pendientes" | "todos" | "al_dia">("pendientes");
  const [page, setPage] = useState(1);
  const [pageCobros, setPageCobros] = useState(1);

  // Estado del modal de cobro
  const [cuotaParaCobrar, setCuotaParaCobrar] = useState<{
    cuota: CuotaCobrador;
    socio: SocioCobrador;
  } | null>(null);
  const [procesandoCobro, setProcesandoCobro] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [mensajeError, setMensajeError] = useState<string | null>(null);

  // Auto-cierre del cartel verde de éxito a los 5 segundos
  useEffect(() => {
    if (!mensajeExito) return;
    const timer = setTimeout(() => {
      setMensajeExito(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [mensajeExito]);

  // Resetear a página 1 cuando cambia algún filtro
  useEffect(() => {
    setPage(1);
  }, [zonaFiltro, filtroEstado, busqueda]);

  // Filtrado de socios
  const sociosFiltrados = useMemo(() => {
    return socios.filter((socio) => {
      // Filtro de zona
      if (zonaFiltro !== "Todas") {
        if (socio.region !== zonaFiltro) return false;
      }

      // Filtro de estado
      const tieneDeuda = socio.cuotasPendientes.length > 0;
      if (filtroEstado === "pendientes" && !tieneDeuda) return false;
      if (filtroEstado === "al_dia" && tieneDeuda) return false;

      // Filtro de búsqueda
      if (busqueda.trim() !== "") {
        const q = busqueda.toLowerCase().trim();
        const textoCompleto = `
          ${socio.nombre} ${socio.apellido} ${socio.dni} ${socio.idCooperativa}
          ${socio.direccion || ""} ${socio.barrio || ""} ${socio.telefono || ""}
        `.toLowerCase();
        if (!textoCompleto.includes(q)) return false;
      }

      return true;
    });
  }, [socios, zonaFiltro, filtroEstado, busqueda]);

  // Paginación
  const total = sociosFiltrados.length;
  const totalPaginas = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const paginaActual = Math.min(page, totalPaginas);

  const sociosPaginados = useMemo(() => {
    return sociosFiltrados.slice(
      (paginaActual - 1) * PAGE_SIZE,
      paginaActual * PAGE_SIZE
    );
  }, [sociosFiltrados, paginaActual]);

  // Paginación de cobros (5 por página)
  const totalCobros = cobros.length;
  const totalPaginasCobros = Math.max(1, Math.ceil(totalCobros / PAGE_SIZE_COBROS));
  const paginaActualCobros = Math.min(pageCobros, totalPaginasCobros);

  const cobrosPaginados = useMemo(() => {
    return cobros.slice(
      (paginaActualCobros - 1) * PAGE_SIZE_COBROS,
      paginaActualCobros * PAGE_SIZE_COBROS
    );
  }, [cobros, paginaActualCobros]);

  // Totales
  const totalRecaudado = useMemo(() => {
    return cobros.reduce((acc, c) => acc + Number(c.monto), 0);
  }, [cobros]);

  const totalSociosConDeuda = useMemo(() => {
    return socios.filter((s) => s.cuotasPendientes.length > 0).length;
  }, [socios]);

  // Manejador del cobro en efectivo
  async function confirmarCobro() {
    if (!cuotaParaCobrar) return;

    setProcesandoCobro(true);
    setMensajeError(null);
    setMensajeExito(null);

    const { cuota, socio } = cuotaParaCobrar;

    try {
      const res = await fetch(`/api/cuotas/${cuota.id}/marcar-pagado`, {
        method: "POST",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "No se pudo registrar el cobro en efectivo.");
      }

      const pagoCreado = await res.json();

      // Actualizar estado local inmediatamente
      setSocios((prev) =>
        prev.map((s) => {
          if (s.id !== socio.id) return s;
          return {
            ...s,
            cuotasPendientes: s.cuotasPendientes.filter((c) => c.id !== cuota.id),
          };
        })
      );

      const nuevoCobro: CobroRealizado = {
        id: pagoCreado.id,
        monto: Number(cuota.monto),
        fechaPago: new Date().toISOString(),
        metodo: "EFECTIVO",
        estadoValidacion: "APROBADO",
        periodoCuota: cuota.periodo,
        conceptoCuota: cuota.concepto,
        talonarioNumero: `${socio.idCooperativa}-${cuota.periodo}`,
        socio: {
          id: socio.id,
          nombre: socio.nombre,
          apellido: socio.apellido,
          dni: socio.dni,
          idCooperativa: socio.idCooperativa,
          region: socio.region,
        },
      };

      setCobros((prev) => [nuevoCobro, ...prev]);
      setPageCobros(1);

      setMensajeExito(
        `¡Cobro de ${formatCurrency(Number(cuota.monto))} registrado exitosamente para ${socio.nombre} ${socio.apellido}! El pago ya figura aprobado en todo el sistema.`
      );
      setCuotaParaCobrar(null);

      // Refrescar datos del servidor en segundo plano
      router.refresh();
    } catch (err: any) {
      setMensajeError(err.message || "Error al procesar el cobro.");
    } finally {
      setProcesandoCobro(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* BANNER DE BIENVENIDA */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0f4c4c] to-[#1a7373] p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 px-3 py-0.5 text-xs font-semibold text-emerald-200 border border-emerald-400/30">
                <CheckCircle2 size={13} />
                Cobrador Habilitado
              </span>
              <span className="text-xs text-emerald-100">Zonas 2, 3, 4, 5 y 6</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              ¡Hola, {nombreCobrador}!
            </h1>
            <p className="mt-1 text-sm text-teal-100 max-w-xl">
              Aquí puedes ver a todos los socios de tus zonas asignadas, marcar el cobro de cuotas en efectivo y llevar el control de todo lo recaudado.
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between border-t border-teal-600/40 sm:border-t-0 pt-3 sm:pt-0">
            <p className="text-xs text-teal-200">Total Recaudado por Ti</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-300">
              {formatCurrency(totalRecaudado)}
            </p>
            <p className="text-[11px] text-teal-200">
              {cobros.length} {cobros.length === 1 ? "cobro registrado" : "cobros registrados"}
            </p>
          </div>
        </div>
      </div>

      {/* FEEDBACK MENSAJES (Se cierra solo a los 5 segundos) */}
      {mensajeExito && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 flex items-start justify-between gap-3 shadow-sm transition-all duration-300">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
            <p className="font-medium">{mensajeExito}</p>
          </div>
          <button
            onClick={() => setMensajeExito(null)}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {mensajeError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 flex items-start justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
            <p className="font-medium">{mensajeError}</p>
          </div>
          <button
            onClick={() => setMensajeError(null)}
            className="text-xs font-semibold text-red-700 hover:underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* SECCIÓN 1: SOCIOS A COBRAR */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Socios en tu Recorrido</h2>
            <p className="text-xs text-gray-500">
              Mostrando socios de las Zonas 2, 3, 4, 5 y 6 disponibles para gestión de cobranza.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
            <span className="rounded-lg bg-white border border-gray-200 px-3 py-1.5 shadow-sm">
              {totalSociosConDeuda} socios con deuda pendiente
            </span>
          </div>
        </div>

        {/* FILTROS Y BÚSQUEDA */}
        <div className="card space-y-4 p-4 sm:p-5">
          {/* Fila 1: Selector de Zonas */}
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">
              Filtrar por Zona Asignada:
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {ZONAS_DISPONIBLES.map((zona) => {
                const activo = zonaFiltro === zona;
                return (
                  <button
                    key={zona}
                    type="button"
                    onClick={() => setZonaFiltro(zona)}
                    className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-colors ${
                      activo
                        ? "bg-primary text-white shadow"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {zona}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fila 2: Búsqueda y Estado */}
          <div className="grid gap-3 sm:grid-cols-3 pt-2 border-t border-gray-100">
            {/* Buscador */}
            <div className="sm:col-span-2 relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por Nombre, DNI, N° de Socio, Calle o Barrio..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 hover:text-gray-600"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Filtro de estado */}
            <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50/50 p-1">
              <button
                type="button"
                onClick={() => setFiltroEstado("pendientes")}
                className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
                  filtroEstado === "pendientes"
                    ? "bg-white text-status-danger shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Con Deuda
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado("al_dia")}
                className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
                  filtroEstado === "al_dia"
                    ? "bg-white text-status-success shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Al Día
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado("todos")}
                className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition ${
                  filtroEstado === "todos"
                    ? "bg-white text-primary shadow-sm"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                Todos ({socios.length})
              </button>
            </div>
          </div>
        </div>

        {/* LISTADO DE SOCIOS (Paginado a 6 por página) */}
        {sociosFiltrados.length === 0 ? (
          <div className="card text-center py-12 px-6">
            <User size={36} className="mx-auto text-gray-300 mb-3" />
            <p className="text-base font-semibold text-gray-700">No se encontraron socios</p>
            <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
              {busqueda
                ? "No hay resultados que coincidan con los términos de búsqueda."
                : "No hay socios para los filtros seleccionados."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4">
              {sociosPaginados.map((socio) => {
                const tieneDeuda = socio.cuotasPendientes.length > 0;
                const totalDeudaSocio = socio.cuotasPendientes.reduce(
                  (acc, c) => acc + Number(c.monto),
                  0
                );

                return (
                  <div
                    key={socio.id}
                    className={`card p-5 transition-shadow hover:shadow-md ${
                      tieneDeuda ? "border-l-4 border-l-amber-500" : "border-l-4 border-l-emerald-500"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Información del Socio */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-gray-900">
                            {socio.apellido} {socio.nombre}
                          </h3>
                          <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                            {socio.idCooperativa}
                          </span>
                          {socio.region && (
                            <span className="rounded-md bg-teal-50 border border-teal-200 px-2 py-0.5 text-xs font-semibold text-teal-800">
                              {socio.region}
                            </span>
                          )}
                          <StatusBadge
                            label={tieneDeuda ? `Debe ${formatCurrency(totalDeudaSocio)}` : "Al Día"}
                            tone={tieneDeuda ? "danger" : "success"}
                          />
                        </div>

                        {/* Datos de contacto y ubicación */}
                        <div className="grid gap-1 sm:grid-cols-2 text-xs text-gray-600 pt-1">
                          <div className="flex items-center gap-1.5">
                            <User size={13} className="text-gray-400 shrink-0" />
                            <span>DNI: {socio.dni || "—"}</span>
                          </div>

                          {socio.telefono ? (
                            <div className="flex items-center gap-1.5">
                              <Phone size={13} className="text-gray-400 shrink-0" />
                              <a
                                href={`tel:${socio.telefono}`}
                                className="font-medium text-primary hover:underline"
                              >
                                {socio.telefono}
                              </a>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <Phone size={13} className="shrink-0" />
                              <span>Sin teléfono</span>
                            </div>
                          )}

                          <div className="flex items-start gap-1.5 sm:col-span-2">
                            <MapPin size={13} className="text-gray-400 shrink-0 mt-0.5" />
                            <span>
                              {socio.direccion || "Domicilio sin registrar"}
                              {socio.barrio ? ` · B° ${socio.barrio}` : ""}
                              {socio.entrecalles ? ` (Entre: ${socio.entrecalles})` : ""}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Cuotas pendientes y Acción de cobro */}
                      <div className="lg:w-80 border-t lg:border-t-0 lg:border-l border-gray-100 pt-3 lg:pt-0 lg:pl-5 space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                          {tieneDeuda ? "Cuotas a Cobrar:" : "Estado de Cuenta:"}
                        </p>

                        {!tieneDeuda ? (
                          <div className="rounded-xl bg-emerald-50/60 p-3 text-xs text-emerald-800 flex items-center gap-2">
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                            <span>Socio al día. No registra cuotas vencidas ni pendientes.</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {socio.cuotasPendientes.map((cuota) => {
                              const fv = new Date(cuota.fechaVencimiento);
                              const hoy = new Date();
                              const fvMidnight = new Date(fv.getFullYear(), fv.getMonth(), fv.getDate()).getTime();
                              const hoyMidnight = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate()).getTime();
                              const diffDays = Math.round((fvMidnight - hoyMidnight) / (1000 * 60 * 60 * 24));

                              const esVencida = cuota.estado === "VENCIDO" || diffDays < 0;
                              const esPorVencer = !esVencida && diffDays <= 3;

                              return (
                              <div
                                key={cuota.id}
                                className={`flex items-center justify-between gap-2 rounded-xl border p-2.5 transition ${
                                  esVencida
                                    ? "border-red-200 bg-red-50/40 hover:bg-red-50"
                                    : esPorVencer
                                    ? "border-amber-200 bg-amber-50/40 hover:bg-amber-50"
                                    : "border-gray-200 bg-gray-50/40 hover:bg-gray-100/50"
                                }`}
                              >
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <p className={`text-xs font-bold ${
                                      esVencida ? "text-red-900" : esPorVencer ? "text-amber-900" : "text-gray-900"
                                    }`}>
                                      {cuota.periodo}
                                    </p>
                                    {esVencida && (
                                      <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-status-danger">
                                        Vencida
                                      </span>
                                    )}
                                    {esPorVencer && (
                                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                                        {diffDays === 0 ? "Vence hoy" : `Por vencer (${diffDays}d)`}
                                      </span>
                                    )}
                                  </div>
                                  <p className={`text-[11px] font-semibold ${
                                    esVencida ? "text-status-danger" : esPorVencer ? "text-amber-700" : "text-gray-700"
                                  }`}>
                                    {formatCurrency(Number(cuota.monto))}
                                  </p>
                                  <p className="text-[10px] text-gray-500">
                                    Vence: {formatDate(cuota.fechaVencimiento)}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setCuotaParaCobrar({ cuota, socio })}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white shadow transition hover:bg-emerald-800"
                                >
                                  <DollarSign size={13} />
                                  Cobrar Efectivo
                                </button>
                              </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINACIÓN OFICIAL DEL SISTEMA (6 por página) */}
            {total > 0 && (
              <div className="flex flex-col items-center justify-between gap-4 border-t border-surface-border pt-4 sm:flex-row">
                <span className="text-sm text-gray-500">
                  Mostrando {(paginaActual - 1) * PAGE_SIZE + 1}-{Math.min(paginaActual * PAGE_SIZE, total)} de {total} socios
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
        )}
      </div>

      {/* SECCIÓN 2: LO QUE YA COBRÓ (HISTORIAL DE COBROS DEL COBRADOR) */}
      <div className="space-y-4 pt-6 border-t-2 border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Receipt size={20} className="text-primary" />
              <h2 className="text-xl font-bold text-gray-900">Cobros que Ya Realizaste</h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Historial de pagos en efectivo recibidos y validados bajo tu cuenta de cobrador. Se reflejan en tiempo real para el administrador y el socio.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white border border-gray-200 px-4 py-2 text-right shadow-sm">
              <p className="text-[11px] font-medium text-gray-500">Recaudación Total</p>
              <p className="text-lg font-black text-emerald-700">
                {formatCurrency(totalRecaudado)}
              </p>
            </div>
          </div>
        </div>

        {cobros.length === 0 ? (
          <div className="card text-center py-10 px-6">
            <Receipt size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-semibold text-gray-700">
              Todavía no registraste cobros en efectivo
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Cuando utilices el botón "Cobrar Efectivo" en cualquier socio, el comprobante y registro aparecerán aquí inmediatamente.
            </p>
          </div>
        ) : (
          <div className="card p-0 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-surface-border text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-3.5">Fecha y Hora</th>
                    <th className="px-5 py-3.5">Socio</th>
                    <th className="px-5 py-3.5">Zona</th>
                    <th className="px-5 py-3.5">Período Cobrado</th>
                    <th className="px-5 py-3.5">Monto</th>
                    <th className="px-5 py-3.5">Método</th>
                    <th className="px-5 py-3.5">Estado en Sistema</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {cobrosPaginados.map((cobro) => (
                    <tr
                      key={cobro.id}
                      className="transition-colors hover:bg-gray-50/60"
                    >
                      <td className="px-5 py-3.5 text-xs text-gray-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-gray-400" />
                          <span>
                            {new Date(cobro.fechaPago).toLocaleDateString("es-AR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-gray-400 text-[11px]">
                            {new Date(cobro.fechaPago).toLocaleTimeString("es-AR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <p className="font-bold text-gray-900 text-xs">
                          {cobro.socio.apellido} {cobro.socio.nombre}
                        </p>
                        <p className="text-[11px] text-gray-500">
                          {cobro.socio.idCooperativa} {cobro.socio.dni ? `· DNI ${cobro.socio.dni}` : ""}
                        </p>
                      </td>

                      <td className="px-5 py-3.5 text-xs">
                        <span className="rounded-md bg-teal-50 border border-teal-200 px-2 py-0.5 text-[11px] font-semibold text-teal-800">
                          {cobro.socio.region || "Zona"}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-xs">
                        <span className="font-semibold text-gray-800">{cobro.periodoCuota}</span>
                        {cobro.talonarioNumero && (
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Recibo: {cobro.talonarioNumero}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap font-bold text-emerald-700">
                        {formatCurrency(Number(cobro.monto))}
                      </td>

                      <td className="px-5 py-3.5 text-xs">
                        <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                          Efectivo
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-xs whitespace-nowrap">
                        <StatusBadge label="Pagado y Aprobado" tone="success" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINACIÓN OFICIAL DE COBROS (5 por página) */}
            {totalCobros > 0 && (
              <div className="flex flex-col items-center justify-between gap-4 border-t border-surface-border p-4 sm:flex-row bg-white">
                <span className="text-sm text-gray-500">
                  Mostrando {(paginaActualCobros - 1) * PAGE_SIZE_COBROS + 1}-{Math.min(paginaActualCobros * PAGE_SIZE_COBROS, totalCobros)} de {totalCobros} cobros
                </span>
                <nav aria-label="Paginación de cobros" className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPageCobros(Math.max(1, paginaActualCobros - 1))}
                    disabled={paginaActualCobros === 1}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border text-gray-500 transition-colors hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-40"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  </button>

                  {(() => {
                    const delta = 1;
                    const range: (number | "...")[] = [];
                    const start = Math.max(2, paginaActualCobros - delta);
                    const end = Math.min(totalPaginasCobros - 1, paginaActualCobros + delta);

                    range.push(1);
                    if (start > 2) range.push("...");
                    for (let i = start; i <= end; i++) range.push(i);
                    if (end < totalPaginasCobros - 1) range.push("...");
                    if (totalPaginasCobros > 1) range.push(totalPaginasCobros);

                    return range.map((p, idx) =>
                      p === "..." ? (
                        <span key={`dots-cobros-${idx}`} className="px-1 text-sm text-gray-400">
                          …
                        </span>
                      ) : (
                        <button
                          type="button"
                          key={p}
                          onClick={() => setPageCobros(p as number)}
                          aria-current={p === paginaActualCobros ? "page" : undefined}
                          className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                            p === paginaActualCobros
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
                    onClick={() => setPageCobros(Math.min(totalPaginasCobros, paginaActualCobros + 1))}
                    disabled={paginaActualCobros === totalPaginasCobros}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-border text-gray-500 transition-colors hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-40"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                  </button>
                </nav>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL DE CONFIRMACIÓN DE COBRO */}
      {cuotaParaCobrar && (
        <ConfirmModal
          open={Boolean(cuotaParaCobrar)}
          title="¿Confirmar cobro en efectivo?"
          description={`Estás por registrar el cobro de ${formatCurrency(Number(cuotaParaCobrar.cuota.monto))} correspondiente al período "${cuotaParaCobrar.cuota.periodo}" para el socio ${cuotaParaCobrar.socio.nombre} ${cuotaParaCobrar.socio.apellido} (${cuotaParaCobrar.socio.idCooperativa}). El socio quedará registrado como pagado inmediatamente.`}
          confirmLabel={procesandoCobro ? "Procesando cobro..." : "Sí, confirmar cobro en efectivo"}
          loading={procesandoCobro}
          onConfirm={confirmarCobro}
          onCancel={() => {
            if (!procesandoCobro) setCuotaParaCobrar(null);
          }}
        />
      )}
    </div>
  );
}
