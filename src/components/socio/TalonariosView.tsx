"use client";

import { useState } from "react";
import Image from "next/image";
import { Printer, Download, Calendar, Ticket, Info, CheckCircle2 } from "lucide-react";
import { TalonarioItem, TalonarioData } from "./TalonarioItem";
import { descargarTalonarioComoImagen } from "@/lib/descargarTalonarioImagen";

interface TalonariosViewProps {
  socio: {
    nombre: string;
    apellido: string;
    idCooperativa: string;
  };
  talonarios: TalonarioData[];
}

export function TalonariosView({ socio, talonarios }: TalonariosViewProps) {
  // Obtener años únicos disponibles
  const aniosDisponibles = Array.from(
    new Set(talonarios.map((t) => t.anio))
  ).sort((a, b) => b - a);

  const anioActual = aniosDisponibles[0] || new Date().getFullYear();
  const [anioSeleccionado, setAnioSeleccionado] = useState<number>(anioActual);
  const [cuponParaImprimir, setCuponParaImprimir] = useState<TalonarioData | null>(null);

  const talonariosFiltrados = talonarios.filter((t) => t.anio === anioSeleccionado);

  const nombreCompleto = `${socio.nombre} ${socio.apellido}`;

  function handleImprimirPlanilla() {
    setCuponParaImprimir(null);
    setTimeout(() => {
      window.print();
    }, 100);
  }

  function handleImprimirIndividual(talonario: TalonarioData) {
    setCuponParaImprimir(talonario);
    setTimeout(() => {
      window.print();
    }, 100);
  }

  return (
    <div>
      {/* Controles de cabecera en pantalla (no se imprimen) */}
      <div className="no-print mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary-dark">Talonarios Oficiales</h1>
          <p className="text-sm text-gray-500">
            Cupones correspondientes a tus períodos abonados del Servicio de Sepelio.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {aniosDisponibles.length > 1 && (
            <div className="flex items-center gap-2 rounded-lg border border-surface-border bg-white px-3 py-1.5 text-sm shadow-sm">
              <Calendar size={16} className="text-gray-400" />
              <span className="text-xs text-gray-500">Año:</span>
              <select
                value={anioSeleccionado}
                onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
                className="bg-transparent font-medium text-primary-dark outline-none cursor-pointer"
              >
                {aniosDisponibles.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          )}

          {talonariosFiltrados.length > 0 && (
            <button
              onClick={handleImprimirPlanilla}
              className="btn-primary flex items-center gap-2 shadow-sm"
            >
              <Printer size={16} />
              <span>Imprimir / Descargar Planilla</span>
            </button>
          )}
        </div>
      </div>

      {talonarios.length === 0 ? (
        <div className="no-print card flex flex-col items-center justify-center py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-primary mb-4">
            <Ticket size={28} />
          </div>
          <h3 className="text-lg font-semibold text-primary-dark">Aún no tienes talonarios generados</h3>
          <p className="max-w-md text-sm text-gray-500 mt-1">
            Los talonarios se generan automáticamente cada vez que el administrador aprueba el pago de tus cuotas sociales.
          </p>
        </div>
      ) : (
        <>
          {/* Alerta explicativa en pantalla */}
          <div className="no-print mb-6 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900">
            <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Información del Talonario Digital</p>
              <p className="text-blue-800 mt-0.5 leading-relaxed">
                Cada vez que se aprueba el pago de una o varias cuotas, se emite un cupón por cada mes abonado. Podés imprimir la planilla completa en formato A4 o imprimir cada cupón individualmente utilizando el botón de la esquina de cada uno.
              </p>
            </div>
          </div>

          {/* CONTENEDOR IMPRIMIBLE (Planilla o Cupón individual) */}
          <div
            id="talonario-imprimible"
            className="rounded-xl border border-gray-300 bg-white p-6 shadow-sm print:border-none print:p-0 print:shadow-none"
          >
            {/* Si se eligió imprimir solo un cupón individual */}
            {cuponParaImprimir ? (
              <div className="max-w-md mx-auto my-6">
                <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                  <p className="text-sm font-semibold text-gray-700">Cupón Individual</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => descargarTalonarioComoImagen(cuponParaImprimir)}
                      className="inline-flex items-center gap-1.5 rounded bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors"
                    >
                      <Download size={13} />
                      <span>Descargar Imagen</span>
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="btn-primary text-xs flex items-center gap-1.5 py-1.5 px-3"
                    >
                      <Printer size={13} />
                      <span>Imprimir</span>
                    </button>
                    <button
                      onClick={() => setCuponParaImprimir(null)}
                      className="text-xs text-primary hover:underline ml-2"
                    >
                      ← Volver a planilla
                    </button>
                  </div>
                </div>
                <TalonarioItem talonario={cuponParaImprimir} />
              </div>
            ) : (
              /* Vista Planilla Completa: Cabecera Oficial idéntica a Imagen 1 */
              <div>
                <div className="border-b-2 border-black pb-4 mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Logo institucional */}
                    <div className="flex items-center gap-3">
                      <div className="relative h-14 w-20 flex-shrink-0">
                        <Image
                          src="/logo_nuevo_2.png"
                          alt="Cooperativa Riojana"
                          fill
                          className="object-contain grayscale contrast-125"
                          priority
                        />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-tight text-black">
                          COOPERATIVA RIOJANA <span className="font-semibold text-xs">Ltda.</span>
                        </p>
                        <p className="text-xs font-bold text-gray-800">
                          MATRICULA Nº 7346
                        </p>
                      </div>
                    </div>

                    {/* Título Principal */}
                    <div className="text-center sm:text-right flex-1 sm:pl-6">
                      <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-widest text-black">
                        SERVICIO DE SEPELIO
                      </h2>
                    </div>
                  </div>

                  {/* Datos del Socio estilo planilla */}
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-black">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold whitespace-nowrap">Nombre y apellido:</span>
                      <span className="flex-1 font-bold uppercase border-b border-dotted border-black px-1 pb-0.5">
                        {nombreCompleto}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold whitespace-nowrap">Nº de Socio:</span>
                      <span className="flex-1 font-bold uppercase border-b border-dotted border-black px-1 pb-0.5">
                        {socio.idCooperativa}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grilla de Cupones (3 columnas como en la imagen física) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 print:grid-cols-3 print:gap-2">
                  {talonariosFiltrados.map((t) => (
                    <TalonarioItem
                      key={t.id}
                      talonario={t}
                      onPrintSingle={handleImprimirIndividual}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Reglas de Impresión CSS para formato de cupón/planilla perfecto */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 6mm;
          }
          body {
            background-color: white !important;
            color: black !important;
          }
          /* Ocultar elementos no imprimibles */
          header,
          footer,
          nav,
          .no-print,
          aside,
          button,
          [role="banner"],
          [role="contentinfo"] {
            display: none !important;
          }
          main {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          #talonario-imprimible {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
