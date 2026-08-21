import { Fragment } from "react";

const REGEX_VIDEO = /^\{\{video:(youtube|tiktok):([a-zA-Z0-9_-]+)\}\}$/;
const REGEX_INLINE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;

function renderizarInline(texto: string) {
  const partes = texto.split(REGEX_INLINE);

  return partes.map((parte, i) => {
    const negrita = parte.match(/^\*\*([^*]+)\*\*$/);
    if (negrita) return <strong key={i}>{negrita[1]}</strong>;

    const link = parte.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      return (
        <a
          key={i}
          href={link[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-primary-light"
        >
          {link[1]}
        </a>
      );
    }

    return <Fragment key={i}>{parte}</Fragment>;
  });
}

function VideoEmbed({ plataforma, id }: { plataforma: "youtube" | "tiktok"; id: string }) {
  if (plataforma === "youtube") {
    return (
      <div className="my-4 aspect-video w-full overflow-hidden rounded-card">
        <iframe
          src={`https://www.youtube.com/embed/${id}`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="my-4 aspect-[9/16] max-w-sm overflow-hidden rounded-card">
      <iframe
        src={`https://www.tiktok.com/embed/v2/${id}`}
        className="h-full w-full"
        allow="autoplay; encrypted-media;"
        allowFullScreen
      />
    </div>
  );
}

/**
 * Convierte el texto plano guardado (con nuestra sintaxis liviana:
 * **negrita**, ## Subtítulo, [texto](link) y {{video:plataforma:id}})
 * en JSX, sin usar dangerouslySetInnerHTML.
 */
export function ContenidoNoticia({ texto }: { texto: string }) {
  const lineas = texto.split("\n");

  return (
    <div className="space-y-3">
      {lineas.map((linea, i) => {
        const lineaTrim = linea.trim();

        const video = lineaTrim.match(REGEX_VIDEO);
        if (video) {
          return <VideoEmbed key={i} plataforma={video[1] as "youtube" | "tiktok"} id={video[2]} />;
        }

        if (lineaTrim.startsWith("## ")) {
          return (
            <h3 key={i} className="!mt-6 text-xl font-semibold text-primary-dark">
              {renderizarInline(lineaTrim.slice(3))}
            </h3>
          );
        }

        if (lineaTrim === "") return null;

        return (
          <p key={i} className="leading-relaxed text-gray-700">
            {renderizarInline(linea)}
          </p>
        );
      })}
    </div>
  );
}
