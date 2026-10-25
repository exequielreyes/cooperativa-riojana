"use client";

import Image from "next/image";
import { Printer, Download } from "lucide-react";
import { descargarTalonarioComoImagen } from "@/lib/descargarTalonarioImagen";

export interface TalonarioData {
  id: string;
  numero: string;
  mes: number;
  anio: number;
  periodo: string;
  concepto: string;
  monto: number | string;
  fechaEmision: string | Date;
  socio: {
    nombre: string;
    apellido: string;
    idCooperativa: string;
    area?: string;
  };
}

export function TalonarioItem({
  talonario,
  onPrintSingle,
}: {
  talonario: TalonarioData;
  onPrintSingle?: (talonario: TalonarioData) => void;
}) {
  const mesStr = String(talonario.mes).padStart(2, "0");
  const anioStr = String(talonario.anio).slice(-2);
  const nombreCompleto = `${talonario.socio.nombre} ${talonario.socio.apellido}`;

  return (
    <div className="relative flex flex-col justify-between border-2 border-dashed border-gray-600 bg-white p-3 text-slate-900 shadow-sm print:border-black print:p-2.5 print:shadow-none break-inside-avoid">
      {/* Botones de acción individual en pantalla */}
      <div className="no-print absolute -top-2.5 -right-2.5 flex items-center gap-1">
        <button
          onClick={() => descargarTalonarioComoImagen(talonario)}
          title="Descargar este cupón como imagen (PNG)"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white shadow hover:bg-emerald-700 transition-colors"
        >
          <Download size={13} />
        </button>
        {onPrintSingle && (
          <button
            onClick={() => onPrintSingle(talonario)}
            title="Imprimir solo este cupón"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white shadow hover:bg-primary-dark transition-colors"
          >
            <Printer size={13} />
          </button>
        )}
      </div>

      {/* Cabecera del cupón: Logo/Matrícula | Servicio/Tel | Mes y Año */}
      <div className="flex items-start justify-between gap-1 border-b border-gray-300 pb-2">
        {/* Logo / Matrícula */}
        <div className="flex flex-col items-center text-center w-20 flex-shrink-0">
          <div className="relative h-9 w-12">
            <Image
              src="/logo_nuevo_2.png"
              alt="Cooperativa Riojana"
              fill
              className="object-contain grayscale contrast-125"
            />
          </div>
          <p className="mt-0.5 text-[8px] font-bold uppercase leading-tight text-slate-950">
            Cooperativa Riojana <span className="font-normal text-[7px]">Ltda.</span>
          </p>
          <p className="text-[7px] font-semibold text-slate-800 leading-tight">
            MATRICULA Nº 7346
          </p>
        </div>

        {/* Servicio y Teléfonos */}
        <div className="flex flex-1 flex-col justify-center text-center px-1">
          <p className="text-[12px] font-black uppercase tracking-wider text-slate-950 leading-tight">
            {talonario.concepto || (talonario.socio?.area === "CONSUMO" ? "SERVICIO DE CONSUMO" : "SERVICIO DE SEPELIO")}
          </p>
          <p className="mt-0.5 text-[8.5px] font-semibold text-slate-800 leading-tight">
            Tel: (0380) 4422089
          </p>
          <p className="text-[8.5px] font-semibold text-slate-800 leading-tight">
            4423238
          </p>
        </div>

        {/* Mes y Año gigantes apilados */}
        <div className="flex flex-col items-center justify-center pl-1 leading-none text-slate-950">
          <span className="text-3xl font-black tracking-tight leading-none">
            {mesStr}
          </span>
          <span className="text-3xl font-black tracking-tight leading-none mt-0.5">
            {anioStr}
          </span>
        </div>
      </div>

      {/* Cuerpo: Nombre y Apellido */}
      <div className="my-2 space-y-1">
        <div className="text-[11px] leading-snug">
          <span className="font-semibold text-slate-800">Nombre y Apellido: </span>
          <span className="font-bold uppercase text-slate-950 underline decoration-dotted underline-offset-4">
            {nombreCompleto}
          </span>
        </div>
      </div>

      {/* Pie: Nº Socio | Administración | Celular */}
      <div className="border-t border-dotted border-gray-300 pt-1.5 text-[9.5px] leading-tight text-slate-800">
        <p className="mb-0.5">
          <span className="font-semibold">Nº Socio: </span>
          <span className="font-bold text-slate-950">{talonario.socio.idCooperativa}</span>
        </p>
        <div className="flex flex-wrap items-center justify-between text-[8.5px] text-slate-700">
          <p>
            <span className="font-medium">Administración:</span> Dorrego 63
          </p>
          <p>
            <span className="font-medium">Cel:</span> 3804 941794
          </p>
        </div>
      </div>

      {/* Botones inferiores en pantalla para mayor claridad */}
      <div className="no-print mt-2 flex items-center justify-end gap-1.5 border-t border-gray-100 pt-1.5">
        <button
          onClick={() => descargarTalonarioComoImagen(talonario)}
          className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
          title="Descargar cupón como imagen PNG"
        >
          <Download size={11} className="text-emerald-600" />
          <span>Descargar Imagen</span>
        </button>
        {onPrintSingle && (
          <button
            onClick={() => onPrintSingle(talonario)}
            className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
            title="Imprimir solo este cupón"
          >
            <Printer size={11} className="text-primary" />
            <span>Imprimir</span>
          </button>
        )}
      </div>
    </div>
  );
}
