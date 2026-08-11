import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TicketModal } from "@/components/socio/TicketModal";
import { CancelarInscripcionButton } from "@/components/socio/CancelarInscripcionButton";
import { VolverAlPanel } from "@/components/socio/VolverAlPanel";
import { formatDate } from "@/lib/utils";

const DOS_DIAS_MS = 2 * 24 * 60 * 60 * 1000;

export default async function MisTalleresPage() {
  const session = await getServerSession(authOptions);
  const socioId = session!.user.socioId!;

  const [socio, inscripciones] = await Promise.all([
    prisma.socio.findUnique({ where: { id: socioId } }),
    prisma.inscripcionTaller.findMany({
      where: { socioId },
      include: { taller: true },
      orderBy: { fechaInscripcion: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <VolverAlPanel />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-primary-dark">Talleres</h1>
          <p className="text-sm text-gray-500">Gestiona tus capacitaciones activas y revisa el estado de tus inscripciones.</p>
        </div>
        <a href="/talleres" className="btn-primary">
          Inscribirse a Nuevo Taller
        </a>
      </div>

      {inscripciones.length === 0 && (
        <p className="card text-sm text-gray-400">Todavía no te inscribiste a ningún taller.</p>
      )}

      <div className="space-y-4">
        {inscripciones.map((inscripcion) => {
          const dentroDePlazo =
            Date.now() - inscripcion.fechaInscripcion.getTime() <= DOS_DIAS_MS;
          const puedeCancelar = inscripcion.estado !== "CANCELADO" && dentroDePlazo;

          return (
            <div key={inscripcion.id} className="card flex items-start justify-between gap-4">
              <div>
                <StatusBadge
                  label={
                    inscripcion.estado === "CONFIRMADO"
                      ? "Confirmado"
                      : inscripcion.estado === "CANCELADO"
                      ? "Cancelado"
                      : "Pendiente"
                  }
                  tone={
                    inscripcion.estado === "CONFIRMADO"
                      ? "success"
                      : inscripcion.estado === "CANCELADO"
                      ? "danger"
                      : "warning"
                  }
                />
                <p className="mt-2 font-medium text-primary-dark">{inscripcion.taller.titulo}</p>
                <p className="text-xs text-gray-400">
                  {formatDate(inscripcion.taller.fecha)} · {inscripcion.taller.horaInicio} hs · {inscripcion.taller.ubicacion ?? "A confirmar"}
                </p>
              </div>

              <div className="flex flex-shrink-0 flex-col items-end gap-2">
                <div className="flex gap-2">
                  {inscripcion.taller.materialUrl && (
                    <a
                      href={inscripcion.taller.materialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                    >
                      Ver Material
                    </a>
                  )}
                  {inscripcion.estado !== "CANCELADO" ? (
                    <TicketModal
                      ticket={{
                        tallerTitulo: inscripcion.taller.titulo,
                        fecha: formatDate(inscripcion.taller.fecha),
                        horaInicio: inscripcion.taller.horaInicio,
                        ubicacion: inscripcion.taller.ubicacion,
                        nombreSocio: `${socio?.nombre} ${socio?.apellido}`,
                        idCooperativa: socio?.idCooperativa ?? "-",
                        codigoTicket: inscripcion.id.slice(-8).toUpperCase(),
                      }}
                    />
                  ) : (
                    <button className="btn-secondary cursor-not-allowed opacity-60" disabled>
                      Inscripción cancelada
                    </button>
                  )}
                </div>
                {puedeCancelar && <CancelarInscripcionButton inscripcionId={inscripcion.id} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
