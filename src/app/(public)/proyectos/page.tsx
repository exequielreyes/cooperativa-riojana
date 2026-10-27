const proyectos = [
  {
    titulo: "Consumo Cooperativo",
    descripcion:
      "Estamos trabajando para brindarte una red de beneficios exclusivos en supermercados y comercios adheridos, priorizando la economía familiar de nuestros socios.",
    lanzamiento: "2027",
    imagen:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80",
    icono: (
      <svg
        className="h-5 w-5 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>
    ),
    // items: [
    //   "Descuentos directos en caja",
    //   "Canasta básica cooperativa",
    //   "Red de comercios locales",
    //   "Puntos acumulables por compras",
    // ],
  },
  {
    titulo: "Crédito Social",
    descripcion:
      "Pronto habilitaremos líneas de financiamiento con las tasas más competitivas del mercado, diseñadas para proyectos personales, emprendimientos y salud.",
    lanzamiento: "2027",
    imagen:
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
    icono: (
      <svg
        className="h-5 w-5 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
        />
      </svg>
    ),
    // items: [
    //   "Créditos de libre disponibilidad",
    //   "Tasa preferencial para socios",
    //   "Aprobación en 48 horas",
    //   "Planes de pago flexibles",
    // ],
  },
  {
    titulo: "Vivienda Propia",
    descripcion:
      "Nuestro compromiso con el techo propio se materializa en nuevos planes de vivienda y financiación para refacción, facilitando el acceso a un hogar digno.",
    lanzamiento: "2027",
    imagen:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80",
    icono: (
      <svg
        className="h-5 w-5 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
    // items: [
    //   "Círculos de ahorro previo",
    //   "Financiación para materiales",
    //   "Asesoramiento técnico gratuito",
    //   "Proyectos habitacionales propios",
    // ],
  },
];

export default function ProyectosPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
      {/* Encabezado Superior Centrado */}
      <div className="mx-auto max-w-2xl text-center">
        <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 shadow-xs">
          <svg
            className="h-3.5 w-3.5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <polygon
              points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"
              strokeWidth="1.5"
            />
          </svg>
          Nuevos Horizontes
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
          <span className="text-[#0d233a]">Creciendo </span>
          <span className="text-[#598c96]">junto a vos</span>
        </h1>

        <p className="mt-4 text-sm leading-relaxed text-gray-600 md:text-base">
          En Cooperativa Riojana Ltda. no nos detenemos. Estamos desarrollando
          nuevas herramientas y beneficios para fortalecer el bienestar de nuestra
          comunidad de socios.
        </p>
      </div>

      {/* Título de Sección Izquierda */}
      <div className="mt-14 mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-[#0d233a]">
          Proyectos en Desarrollo
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Conocé los pilares de nuestra próxima etapa institucional.
        </p>
      </div>

      {/* Grid de Tarjetas */}
      <div className="grid gap-6 md:grid-cols-3">
        {proyectos.map((proyecto) => (
          <div
            key={proyecto.titulo}
            className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs transition-shadow duration-200 hover:shadow-md"
          >
            {/* Cabecera con Imagen */}
            <div className="relative h-48 w-full overflow-hidden">
              <img
                src={proyecto.imagen}
                alt={proyecto.titulo}
                className="h-full w-full object-cover"
              />
              {/* Degradado oscuro para legibilidad del texto */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

              {/* Badge Próximamente */}
              <span className="absolute top-3 right-3 rounded-md bg-[#eab308] px-2.5 py-0.5 text-[11px] font-semibold text-black shadow-xs">
                Próximamente
              </span>

              {/* Título e Ícono sobre la imagen */}
              <div className="absolute bottom-3.5 left-4 right-4 flex items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/20 backdrop-blur-xs">
                  {proyecto.icono}
                </span>
                <h3 className="text-lg font-bold text-white drop-shadow-xs">
                  {proyecto.titulo}
                </h3>
              </div>
            </div>

            {/* Contenido de la Tarjeta */}
            <div className="flex flex-1 flex-col p-5">
              <p className="text-xs leading-relaxed text-gray-500">
                {proyecto.descripcion}
              </p>

              {/* Lista "LO QUE ESTAMOS PREPARANDO" */}
              {/* <div className="mt-5 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  LO QUE ESTAMOS PREPARANDO:
                </p>
                <ul className="mt-2.5 space-y-1.5 text-xs text-gray-600">
                  {proyecto.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-1.5">
                      <span className="text-gray-400">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div> */}

              {/* Pie de Tarjeta con Año */}
              <div className="mt-6 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <polyline points="12 6 12 12 16 14" strokeWidth="2" />
                  </svg>
                  <span>Lanzamiento estimado: {proyecto.lanzamiento}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
