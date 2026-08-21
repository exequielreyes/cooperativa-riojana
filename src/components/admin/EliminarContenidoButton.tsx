"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function EliminarContenidoButton({
  tallerId,
  contenidoId,
}: {
  tallerId: string;
  contenidoId: string;
}) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  async function eliminar() {
    if (!confirm("¿Eliminar este contenido del taller?")) return;
    setCargando(true);

    const res = await fetch(`/api/talleres/${tallerId}/contenidos/${contenidoId}`, {
      method: "DELETE",
    });

    setCargando(false);

    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <button
      onClick={eliminar}
      disabled={cargando}
      aria-label="Eliminar contenido"
      className="text-gray-300 transition-colors hover:text-status-danger disabled:opacity-50"
    >
      <Trash2 size={16} />
    </button>
  );
}
