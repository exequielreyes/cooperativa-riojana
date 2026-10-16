import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getTalonariosSocio } from "@/lib/talonarios";
import { VolverAlPanel } from "@/components/socio/VolverAlPanel";
import { TalonariosView } from "@/components/socio/TalonariosView";

export default async function TalonariosPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user.socioId) {
    redirect("/login");
  }

  const socio = await prisma.socio.findUnique({
    where: { id: session.user.socioId },
    select: {
      nombre: true,
      apellido: true,
      idCooperativa: true,
    },
  });

  if (!socio) {
    redirect("/portal");
  }

  // Obtiene los talonarios existentes o sincroniza las cuotas pagadas
  const rawTalonarios = await getTalonariosSocio(session.user.socioId);

  const talonarios = rawTalonarios.map((t) => ({
    id: t.id,
    numero: t.numero,
    mes: t.mes,
    anio: t.anio,
    periodo: t.periodo,
    concepto: t.concepto,
    monto: Number(t.monto),
    fechaEmision: t.fechaEmision.toISOString(),
    socio: {
      nombre: t.socio.nombre,
      apellido: t.socio.apellido,
      idCooperativa: t.socio.idCooperativa,
    },
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
      <VolverAlPanel />
      <TalonariosView socio={socio} talonarios={talonarios} />
    </div>
  );
}
