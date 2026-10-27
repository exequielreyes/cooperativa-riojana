import Image from "next/image";
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-surface-border bg-gradient-to-b from-white via-surface-muted/30 to-surface-muted/70">
      {/* Resplandor decorativo sutil en el fondo */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -top-24 right-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl"
      />
      
      <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5 md:gap-8 lg:gap-12">
          
          {/* Columna 1: Logo y Presentación */}
          <div className="space-y-4 md:col-span-2">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 transition-transform duration-200 hover:opacity-90"
            >
              <Image
                src="/logo_nuevo_2.png" 
                alt="Cooperativa Riojana"
                width={160}
                height={32}
                className="h-9 w-auto object-contain"
              />
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-gray-600">
              Comprometidos con el desarrollo social y económico de nuestra
              comunidad desde hace más de 50 años.
            </p>

            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Más de 50 años construyendo futuro
            </div>
          </div>

          {/* Columna 2: Enlaces */}
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-primary-dark">
              Enlaces
            </p>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li>
                <Link href="/" className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-primary">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/noticias" className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-primary">
                  Noticias
                </Link>
              </li>
              <li>
                <Link href="/talleres" className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-primary">
                  Talleres
                </Link>
              </li>
              <li>
                <Link href="/asociarme" className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-primary">
                  Asociarme
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Legal */}
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-primary-dark">
              Legal
            </p>
            <ul className="space-y-2.5 text-sm text-gray-600">
              <li>
                <Link href="/quienes-somos" className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-primary">
                  Quiénes Somos
                </Link>
              </li>
              <li>
                <Link href="/terminos" className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-primary">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacidad" className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-primary">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link href="/estatuto" className="inline-block transition-all duration-200 hover:translate-x-1 hover:text-primary">
                  Estatuto Social
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4: Contacto */}
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-primary-dark">
              Contacto
            </p>
            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <Link 
                  href="#" 
                  className="group flex items-start gap-2.5 transition-colors duration-200 hover:text-primary"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-muted text-xs shadow-xs transition-colors group-hover:bg-primary/10">
                    📍
                  </span>
                  <span>Av. Rivadavia 123, La Rioja</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="mailto:contacto@coopriojana.com.ar" 
                  className="group flex items-start gap-2.5 transition-colors duration-200 hover:text-primary"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-muted text-xs shadow-xs transition-colors group-hover:bg-primary/10">
                    ✉️
                  </span>
                  <span className="break-all">contacto@coopriojana.com.ar</span>
                </Link>
              </li>
              <li>
                <div className="group flex items-start gap-2.5 transition-colors duration-200 hover:text-primary">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-surface-muted text-xs shadow-xs transition-colors group-hover:bg-primary/10">
                    📞
                  </span>
                  <span className="font-medium tracking-wide">0800-444-COOP</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Separador inferior y Copyright */}
        <div className="mt-14 border-t border-surface-border/70 pt-6">
          <div className="flex flex-col items-center justify-between gap-4 text-xs text-gray-500 sm:flex-row">
            <p className="text-center sm:text-left">
              © {new Date().getFullYear()} Cooperativa Riojana Ltda. Todos los derechos reservados.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="#" className="transition-colors hover:text-primary hover:underline underline-offset-4">
                Términos y Condiciones
              </Link>
              <Link href="#" className="transition-colors hover:text-primary hover:underline underline-offset-4">
                Mapa del Sitio
              </Link>
              <Link href="#" className="transition-colors hover:text-primary hover:underline underline-offset-4">
                Accesibilidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}