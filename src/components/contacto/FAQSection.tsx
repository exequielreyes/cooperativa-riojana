"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, ArrowUpRight, Wallet, Users } from "lucide-react";

type FAQ = {
  pregunta: string;
  respuesta: string;
};

const FAQS: FAQ[] = [
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

export function FAQSection() {
  const [abierta, setAbierta] = useState<number | null>(0);

  function toggle(index: number) {
    setAbierta((prev) => (prev === index ? null : index));
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary-dark">
            Preguntas Frecuentes
          </h2>
          <p className="mt-2 max-w-md text-sm text-gray-500">
            Antes de enviarnos un mensaje, revisá nuestra lista de preguntas
            frecuentes. Probablemente encuentres la respuesta que buscás de
            inmediato.
          </p>
        </div>
        <span className="hidden shrink-0 rounded-full bg-surface-muted px-3 py-1.5 text-xs font-semibold text-gray-500 sm:inline-flex">
          CENTRO DE AYUDA
        </span>
      </div>

      <ul className="divide-y divide-surface-border border-t border-surface-border">
        {FAQS.map((faq, index) => {
          const abierta_ = abierta === index;
          return (
            <li key={faq.pregunta}>
              <button
                type="button"
                onClick={() => toggle(index)}
                aria-expanded={abierta_}
                className="flex w-full items-start justify-between gap-4 py-5 text-left"
              >
                <span className="flex items-start gap-3">
                  <HelpCircle
                    size={18}
                    className="mt-0.5 shrink-0 text-accent"
                    strokeWidth={2.5}
                  />
                  <span className="text-[15px] font-semibold text-primary-dark">
                    {faq.pregunta}
                  </span>
                </span>
                <ChevronDown
                  size={18}
                  className={`mt-0.5 shrink-0 text-gray-400 transition-transform duration-200 ${
                    abierta_ ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
                  abierta_ ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="min-h-0 pl-8 pr-8 text-sm leading-relaxed text-gray-500">
                  {faq.respuesta}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AccesoRapido
          icon={<Wallet size={18} />}
          titulo="Estado de Cuenta"
          subtitulo="Revisá tus pagos pendientes"
          href="/portal/pagos"
        />
        <AccesoRapido
          icon={<Users size={18} />}
          titulo="Talleres Disponibles"
          subtitulo="Súmate a nuestra comunidad"
          href="/talleres"
        />
      </div>
    </div>
  );
}

function AccesoRapido({
  icon,
  titulo,
  subtitulo,
  href,
}: {
  icon: React.ReactNode;
  titulo: string;
  subtitulo: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group flex items-center justify-between rounded-card border border-surface-border bg-white p-4 transition-colors hover:border-primary/40"
    >
      <span className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/5 text-primary">
          {icon}
        </span>
        <span>
          <span className="block text-sm font-semibold text-primary-dark">
            {titulo}
          </span>
          <span className="block text-xs text-gray-500">{subtitulo}</span>
        </span>
      </span>
      <ArrowUpRight
        size={16}
        className="shrink-0 text-gray-300 transition-colors group-hover:text-primary"
      />
    </a>
  );
}
