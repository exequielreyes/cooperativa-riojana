import { MapPin, Phone, Mail, Clock, MessageSquareText } from "lucide-react";

const ITEMS = [
  {
    icon: MapPin,
    titulo: "Sede Central",
    lineas: ["Av. Rivadavia 123, Ciudad de La Rioja, Argentina."],
  },
  {
    icon: Phone,
    titulo: "Atención Telefónica",
    lineas: ["0800-444-COOP (2667) | Lunes a Viernes de 8:00 a 20:00hs."],
  },
  {
    icon: Mail,
    titulo: "Consultas Digitales",
    lineas: ["soporte@coopriojana.com.ar | contacto@coopriojana.com.ar"],
  },
  {
    icon: Clock,
    titulo: "Horario Presencial",
    lineas: ["Lunes a Viernes: 08:30 - 16:30hs | Sábados: 09:00 - 13:00hs."],
  },
];

export function ContactInfo() {
  return (
    <div>
      <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-primary-dark">
        <MessageSquareText size={20} className="text-primary" />
        Información de Contacto
      </h2>

      <ul className="space-y-5">
        {ITEMS.map(({ icon: Icon, titulo, lineas }) => (
          <li key={titulo} className="flex items-start gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-surface-border bg-white text-primary">
              <Icon size={17} />
            </span>
            <div>
              <p className="text-[15px] font-semibold text-primary-dark">{titulo}</p>
              {lineas.map((linea) => (
                <p key={linea} className="text-sm leading-relaxed text-gray-500">
                  {linea}
                </p>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
