import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { formatDate, limpiarMarkdown } from "@/lib/utils";

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
            <span className="text-xs font-bold uppercase tracking-widest text-accent">Novedades</span>

            <h2 className="text-3xl font-bold tracking-tight text-primary mt-1">Últimas Noticias</h2>
            <p className="mt-2 text-sm text-slate-500 max-w-xl">Mantenete informado sobre la actualidad de nuestra cooperativa y comunidad.</p>
          </div>
          <Link href="/noticias" className="group inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary transition-colors hover:text-accent ">
            Ver todas las noticias
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {ultimasNoticias.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-8">
            No hay noticias publicadas en este momento.
          </p>
        ) : (
          <div className="grid gap-8 md:grid-cols-3">
            {ultimasNoticias.map((noticia) => (
              <Link key={noticia.id || noticia.slug} href={`/noticias/${noticia.slug}`} className="group flex flex-col rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-sm transition-all duration-300 hover:shadow-xl hover:border-slate-300 hover:-translate-y-1">

                <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
                  <Image
                    src={noticia.imagenUrl || ""}
                    alt={noticia.titulo}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* {noticia.categoria && (
                    <span className="absolute top-3 left-3 rounded-full bg-primary-dark/80 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white tracking-wide">
                      {noticia.categoria}
                    </span>
                  )} */}
                </div>
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                  <p className="mb-2 text-xs font-medium uppercase text-accent">
                    {noticia.categoria} {noticia.fechaPublicacion ? `· ${formatDate(noticia.fechaPublicacion)}` : ''}
                  </p>
                  <p className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2">{noticia.titulo}</p>
                  <p className="mt-3 text-sm text-gray-600 line-clamp-3 leading-relaxed">
                    {limpiarMarkdown(noticia.contenido)}
                  </p>
                </div>
                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary group-hover:text-accent transition-colors">
                      Leer artículo completo
                    </span>
                    <span className="text-slate-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-accent">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

 <section className="relative mx-auto max-w-7xl px-6  py-16 lg:px-8">
   <div className="text-center max-w-2xl mx-auto mb-16">
    <span className="text-xs font-bold uppercase tracking-widest text-accent">Futuro & Crecimiento</span>
        <h2 className="text-3xl font-bold tracking-tight text-primary mt-2">Nuevos horizontes</h2>
        <p className="mt-3 text-slate-600 max-w-xl mx-auto">
          Estamos trabajando para ampliar nuestros servicios y brindarte más soluciones integrales para tu vida cotidiana.
        </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: '🛒', label: 'Consumo Responsable', text: 'Red de comercios adheridos con descuentos directos y financiación en compras de canasta básica y tecnología.', status: 'PROXIMAMENTE' },
            { icon: '📈', label: 'Líneas de Crédito', text: 'Microcréditos personales con las tasas más bajas del mercado, diseñados para emprendedores y proyectos familiares.', status: 'PROXIMAMENTE' },
            { icon: '🏠', label: 'Plan Vivienda', text: 'Acceso a tu casa propia mediante sistemas de ahorro previo y construcción cooperativa. Un sueño cada vez más cerca.', status: 'PROXIMAMENTE' },
          ].map(item => (
            <div key={item.label} className="relative rounded-2xl border border-slate-200/80 bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-slate-300 flex flex-col justify-between">
              <div>
                 <div className="flex items-center justify-between mb-3">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 border border-slate-100 text-2xl shadow-inner">
                    {item.icon}
                  </span>
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-[10px] font-bold tracking-wider text-accent border border-accent/20">
                    {item.status}
                  </span>
              </div>
              <p className="font-semibold text-lg text-primary">{item.label}</p>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>


      <section className="bg-primary mt-10">
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
