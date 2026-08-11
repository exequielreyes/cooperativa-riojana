"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface TicketData {
  tallerTitulo: string;
  fecha: string;
  horaInicio: string;
  ubicacion: string | null;
  nombreSocio: string;
  idCooperativa: string;
  codigoTicket: string;
}

export function TicketModal({ ticket }: { ticket: TicketData }) {
  const [abierto, setAbierto] = useState(false);

  return (
    <>
      <button className="btn-primary" onClick={() => setAbierto(true)}>
        Ver Ticket de Acceso
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setAbierto(false)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-card bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between bg-primary px-5 py-4 text-white">
              <p className="font-medium">Ticket de Acceso</p>
              <button onClick={() => setAbierto(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 px-5 py-6 text-center">
              {/* Placeholder visual de QR: en producción reemplazar por un QR real
                  generado a partir de `ticket.codigoTicket` (ej. librería qrcode) */}
              <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-lg border border-dashed border-surface-border bg-surface-muted text-xs text-gray-400">
                Código QR
                <br />
                {ticket.codigoTicket}
              </div>

              <div>
                <p className="font-medium text-primary-dark">{ticket.tallerTitulo}</p>
                <p className="text-sm text-gray-500">
                  {ticket.fecha} · {ticket.horaInicio} hs
                </p>
                {ticket.ubicacion && <p className="text-sm text-gray-500">{ticket.ubicacion}</p>}
              </div>

              <div className="border-t border-surface-border pt-4 text-sm">
                <p className="text-gray-400">A nombre de</p>
                <p className="font-medium text-primary-dark">{ticket.nombreSocio}</p>
                <p className="text-xs text-gray-400">Socio N° {ticket.idCooperativa}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
