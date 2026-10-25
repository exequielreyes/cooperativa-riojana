import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GrupoFamiliarManager } from "@/components/socio/GrupoFamiliarManager";
import { VolverAlPanel } from "@/components/socio/VolverAlPanel";

export default async function GrupoFamiliarPage() {
  const session = await getServerSession(authOptions);
  const socioId = session!.user.socioId!;

  const [asociados, socio] = await Promise.all([
    prisma.grupoFamiliar.findMany({
      where: { socioId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.socio.findUnique({
      where: { id: socioId },
      select: { area: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <VolverAlPanel />
      <h1 className="mb-6 text-2xl font-semibold text-primary-dark">Grupo Familiar</h1>

      {socio?.area === "CONSUMO" ? (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-900 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-800">
              ℹ
            </span>
            <div>
              <p className="font-semibold text-amber-900">
                Área Consumo · Cobertura y Operaciones Exclusivas del Titular
              </p>
              <p className="mt-1 text-xs text-amber-800 leading-relaxed">
                A diferencia del área de <strong>Sepelio</strong> (que contempla cobertura familiar extendida), el área de <strong>Consumo</strong> no extiende automáticamente sus beneficios, servicios, obligaciones o registros a los familiares del socio. Todas las operaciones se asocian de forma directa al socio titular y se mantienen separadas de las reglas de cobertura familiar.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-emerald-900 shadow-sm">
          <p className="font-semibold text-emerald-950">
            Área Sepelio · Cobertura Familiar
          </p>
          <p className="mt-0.5 text-emerald-800">
            Los integrantes activos de tu grupo familiar cuentan con la cobertura del Servicio de Sepelio de la cooperativa.
          </p>
        </div>
      )}

      <GrupoFamiliarManager
        area={socio?.area}
        asociadosIniciales={asociados.map((a) => ({
          id: a.id,
          nombre: a.nombre,
          apellido: a.apellido,
          dni: a.dni,
          parentesco: a.parentesco,
          email: a.email,
          telefono: a.telefono,
          fechaNacimiento: a.fechaNacimiento ? a.fechaNacimiento.toISOString().split("T")[0] : null,
          activo: a.activo,
          motivoBaja: a.motivoBaja,
          fechaBaja: a.fechaBaja ? a.fechaBaja.toISOString() : null,
        }))}
      />
    </div>
  );
}
