import Image from "next/image";
import { Leaf, Users } from "lucide-react";
import type { IniciativaSocial } from "@/lib/contenidoNosotrosDefault";

type SocialCommitmentProps = {
  titulo: string;
  descripcion: string;
  iniciativas: IniciativaSocial[];
};

export function SocialCommitment({ titulo, descripcion, iniciativas }: SocialCommitmentProps) {
  return (
    <section className="border-t border-surface-border">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-primary-dark">{titulo}</h2>
            <p className="mt-3 max-w-xl text-sm text-gray-600">{descripcion}</p>
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
          {iniciativas.map((item, index) => (
            <div
              key={index}
              className="relative flex h-72 flex-col justify-end overflow-hidden rounded-card bg-primary-dark p-5"
            >
              {item.imagenUrl ? (
                <Image src={item.imagenUrl} alt="" fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-white/25">
                  Imagen institucional
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/40 to-transparent" />
              <div className="relative">
                <h3 className="text-lg font-semibold text-white">{item.titulo}</h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-white/75">
                  {item.descripcion}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
