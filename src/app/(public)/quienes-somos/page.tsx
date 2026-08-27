import { prisma } from "@/lib/db";
import { CONTENIDO_NOSOTROS_DEFAULT, type ValorInstitucional, type IniciativaSocial } from "@/lib/contenidoNosotrosDefault";
import { AboutHero } from "@/components/nosotros/AboutHero";
import { MissionVision } from "@/components/nosotros/MissionVision";
import { OurOrigins } from "@/components/nosotros/OurOrigins";
import { SocialCommitment } from "@/components/nosotros/SocialCommitment";

export const metadata = {
  title: "Quiénes Somos | Cooperativa Riojana",
  description:
    "Conocé la historia, misión y visión de la Cooperativa Riojana: más de 80 años impulsando el desarrollo agroindustrial de nuestra región.",
};

export default async function QuienesSomosPage() {
  const contenido = await prisma.contenidoNosotros.upsert({
    where: { id: "singleton" },
    update: {},
    create: CONTENIDO_NOSOTROS_DEFAULT,
  });

  const valores = contenido.valores as unknown as ValorInstitucional[];
  const iniciativas = contenido.iniciativas as unknown as IniciativaSocial[];

  return (
    <>
      <AboutHero
        badge={contenido.heroBadge}
        titulo={contenido.heroTitulo}
        descripcion={contenido.heroDescripcion}
        botonTexto={contenido.heroBotonTexto}
        imagenUrl={contenido.heroImagenUrl}
      />
      <MissionVision
        textoMision={contenido.textoMision}
        textoVision={contenido.textoVision}
        valores={valores}
      />
      <OurOrigins
        label={contenido.origenesLabel}
        titulo={contenido.origenesTitulo}
        parrafo1={contenido.origenesParrafo1}
        parrafo2={contenido.origenesParrafo2}
        parrafo3={contenido.origenesParrafo3}
        imagenUrl={contenido.origenesImagenUrl}
        badgeNumero={contenido.origenesBadgeNumero}
        badgeTexto={contenido.origenesBadgeTexto}
        hito1Titulo={contenido.origenesHito1Titulo}
        hito1Texto={contenido.origenesHito1Texto}
        hito2Titulo={contenido.origenesHito2Titulo}
        hito2Texto={contenido.origenesHito2Texto}
      />
      <SocialCommitment
        titulo={contenido.compromisoTitulo}
        descripcion={contenido.compromisoDescripcion}
        iniciativas={iniciativas}
      />
    </>
  );
}
