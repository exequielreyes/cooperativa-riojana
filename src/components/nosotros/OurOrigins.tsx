export function OurOrigins() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        {/* TODO: reemplazar por foto histórica real (next/image), manteniendo
            el badge de "80+ años" superpuesto */}
        <div className="relative">
          <div className="card flex h-80 items-center justify-center text-gray-400">
            Foto histórica — fundadores de la cooperativa
          </div>
          <div className="absolute -bottom-5 left-6 rounded-card border border-surface-border bg-white px-5 py-4 shadow-sm">
            <p className="text-2xl font-bold text-primary-dark">80+</p>
            <p className="text-xs text-gray-500">
              Años de trayectoria
              <br />
              ininterrumpida
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent">
            Nuestra Trayectoria
          </p>
          <h2 className="text-3xl font-semibold text-primary-dark">
            Nuestros Orígenes
          </h2>

          <div className="mt-5 space-y-4 text-sm leading-relaxed text-gray-600">
            <p>
              En 1940, un pequeño grupo de visionarios productores de La
              Rioja decidió unir sus esfuerzos para enfrentar los desafíos de
              una industria en crecimiento. Lo que comenzó como un sueño de
              cooperación mutua en los valles riojanos, se transformó en uno
              de los pilares económicos de nuestra región.
            </p>
            <p>
              A lo largo de las décadas, hemos atravesado desafíos climáticos
              y económicos, siempre manteniéndonos fieles al espíritu
              cooperativo: la convicción de que el esfuerzo compartido genera
              beneficios duraderos para todos.
            </p>
            <p>
              Hoy, esa pequeña semilla ha crecido hasta convertirse en la
              Cooperativa Riojana, una institución que representa el corazón
              productivo de nuestra tierra y el sustento de cientos de
              familias.
            </p>
          </div>

          <div className="mt-7 flex gap-8 border-t border-surface-border pt-6">
            <div className="border-l-2 border-accent pl-4">
              <p className="text-sm font-semibold text-primary-dark">1940</p>
              <p className="text-xs text-gray-500">
                Fundación de la cooperativa original.
              </p>
            </div>
            <div className="border-l-2 border-accent pl-4">
              <p className="text-sm font-semibold text-primary-dark">
                Actualidad
              </p>
              <p className="text-xs text-gray-500">
                Líderes en exportación regional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
