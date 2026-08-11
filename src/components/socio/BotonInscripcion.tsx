"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BotonInscripcion({ tallerId }: { tallerId: string }) {
  const router = useRouter();
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "error">("idle");
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function inscribirse() {
    setEstado("enviando");
    const res = await fetch(`/api/talleres/${tallerId}/inscripcion`, { method: "POST" });

    if (res.status === 403) {
      router.push("/login");
      return;
    }

    if (!res.ok) {
      const data = await res.json();
      setMensaje(data.error ?? "No se pudo completar la inscripción.");
      setEstado("error");
      return;
    }

    setEstado("ok");
  }

  if (estado === "ok") {
    return <p className="text-sm font-medium text-status-success">¡Inscripción registrada!</p>;
  }

  return (
    <div>
      <button className="btn-primary w-full" onClick={inscribirse} disabled={estado === "enviando"}>
        {estado === "enviando" ? "Inscribiendo..." : "Inscribirme Ahora"}
      </button>
      {mensaje && <p className="mt-2 text-xs text-status-danger">{mensaje}</p>}
    </div>
  );
}
