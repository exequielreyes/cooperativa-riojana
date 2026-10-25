import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { 
  CobradorDashboard, 
  SocioCobrador, 
  CobroRealizado 
} from "@/components/cobrador/CobradorDashboard";

export const dynamic = "force-dynamic";

const ZONAS_COBRADOR = ["Zona 2", "Zona 3", "Zona 4", "Zona 5", "Zona 6"];

export default async function CobradorPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.rol !== "COBRADOR" && session.user.rol !== "SUPER_ADMIN")) {
    redirect("/login");
  }

  const [sociosRaw, cobrosRaw] = await Promise.all([
    prisma.socio.findMany({
      where: {
        region: { in: ZONAS_COBRADOR },
        estado: "ACTIVO",
      },
      include: {
        cuotas: {
          where: { estado: { in: ["PENDIENTE", "VENCIDO"] } },
          orderBy: { fechaVencimiento: "asc" },
        },
      },
      orderBy: [
        { region: "asc" },
        { apellido: "asc" },
      ],
    }),

    prisma.pago.findMany({
      where: {
        validadoPorId: session.user.id,
        metodo: "EFECTIVO",
      },
      include: {
        socio: true,
        cuota: {
          include: {
            talonario: true,
          },
        },
      },
      orderBy: { fechaPago: "desc" },
      take: 100,
    }),
  ]);

  const socios: SocioCobrador[] = sociosRaw.map((s) => ({
    id: s.id,
    nombre: s.nombre,
    apellido: s.apellido,
    dni: s.dni,
    idCooperativa: s.idCooperativa,
    region: s.region,
    direccion: s.direccion,
    barrio: s.barrio,
    entrecalles: s.entrecalles,
    telefono: s.telefono,
    email: s.email,
    cuotasPendientes: s.cuotas.map((c) => ({
      id: c.id,
      periodo: c.periodo,
      concepto: c.concepto,
      monto: Number(c.monto),
      fechaVencimiento: c.fechaVencimiento.toISOString(),
      estado: c.estado,
    })),
  }));

  const cobros: CobroRealizado[] = cobrosRaw.map((p) => ({
    id: p.id,
    monto: Number(p.monto),
    fechaPago: p.fechaPago.toISOString(),
    metodo: p.metodo,
    estadoValidacion: p.estadoValidacion,
    periodoCuota: p.cuota.periodo,
    conceptoCuota: p.cuota.concepto,
    talonarioNumero: p.cuota.talonario?.numero ?? null,
    socio: {
      id: p.socio.id,
      nombre: p.socio.nombre,
      apellido: p.socio.apellido,
      dni: p.socio.dni,
      idCooperativa: p.socio.idCooperativa,
      region: p.socio.region,
    },
  }));

  const nombreCobrador = session.user.nombre || session.user.email || "Cobrador";

  return (
    <CobradorDashboard
      sociosIniciales={socios}
      cobrosIniciales={cobros}
      nombreCobrador={nombreCobrador}
    />
  );
}
