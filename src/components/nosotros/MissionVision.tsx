import { Target, Eye, HeartHandshake, Award, ShieldCheck, Lightbulb } from "lucide-react";

const VALORES = [
  {
    icon: HeartHandshake,
    titulo: "Solidaridad",
    descripcion: "Crecemos juntos, apoyando a cada pequeño y mediano productor.",
  },
  {
    icon: Award,
    titulo: "Excelencia",
    descripcion: "Compromiso inquebrantable con los más altos estándares de calidad.",
  },
  {
    icon: ShieldCheck,
    titulo: "Integridad",
    descripcion: "Transparencia absoluta en cada proceso y decisión institucional.",
  },
  {
    icon: Lightbulb,
    titulo: "Innovación",
    descripcion: "Abrazamos la tecnología para honrar nuestras tradiciones.",
  },
];

export function MissionVision() {
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
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            Potenciar el desarrollo integral de nuestros asociados y de la
            comunidad riojana, transformando la riqueza de nuestra tierra en
            productos de excelencia global mediante el modelo cooperativo,
            garantizando la sostenibilidad y el comercio justo.
          </p>
        </div>

        <div className="rounded-card bg-primary-dark p-6 text-white">
          <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-accent/20 text-accent">
            <Eye size={20} />
          </span>
          <h3 className="text-xl font-semibold">Visión</h3>
          <p className="mt-3 text-sm leading-relaxed text-white/75">
            Ser referentes mundiales de la producción agroindustrial
            cooperativa, reconocidos por nuestra innovación, calidad y
            compromiso social.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {VALORES.map(({ icon: Icon, titulo, descripcion }) => (
          <div key={titulo} className="card">
            <Icon size={18} className="mb-2 text-primary" />
            <p className="text-sm font-semibold text-primary-dark">{titulo}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-gray-500">
              {descripcion}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
