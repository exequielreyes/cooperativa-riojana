import { prisma } from "@/lib/db";
import { FAQAccordion } from "@/components/contacto/FAQAccordion";

const FAQS_POR_DEFECTO = [
  {
    pregunta: "¿Cómo puedo asociarme a la Cooperativa?",
    respuesta:
      "Para asociarte debes completar el formulario de Solicitud de Asociación en nuestra web. Una vez enviado, nuestro equipo administrativo validará tus datos y se pondrá en contacto contigo en un plazo de 48 a 72 horas hábiles.",
  },
  {
    pregunta: "¿Cuáles son los beneficios de ser socio?",
    respuesta:
      "Los socios acceden a descuentos en talleres, líneas de crédito preferenciales, participación en proyectos comunitarios y voz y voto en las asambleas anuales de la Cooperativa.",
  },
  {
    pregunta: "¿Cómo realizo el pago de mis cuotas?",
    respuesta:
      "Podés abonar tu cuota societaria por transferencia bancaria, en nuestra sede central o desde el Portal del Socio con tarjeta de débito o crédito.",
  },
  {
    pregunta: "¿Qué documentación necesito para solicitar un crédito?",
    respuesta:
      "Necesitás DNI vigente, comprobante de ingresos de los últimos 3 meses, constancia de domicilio y estar al día con tus cuotas societarias.",
  },
  {
    pregunta: "¿Cómo puedo inscribirme a los talleres?",
    respuesta:
      "Ingresá a la sección Talleres, elegí el que te interese y completá el formulario de inscripción. Los socios tienen prioridad de cupo y precios preferenciales.",
  },
];

export async function FAQSection() {
  const faqsDb = await prisma.preguntaFrecuente.findMany({
    where: { activa: true },
    orderBy: { orden: "asc" },
  });

  const faqs = faqsDb.length > 0 ? faqsDb : FAQS_POR_DEFECTO;

  return <FAQAccordion faqs={faqs} />;
}
