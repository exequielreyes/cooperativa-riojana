import { Target, Eye, HeartHandshake, Award, ShieldCheck, Lightbulb } from "lucide-react";
import type { ValorInstitucional } from "@/lib/contenidoNosotrosDefault";

// Los íconos van en orden fijo (1º = Solidaridad, 2º = Excelencia, etc.);
// el admin solo edita título y descripción de cada uno.
const ICONOS_VALORES = [HeartHandshake, Award, ShieldCheck, Lightbulb];

type MissionVisionProps = {
  textoMision: string;
  textoVision: string;
  valores: ValorInstitucional[];
};

export function MissionVision({ textoMision, textoVision, valores }: MissionVisionProps) {
  return (
    <section id="cimientos" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-semibold text-primary-dark">
          Nuestros Cimientos
        </h2>
        <span className="mx-auto mt-3 block h-1 w-14 rounded-full bg-accent" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card">
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Target size={20} />
          </span>
          <h3 className="text-xl font-semibold text-primary-dark">Misión</h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">{textoMision}</p>
        </div>

        <div className="rounded-card bg-primary-dark p-6 text-white">
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-accent/20 text-accent">
            <Eye size={20} />
          </span>
          <h3 className="text-xl font-semibold">Visión</h3>
          <p className="mt-3 text-sm leading-relaxed text-white/75">{textoVision}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {valores.map((valor, index) => {
          const Icon = ICONOS_VALORES[index] ?? HeartHandshake;
          return (
            <div key={index} className="card">
              <Icon size={18} className="mb-2 text-primary" />
              <p className="text-sm font-semibold text-primary-dark">{valor.titulo}</p>
              <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">
                {valor.descripcion}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
