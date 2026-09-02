"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

type Notificacion = {
  id: string;
  titulo: string;
  mensaje: string;
  link?: string;
  leida: boolean;
  createdAt: string;
};

export function CampanaNotificaciones() {
  const [abierto, setAbierto] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/notificaciones")
      .then((res) => {
        if (res.ok) return res.json();
        return [];
      })
      .then((data) => setNotificaciones(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  async function marcarLeidas() {
    if (noLeidas === 0) return;
    await fetch("/api/notificaciones/leidas", { method: "PATCH" });
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
  }

  function handleOpen() {
    setAbierto((v) => !v);
    if (!abierto) {
      marcarLeidas();
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleOpen}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-gray-500 hover:bg-surface-muted hover:text-primary transition-colors"
      >
        <Bell size={20} />
        {noLeidas > 0 && (
          <span className="absolute right-2 top-2 flex h-2 w-2 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"></span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-card border border-surface-border bg-white shadow-lg z-50">
          <div className="border-b border-surface-border px-4 py-3 flex justify-between items-center">
            <p className="text-sm font-semibold text-primary-dark">Notificaciones</p>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notificaciones.length === 0 ? (
              <p className="p-4 text-sm text-gray-500 text-center">No tenés notificaciones recientes.</p>
            ) : (
              notificaciones.map((n) => (
                <Link
                  key={n.id}
                  href={n.link || "#"}
                  onClick={() => setAbierto(false)}
                  className={`block border-b border-surface-border px-4 py-3 hover:bg-surface-muted transition-colors ${
                    !n.leida ? "bg-indigo-50/50" : ""
                  }`}
                >
                  <p className="text-sm font-medium text-slate-800">{n.titulo}</p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">{n.mensaje}</p>
                  <p className="text-[10px] text-gray-400 mt-2">{formatDate(new Date(n.createdAt))}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}