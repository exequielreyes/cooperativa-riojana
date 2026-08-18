import { AboutHero } from "@/components/nosotros/AboutHero";
import { MissionVision } from "@/components/nosotros/MissionVision";
import { OurOrigins } from "@/components/nosotros/OurOrigins";
import { SocialCommitment } from "@/components/nosotros/SocialCommitment";

export const metadata = {
  title: "Quiénes Somos | Cooperativa Riojana",
  description:
    "Conocé la historia, misión y visión de la Cooperativa Riojana: más de 80 años impulsando el desarrollo agroindustrial de nuestra región.",
};

export default function QuienesSomosPage() {
  return (
    <>
      <AboutHero />
      <MissionVision />
      <OurOrigins />
      <SocialCommitment />
    </>
  );
}
