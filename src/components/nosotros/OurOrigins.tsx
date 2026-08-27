import Image from "next/image";

type OurOriginsProps = {
  label: string;
  titulo: string;
  parrafo1: string;
  parrafo2: string;
  parrafo3: string;
  imagenUrl: string | null;
  badgeNumero: string;
  badgeTexto: string;
  hito1Titulo: string;
  hito1Texto: string;
  hito2Titulo: string;
  hito2Texto: string;
};

export function OurOrigins({
  label,
  titulo,
  parrafo1,
  parrafo2,
  parrafo3,
  imagenUrl,
  badgeNumero,
  badgeTexto,
  hito1Titulo,
  hito1Texto,
  hito2Titulo,
  hito2Texto,
}: OurOriginsProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div className="relative">
          {imagenUrl ? (
            <div className="relative h-80 overflow-hidden rounded-card">
              <Image src={imagenUrl} alt="" fill className="object-cover" />
            </div>
          ) : (
            <div className="card flex h-80 items-center justify-center text-gray-400">
              Foto histórica — fundadores de la cooperativa
            </div>
          )}
          <div className="absolute -bottom-5 left-6 rounded-card border border-surface-border bg-white px-5 py-4 shadow-sm">
            <p className="text-2xl font-bold text-primary-dark">{badgeNumero}</p>
            <p className="text-xs text-gray-500">{badgeTexto}</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent">
            {label}
          </p>
          <h2 className="text-3xl font-semibold text-primary-dark">{titulo}</h2>

          <div className="mt-5 space-y-4 text-sm leading-relaxed text-gray-600">
            <p>{parrafo1}</p>
            <p>{parrafo2}</p>
            <p>{parrafo3}</p>
          </div>

          <div className="mt-7 flex gap-8 border-t border-surface-border pt-6">
            <div className="border-l-2 border-accent pl-4">
              <p className="text-sm font-semibold text-primary-dark">{hito1Titulo}</p>
              <p className="text-xs text-gray-500">{hito1Texto}</p>
            </div>
            <div className="border-l-2 border-accent pl-4">
              <p className="text-sm font-semibold text-primary-dark">{hito2Titulo}</p>
              <p className="text-xs text-gray-500">{hito2Texto}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
