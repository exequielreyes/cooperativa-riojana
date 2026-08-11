const proyectos = [
  { titulo: "Consumo Cooperativo", descripcion: "Red de beneficios en supermercados y comercios adheridos.", lanzamiento: "2027" },
  { titulo: "Crédito Social", descripcion: "Líneas de financiación con las tasas más competitivas del mercado.", lanzamiento: "2027" },
  { titulo: "Vivienda Propia", descripcion: "Planes de vivienda y financiación para acceder a un hogar digno.", lanzamiento: "2027" },
];

export default function ProyectosPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-14">
      <div className="mb-10 text-center">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-accent">Nuevos Horizontes</p>
        <h1 className="text-3xl font-semibold text-primary-dark">Creciendo junto a vos</h1>
        <p className="mx-auto mt-3 max-w-xl text-gray-600">
          Estamos desarrollando nuevas herramientas y beneficios para
          fortalecer el bienestar de nuestra comunidad de socios.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {proyectos.map((proyecto) => (
          <div key={proyecto.titulo} className="card">
            <p className="badge-warning mb-3 w-fit">Próximamente</p>
            <h2 className="mb-2 font-medium text-primary-dark">{proyecto.titulo}</h2>
            <p className="mb-4 text-sm text-gray-600">{proyecto.descripcion}</p>
            <p className="text-xs text-gray-400">Lanzamiento estimado: {proyecto.lanzamiento}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
