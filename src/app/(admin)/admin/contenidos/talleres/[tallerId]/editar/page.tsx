import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { EditarTallerForm } from "@/components/admin/EditarTallerForm";

export default async function EditarTallerPage({ params }: { params: { tallerId: string } }) {
  const taller = await prisma.taller.findUnique({
    where: { id: params.tallerId },
  });

  if (!taller) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-semibold text-primary-dark">Editar Taller</h1>
      <EditarTallerForm
        taller={{
          id: taller.id,
          titulo: taller.titulo,
          descripcion: taller.descripcion,
          categoria: taller.categoria,
          instructor: taller.instructor,
          profesorId: taller.profesorId,
          ubicacion: taller.ubicacion,
          modalidad: taller.modalidad,
          fecha: taller.fecha.toISOString().split("T")[0],
          horaInicio: taller.horaInicio,
          horaFin: taller.horaFin,
          cuposTotales: taller.cuposTotales,
          requisitos: taller.requisitos,
          materialUrl: taller.materialUrl,
          esPago: taller.esPago,
          precio: taller.precio ? Number(taller.precio) : null,
          descuento: taller.descuento,
        }}
      />
    </div>
  );
}
