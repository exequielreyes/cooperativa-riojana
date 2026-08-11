import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GrupoFamiliarManager } from "@/components/socio/GrupoFamiliarManager";
import { VolverAlPanel } from "@/components/socio/VolverAlPanel";

export default async function GrupoFamiliarPage() {
  const session = await getServerSession(authOptions);
  const socioId = session!.user.socioId!;

  const asociados = await prisma.grupoFamiliar.findMany({
    where: { socioId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <VolverAlPanel />
      <h1 className="mb-6 text-2xl font-semibold text-primary-dark">Grupo Familiar</h1>
      <GrupoFamiliarManager
        asociadosIniciales={asociados.map((a) => ({
          id: a.id,
          nombre: a.nombre,
          apellido: a.apellido,
          dni: a.dni,
          parentesco: a.parentesco,
          email: a.email,
          telefono: a.telefono,
        }))}
      />
    </div>
  );
}
