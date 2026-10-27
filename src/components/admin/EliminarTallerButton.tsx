"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

export function EliminarTallerButton({
  tallerId,
  titulo,
}: {
  tallerId: string;
  titulo: string;
}) {
  const router = useRouter();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  async function handleConfirmEliminar() {
    setEliminando(true);
    try {
      const res = await fetch(`/api/talleres/${tallerId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || "No se pudo eliminar el taller.");
        return;
      }

      setModalAbierto(false);
      router.refresh();
    } catch (err) {
      alert("Ocurrió un error al intentar eliminar el taller.");
    } finally {
      setEliminando(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setModalAbierto(true)}
        className="text-status-danger hover:underline transition-opacity disabled:opacity-50"
        title="Eliminar taller"
      >
        Eliminar
      </button>

      <ConfirmModal
        open={modalAbierto}
        title="¿Eliminar este taller?"
        description={`Se eliminará permanentemente el taller "${titulo}", junto con todas sus inscripciones y materiales asociados. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar Taller"
        cancelLabel="Cancelar"
        tone="danger"
        loading={eliminando}
        onConfirm={handleConfirmEliminar}
        onCancel={() => !eliminando && setModalAbierto(false)}
      />
    </>
  );
}
