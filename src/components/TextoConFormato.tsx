/**
 * Renderiza texto que puede contener negrita en formato **así**, sin
 * arriesgar XSS: primero separamos por el patrón de negrita (sin tocar el
 * DOM con HTML del usuario) y devolvemos nodos React normales, nunca
 * dangerouslySetInnerHTML.
 */
export function TextoConFormato({ texto, className }: { texto: string; className?: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g);

  return (
    <span className={className}>
      {partes.map((parte, i) => {
        const match = parte.match(/^\*\*([^*]+)\*\*$/);
        if (match) {
          return <strong key={i}>{match[1]}</strong>;
        }
        return <span key={i}>{parte}</span>;
      })}
    </span>
  );
}
