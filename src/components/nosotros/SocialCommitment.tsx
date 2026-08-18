import { Leaf, Users } from "lucide-react";

const INICIATIVAS = [
  {
    titulo: "Gestión del Agua",
    descripcion:
      "Implementamos sistemas de riego por goteo de alta eficiencia para optimizar el recurso más valioso de nuestra zona árida.",
  },
  {
    titulo: "Precio Justo",
    descripcion:
      "Garantizamos retornos equitativos para nuestros productores, eliminando intermediarios y fortaleciendo la economía local.",
  },
  {
    titulo: "Residuos Cero",
    descripcion:
      "Transformamos los subproductos de nuestra producción en abonos orgánicos y biocombustibles, cerrando el ciclo productivo.",
  },
];

export function SocialCommitment() {
  return (
    <section className="border-t border-surface-border">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-primary-dark">
              Compromiso Social y Ambiental
            </h2>
            <p className="mt-3 max-w-xl text-sm text-gray-600">
              No solo producimos; cuidamos el entorno que nos permite
              existir. Nuestras prácticas están diseñadas para preservar el
              ecosistema riojano para las generaciones venideras.
            </p>
          </div>

          <div className="flex shrink-0 gap-3">
            <span className="badge bg-status-success/10 text-status-success">
              <Leaf size={13} /> Sostenibilidad
            </span>
            <span className="badge bg-primary/10 text-primary">
              <Users size={13} /> Comunidad
            </span>
          </div>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {INICIATIVAS.map(({ titulo, descripcion }) => (
            <div
              key={titulo}
              className="relative flex h-72 flex-col justify-end overflow-hidden rounded-card bg-primary-dark p-5"
            >
              {/* TODO: reemplazar por foto real de la iniciativa (next/image
                  con fill + overlay), manteniendo el degradado inferior */}
              <div className="absolute inset-0 flex items-center justify-center text-xs text-white/25">
                Imagen institucional
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/40 to-transparent" />
              <div className="relative">
                <h3 className="text-lg font-semibold text-white">{titulo}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-white/75">
                  {descripcion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
