import { ArrowDown } from "lucide-react";

export function AboutHero() {
  return (
    <section className="relative isolate overflow-hidden bg-primary-dark">
      {/* TODO: reemplazar por foto real de los campos/valles riojanos
          (next/image con fill), manteniendo este overlay para legibilidad */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/70 to-primary-dark/40" />
      <div className="absolute inset-0 flex items-center justify-center text-sm text-white/30">
        Imagen institucional — campos riojanos
      </div>

      <div className="relative mx-auto flex min-h-[560px] max-w-6xl flex-col justify-end px-6 pb-16 pt-24">
        <span className="mb-5 inline-flex w-fit items-center rounded-full bg-accent px-3.5 py-1.5 text-xs font-semibold text-primary-dark">
          Desde 1940
        </span>

        <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
          Nuestra Historia, Nuestra Tierra
        </h1>

        <p className="mt-5 max-w-xl text-white/80">
          Somos el fruto de generaciones de productores riojanos trabajando
          en armonía con la naturaleza para llevar lo mejor de nuestra
          región al mundo.
        </p>

        <a
          href="#cimientos"
          className="mt-7 inline-flex w-fit items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-primary-dark transition-colors hover:bg-white/90"
        >
          Conoce más
          <ArrowDown size={16} />
        </a>
      </div>
    </section>
  );
}
