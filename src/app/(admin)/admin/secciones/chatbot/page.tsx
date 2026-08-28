import { GestorChatbot } from "@/components/admin/GestorChatBot";

export default async function ChatbotAdminPage() {
  const respuestas = await prisma.chatbotRespuesta.findMany({ orderBy: { orden: "asc" } });
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-2xl font-semibold text-primary-dark">Contenido del Chatbot</h1>
      <p className="mb-6 text-sm text-gray-500">
        Si el mensaje del socio contiene alguna de las palabras clave, el chatbot va a ofrecer esta respuesta.
      </p>
      <GestorChatbot respuestasIniciales={respuestas} />
    </div>
  );
}
