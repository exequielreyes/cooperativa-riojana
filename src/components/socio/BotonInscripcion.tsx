"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BotonInscripcion({ tallerId, esPago, precioFinal }: { tallerId: string, esPago?: boolean, precioFinal?: number }) {
  const router = useRouter();
  const [estado, setEstado] = useState<"idle" | "enviando" | "ok" | "error">("idle");
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [comprobante, setComprobante] = useState<File | null>(null);

  async function inscribirse() {
    if (esPago && !comprobante) {
      setMensaje("Por favor, subí el comprobante de pago para inscribirte.");
      setEstado("error");
      return;
    }

    setEstado("enviando");
    const formData = new FormData();
    if (comprobante) {
      formData.append("comprobante", comprobante);
    }

    const res = await fetch(`/api/talleres/${tallerId}/inscripcion`, { 
      method: "POST",
      body: formData 
    });

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
      {esPago && (
        <div className="mb-4">
          <label className="mb-2 block text-xs font-medium text-gray-500">
            Comprobante de pago (por ${precioFinal?.toLocaleString("es-AR")})
          </label>
          <input
            type="file"
            accept="image/jpeg, image/png, application/pdf"
            onChange={(e) => setComprobante(e.target.files?.[0] || null)}
            className="w-full text-sm text-slate-500 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-gray-200 border rounded-md"
          />
        </div>
      )}
      <button className="btn-primary w-full" onClick={inscribirse} disabled={estado === "enviando"}>
        {estado === "enviando" ? "Inscribiendo..." : "Inscribirme Ahora"}
      </button>
      {mensaje && <p className="mt-2 text-xs text-status-danger">{mensaje}</p>}
    </div>
  );
}
