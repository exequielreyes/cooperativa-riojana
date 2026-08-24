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
