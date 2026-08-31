import { Resend } from "resend";

function escaparHtml(texto: string) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function enviarEmailContacto(datos: {
  nombre: string;
  email: string;
  asunto?: string;
  mensaje: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const emailDestino = process.env.CONTACTO_EMAIL_DESTINO ?? "exefran98@gmail.com";
  // "onboarding@resend.dev" funciona sin verificar dominio propio, pero solo
  // entrega al email con el que te registraste en Resend. Para producción,
  // verificá tu dominio y usá algo como "contacto@coopriojana.com.ar".
  const emailFrom = process.env.CONTACTO_EMAIL_FROM ?? "onboarding@resend.dev";

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY no está configurada. Agregala en tu .env (ver INTEGRACION-EMAIL.md)."
    );
  }

  const resend = new Resend(apiKey);
  const { nombre, email, asunto, mensaje } = datos;

  const { error } = await resend.emails.send({
    from: `Web Cooperativa Riojana <${emailFrom}>`,
    to: emailDestino,
    replyTo: email, // así al tocar "Responder" en Gmail, va directo al socio
    subject: asunto ? `Consulta web: ${asunto}` : `Nueva consulta web de ${nombre}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; color: #1a1f1e;">
        <h2 style="color: #0e3b37;">Nueva consulta desde la página de contacto</h2>
        <p><strong>Nombre:</strong> ${escaparHtml(nombre)}</p>
        <p><strong>Email:</strong> ${escaparHtml(email)}</p>
        ${asunto ? `<p><strong>Asunto:</strong> ${escaparHtml(asunto)}</p>` : ""}
        <p><strong>Mensaje:</strong></p>
        <p style="white-space: pre-wrap; background: #fbfaf7; padding: 12px; border-radius: 8px;">${escaparHtml(mensaje)}</p>
        <hr style="border: none; border-top: 1px solid #e8e5df; margin: 20px 0;" />
        <p style="font-size: 12px; color: #6b7674;">
          Este mensaje se generó automáticamente desde el formulario de
          contacto de coopriojana.com.ar. Para responder, simplemente
          contestá este email.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}

/**
 * Envía por email las credenciales de acceso al Portal del Socio, una vez
 * que el admin aprueba la solicitud de asociación y se genera la
 * contraseña temporal.
 */
export async function enviarEmailCredenciales(datos: {
  nombre: string;
  email: string;
  passwordTemporal: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const emailFrom = process.env.CONTACTO_EMAIL_FROM ?? "onboarding@resend.dev";
  const urlLogin = process.env.NEXTAUTH_URL
    ? `${process.env.NEXTAUTH_URL}/login`
    : "https://coopriojana.com.ar/login";

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY no está configurada. Agregala en tu .env (ver INTEGRACION-EMAIL.md)."
    );
  }

  const resend = new Resend(apiKey);
  const { nombre, email, passwordTemporal } = datos;

  const { error } = await resend.emails.send({
    from: `Cooperativa Riojana <${emailFrom}>`,
    to: email,
    subject: "¡Bienvenido/a a la Cooperativa Riojana! Tus datos de acceso",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; color: #1a1f1e;">
        <h2 style="color: #0e3b37;">¡Tu solicitud fue aprobada!</h2>
        <p>Hola ${escaparHtml(nombre)},</p>
        <p>
          Tu solicitud de asociación a la Cooperativa Riojana fue aprobada.
          Ya podés ingresar al Portal del Socio con estos datos:
        </p>
        <div style="background: #fbfaf7; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0 0 8px;"><strong>Usuario:</strong> ${escaparHtml(email)}</p>
          <p style="margin: 0;"><strong>Contraseña temporal:</strong> ${escaparHtml(passwordTemporal)}</p>
        </div>
        <p>
          Por seguridad, te recomendamos cambiar esta contraseña la primera
          vez que ingreses (Portal del Socio → Configuración).
        </p>
        <a
          href="${urlLogin}"
          style="display: inline-block; margin-top: 8px; background: #0e3b37; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600;"
        >
          Ingresar al Portal del Socio
        </a>
        <hr style="border: none; border-top: 1px solid #e8e5df; margin: 24px 0 16px;" />
        <p style="font-size: 12px; color: #6b7674;">
          Si no reconocés esta solicitud, respondé este email para avisarnos.
        </p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}
