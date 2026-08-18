import { ContactForm } from "@/components/contacto/ContactForm";
import { ContactInfo } from "@/components/contacto/ContactInfo";
import { FAQSection } from "@/components/contacto/FAQSection";

export const metadata = {
  title: "Contacto | Cooperativa Riojana",
  description:
    "Estamos aquí para ayudarte. Envianos tu consulta o revisá nuestras preguntas frecuentes.",
};

export default function ContactoPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-16">
        <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1.5 text-xs font-bold tracking-wide text-accent">
          ATENCIÓN AL SOCIO
        </span>

        <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight text-primary-dark">
          Estamos aquí para ayudarte
        </h1>

        <p className="mt-4 max-w-xl text-gray-600">
          Ya sea que tengas una duda técnica, administrativa o quieras
          conocer más sobre nuestros beneficios, nuestro equipo está a tu
          disposición.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-2xl font-bold text-primary-dark">
              Envíanos un mensaje
            </h2>
            <p className="mt-2 max-w-md text-sm text-gray-500">
              Completá los campos a continuación y te responderemos a la
              brevedad.
            </p>

            <div className="mt-6">
              <ContactForm />
            </div>

            <div className="mt-12">
              <ContactInfo />
            </div>
          </div>

          <div>
            <FAQSection />
          </div>
        </div>
      </section>
    </>
  );
}
