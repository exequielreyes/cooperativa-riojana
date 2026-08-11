"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BotonPublicarNoticia({ noticiaId, publicada }: { noticiaId: string; publicada: boolean }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  async function toggle() {
    setCargando(true);
    await fetch(`/api/noticias/${noticiaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: publicada ? "DESPUBLICAR" : "PUBLICAR" }),
    });
    setCargando(false);
    router.refresh();
  }

  return (
    <button
      className={`text-xs hover:underline disabled:opacity-50 ${
        publicada ? "text-gray-400" : "text-status-success"
      }`}
      disabled={cargando}
      onClick={toggle}
    >
      {cargando ? "..." : publicada ? "Despublicar" : "Publicar"}
    </button>
  );
}
