import Image from "next/image";
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-surface-border bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12 text-sm text-gray-500">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
            {/* Columna 1: Logo y Texto */}
            <div className="md:col-span-2">
                <Link href="/" className="mb-4 flex items-center gap-2 font-semibold text-primary">
                 
                  <Image
                      src="/logo_nuevo_2.png" 
                      alt="Cooperativa Riojana"
                      width={160}
                      height={32}
                      className="h-8 w-auto object-contain"
                    />
                </Link>
                <p className="max-w-sm mt-3 text-sm text-gray-600 leading-relaxed">
                  Comprometidos con el desarrollo social y económico de nuestra
                  comunidad desde hace más de 50 años.
                </p>
            </div>

            {/* Columna 2: Enlaces */}
            <div>
                <p className="mb-3 font-semibold text-primary-dark">Enlaces</p>
                <ul className="space-y-2 text-gray-600">
                  <li><Link href="/" className="hover:text-primary">Inicio</Link></li>
                  <li><Link href="/noticias" className="hover:text-primary">Noticias</Link></li>
                  <li><Link href="/talleres" className="hover:text-primary">Talleres</Link></li>
                  <li><Link href="/asociarme" className="hover:text-primary">Asociarme</Link></li>
                </ul>
            </div>

            {/* Columna 3: Legal */}
            <div>
                <p className="mb-3 font-semibold text-primary-dark">Legal</p>
                <ul className="space-y-2 text-gray-600">
                  <li><Link href="/quienes-somos" className="hover:text-primary">Quiénes Somos</Link></li>
                  <li><Link href="/terminos" className="hover:text-primary">Términos y Condiciones</Link></li>
                  <li><Link href="/privacidad" className="hover:text-primary">Política de Privacidad</Link></li>
                  <li><Link href="/estatuto" className="hover:text-primary">Estatuto Social</Link></li>
                </ul>
            </div>

            {/* Columna 4: Contacto */}
            <div>
                <p className="mb-3 font-semibold text-primary-dark">Contacto</p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2.5">
                    📍 <Link href="#" className="hover:text-primary">Av. Rivadavia 123, La Rioja</Link>
                  </li>
                  <li className="flex items-start gap-2.5">
                    ✉️ <Link href="mailto:contacto@coopriojana.com.ar" className="hover:text-primary">contacto@coopriojana.com.ar</Link>
                  </li>
                  <li className="flex items-start gap-2.5 hover:text-primary">
                    📞 0800-444-COOP
                  </li>
                </ul>
            </div>
        </div>

        {/* Línea inferior de Copyright */}
        <div className="mt-12 pt-6 border-t border-surface-border text-center text-xs text-gray-400">
          <p>
            © 2024 Cooperativa Riojana Ltda. Todos los derechos reservados.
          </p>
          <div className="mt-2 flex gap-4 justify-center">
            <Link href="#">Términos y Condiciones</Link>
            <Link href="#">Mapa del Sitio</Link>
            <Link href="#">Accesibilidad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
