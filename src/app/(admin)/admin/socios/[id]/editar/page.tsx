import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { EditarSocioForm } from "@/components/admin/EditarSocioForm";

export default async function EditarSocioPage({ params }: { params: { id: string } }) {
  const socio = await prisma.socio.findUnique({ where: { id: params.id } });
  if (!socio) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold text-primary-dark">Editar Socio</h1>
      <EditarSocioForm
        socio={{
          id: socio.id,
          nombre: socio.nombre,
          apellido: socio.apellido,
          telefono: socio.telefono ?? "",
          direccion: socio.direccion ?? "",
          region: socio.region ?? "",
          tipoMiembro: socio.tipoMiembro,
          estado: socio.estado,
          idCooperativa: socio.idCooperativa,
          email: socio.email,
          fechaNacimiento: socio.fechaNacimiento ? socio.fechaNacimiento.toISOString().split("T")[0] : "",
        }}
      />
    </div>
  );
}
