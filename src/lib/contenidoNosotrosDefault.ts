export type ValorInstitucional = { titulo: string; descripcion: string };
export type IniciativaSocial = { titulo: string; descripcion: string; imagenUrl: string | null };

export const VALORES_DEFAULT: ValorInstitucional[] = [
  { titulo: "Solidaridad", descripcion: "Crecemos juntos, apoyando a cada pequeño y mediano productor." },
  { titulo: "Excelencia", descripcion: "Compromiso inquebrantable con los más altos estándares de calidad." },
  { titulo: "Integridad", descripcion: "Transparencia absoluta en cada proceso y decisión institucional." },
  { titulo: "Innovación", descripcion: "Abrazamos la tecnología para honrar nuestras tradiciones." },
];

export const INICIATIVAS_DEFAULT: IniciativaSocial[] = [
  {
    titulo: "Gestión del Agua",
    descripcion:
      "Implementamos sistemas de riego por goteo de alta eficiencia para optimizar el recurso más valioso de nuestra zona árida.",
    imagenUrl: null,
  },
  {
    titulo: "Precio Justo",
    descripcion:
      "Garantizamos retornos equitativos para nuestros productores, eliminando intermediarios y fortaleciendo la economía local.",
    imagenUrl: null,
  },
  {
    titulo: "Residuos Cero",
    descripcion:
      "Transformamos los subproductos de nuestra producción en abonos orgánicos y biocombustibles, cerrando el ciclo productivo.",
    imagenUrl: null,
  },
];

/** Datos con los que se crea el registro singleton la primera vez (replican el texto que ya estaba hardcodeado en el sitio). */
export const CONTENIDO_NOSOTROS_DEFAULT = {
  id: "singleton" as const,

  heroBadge: "Desde 1940",
  heroTitulo: "Nuestra Historia, Nuestra Tierra",
  heroDescripcion:
    "Somos el fruto de generaciones de productores riojanos trabajando en armonía con la naturaleza para llevar lo mejor de nuestra región al mundo.",
  heroBotonTexto: "Conoce más",
  heroImagenUrl: null,

  textoMision:
    "Potenciar el desarrollo integral de nuestros asociados y de la comunidad riojana, transformando la riqueza de nuestra tierra en productos de excelencia global mediante el modelo cooperativo, garantizando la sostenibilidad y el comercio justo.",
  textoVision:
    "Ser referentes mundiales de la producción agroindustrial cooperativa, reconocidos por nuestra innovación, calidad y compromiso social.",
  valores: VALORES_DEFAULT,

  origenesLabel: "Nuestra Trayectoria",
  origenesTitulo: "Nuestros Orígenes",
  origenesParrafo1:
    "En 1940, un pequeño grupo de visionarios productores de La Rioja decidió unir sus esfuerzos para enfrentar los desafíos de una industria en crecimiento. Lo que comenzó como un sueño de cooperación mutua en los valles riojanos, se transformó en uno de los pilares económicos de nuestra región.",
  origenesParrafo2:
    "A lo largo de las décadas, hemos atravesado desafíos climáticos y económicos, siempre manteniéndonos fieles al espíritu cooperativo: la convicción de que el esfuerzo compartido genera beneficios duraderos para todos.",
  origenesParrafo3:
    "Hoy, esa pequeña semilla ha crecido hasta convertirse en la Cooperativa Riojana, una institución que representa el corazón productivo de nuestra tierra y el sustento de cientos de familias.",
  origenesImagenUrl: null,
  origenesBadgeNumero: "80+",
  origenesBadgeTexto: "Años de trayectoria ininterrumpida",
  origenesHito1Titulo: "1940",
  origenesHito1Texto: "Fundación de la cooperativa original.",
  origenesHito2Titulo: "Actualidad",
  origenesHito2Texto: "Líderes en exportación regional.",

  compromisoTitulo: "Compromiso Social y Ambiental",
  compromisoDescripcion:
    "No solo producimos; cuidamos el entorno que nos permite existir. Nuestras prácticas están diseñadas para preservar el ecosistema riojano para las generaciones venideras.",
  iniciativas: INICIATIVAS_DEFAULT,
};
