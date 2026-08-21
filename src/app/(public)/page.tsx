import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

// TODO: reemplazar por fetch a /api/noticias y /api/talleres (últimas publicadas)
// const ultimasNoticias = [
//   { slug: "nueva-inversion-tecnologica", titulo: "Nueva Inversión Tecnológica en la Planta de Procesamiento", categoria: "Producción" },
//   { slug: "convocatoria-asamblea-2024", titulo: "Convocatoria a la Asamblea General Ordinaria 2024", categoria: "Institucional" },
//   { slug: "beneficios-farmacias", titulo: "Nuevos beneficios en farmacias y centros de salud", categoria: "Comunidad" },
// ];


async function getUltimasNoticias() {
  try {
    const noticias = await prisma.noticia.findMany({
      where: {
        estado: "PUBLICADO",
      },
      orderBy: {
        fechaPublicacion: "desc",
      },
      take: 3,
    });
    return noticias;
  } catch (error) {
    console.error("Error al obtener noticias:", error);
    return [];
  }
}






export default async function HomePage() {

  const ultimasNoticias = await getUltimasNoticias();
  return (
    <>
      <section className="bg-surface-muted">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center">
          <div>
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-accent">
              Más de 50 años junto a vos
            </p>
            <h1 className="text-4xl font-semibold leading-tight text-primary-dark">
              Crecemos juntos para un futuro mejor
            </h1>
            <p className="mt-4 max-w-md text-gray-600">
              Unite a la red de beneficios más grande de La Rioja. Gestión
              transparente, servicios financieros y compromiso social para
              todos nuestros socios.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/asociarme" className="btn-primary">
                Quiero asociarme
              </Link>
              <Link href="/login" className="btn-secondary">
                Soy socio
              </Link>
            </div>
          </div>
          <div className="card flex h-64 items-center justify-center text-gray-400">
            Imagen institucional
          </div>
        </div>
      </section>

      {/* Implementacion a futuro */}
      {/* <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card-quick-access flex items-center gap-5 bg-primary/5 p-6">
            <span className="icon-surface-muted">📊</span> 
            <div>
              <p className="font-semibold text-primary">Estado de Cuenta Rápido</p>
              <p className="text-sm text-gray-500">Consultá tu saldo actual, cuotas pendientes y beneficios
                acumulados en un solo clic. Acceso exclusivo para socios
                registrados.</p>
              <Link href="/account" className="mt-2 block text-xs font-medium text-primary hover:underline">Consultar ahora →</Link>
            </div>
          </div>
          <div className="card-quick-access flex items-center gap-5 bg-primary/5 p-6">
            <span className="icon-surface-muted">💳</span> 
            <div>
              <p className="font-semibold text-primary">Comprobante de Pago</p>
              <p className="text-sm text-gray-500">Descargá facturas de tus pagos mensuales y aportes. Aceptamos todas las tarjetas a través de nuestra integración con Macro Click.</p>
              <Link href="/payments" className="mt-2 block text-xs font-medium text-primary hover:underline">Ir a pagar →</Link>
            </div>
          </div>
        </div>
      </section> */}





    <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 flex items-end justify-between border-b border-surface-border pb-3">
          <div>
            <h2 className="text-2xl font-bold text-primary">Últimas Noticias</h2>
            <p className="mt-1 text-sm text-gray-500">Mantenete informado sobre la actualidad de nuestra cooperativa y comunidad.</p>
          </div>
          <Link href="/noticias" className="text-xs font-medium text-gray-500 hover:text-primary hover:underline">
            Ver todas las noticias
          </Link>
        </div>

        {ultimasNoticias.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-8">
            No hay noticias publicadas en este momento.
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {ultimasNoticias.map((noticia) => (
              <Link key={noticia.id || noticia.slug} href={`/noticias/${noticia.slug}`} className="group card-news block overflow-hidden bg-white shadow-sm hover:shadow-lg transition-shadow duration-300 rounded-lg border border-surface-border">

                <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
                  <Image
                    src={noticia.imagenUrl || ""}
                    alt={noticia.titulo}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-5">
                  <p className="mb-2 text-xs font-medium uppercase text-accent">
                    {noticia.categoria} {noticia.fechaPublicacion ? `· ${formatDate(noticia.fechaPublicacion)}` : ''}
                  </p>
                  <p className="font-semibold text-lg text-primary leading-snug">{noticia.titulo}</p>
                  <p className="mt-3 text-sm text-gray-600 line-clamp-3">
                    {noticia.contenido}
                  </p>
                  <p className="mt-4 text-xs font-semibold text-primary group-hover:underline">Leer más</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

 <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-primary">Nuevos horizontes</h2>
        <p className="mt-3 text-gray-600 max-w-xl mx-auto">
          Estamos trabajando para ampliar nuestros servicios y brindarte más soluciones integrales para tu vida cotidiana.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: '🛒', label: 'Consumo Responsable', text: 'Red de comercios adheridos con descuentos directos y financiación en compras de canasta básica y tecnología.', status: 'PROXIMAMENTE' },
            { icon: '📈', label: 'Líneas de Crédito', text: 'Microcréditos personales con las tasas más bajas del mercado, diseñados para emprendedores y proyectos familiares.', status: 'PROXIMAMENTE' },
            { icon: '🏠', label: 'Plan Vivienda', text: 'Acceso a tu casa propia mediante sistemas de ahorro previo y construcción cooperativa. Un sueño cada vez más cerca.', status: 'PROXIMAMENTE' },
          ].map(item => (
            <div key={item.label} className="relative card block p-8 text-center border border-surface-border">
              <span className="absolute top-4 right-4 text-xs font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full">{item.status}</span>
              <span className="icon-surface-muted text-3xl mx-auto mb-5">
                {item.icon}
              </span>
              <p className="font-semibold text-lg text-primary">{item.label}</p>
              <p className="mt-3 text-sm text-gray-600 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>


      <section className="bg-primary">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-20 text-center text-white">
          <h2 className="text-3xl font-extrabold leading-tight">¿Aún no sos parte de nuestra familia?</h2>
          <p className="max-w-xl text-white/90">
            Sumate hoy mismo y empezá a disfrutar de todos los beneficios de
            pertenecer a una organización con valores.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Link href="/asociarme" className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:bg-surface-muted">
              Completar Solicitud de Socio
            </Link>
            <Link href="/contacto" className="rounded-lg border border-white px-5 py-3 text-sm font-medium text-white transition hover:bg-white/10">
              Contactar a un Asesor
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
