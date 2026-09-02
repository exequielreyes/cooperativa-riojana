import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export default async function ProfesorHomePage() {
  const session = await getServerSession(authOptions);

  const talleres = await prisma.taller.findMany({
    where: { profesorId: session!.user.id },
    include: {
      _count: {
        select: { inscripciones: { where: { estado: "CONFIRMADO" } } },
      },
    },
    orderBy: { fecha: "asc" },
  });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-primary-dark">Mis Talleres</h1>
      <p className="mb-6 text-sm text-gray-500">Talleres que tenés asignados como profesor.</p>

      {talleres.length === 0 ? (
        <div className="card text-sm text-gray-400">
          Todavía no tenés talleres asignados. Pedile al administrador que te asigne uno al crear o editar un taller.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {talleres.map((taller) => (
            <Link
              key={taller.id}
              href={`/profesor/talleres/${taller.id}`}
              className="card block transition hover:shadow-md"
            >
              <p className="font-medium text-primary-dark">{taller.titulo}</p>
              <p className="mt-1 text-xs text-gray-400">
                {formatDate(taller.fecha)} · {taller.categoria}
              </p>
              <p className="mt-3 text-sm text-gray-600">
                {taller._count.inscripciones} / {taller.cuposTotales} inscriptos confirmados
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}