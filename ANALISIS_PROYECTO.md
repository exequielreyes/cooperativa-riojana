# Análisis del Proyecto: Cooperativa Riojana

## 1. Visión General
El proyecto **Cooperativa Riojana** es una aplicación web full-stack diseñada para gestionar una cooperativa. Cuenta con un sitio institucional público, un portal de autogestión para los socios y un panel de administración integral. 

Está construido con tecnologías modernas y estructurado para ofrecer una alta escalabilidad, integrando autenticación por roles, gestión de contenidos, cobranzas, manejo de talleres y más.

## 2. Stack Tecnológico
- **Framework Principal:** Next.js 14 (usando el nuevo *App Router*).
- **Lenguaje:** TypeScript, garantizando tipado estático robusto.
- **Estilos:** Tailwind CSS, configurado mediante tokens de diseño en `tailwind.config.ts`.
- **Base de Datos & ORM:** MySQL gestionado a través de Prisma ORM.
- **Autenticación:** NextAuth.js utilizando un proveedor de credenciales y JWT con validación de roles (`SOCIO`, `SUPER_ADMIN`, `EDITOR_CONTENIDOS`, `PROFESOR`).
- **Librerías Adicionales:** 
  - `bcryptjs` para el cifrado de contraseñas.
  - `recharts` para gráficos interactivos en los paneles del administrador.
  - `react-chatbotify` para la integración de un chatbot de asistencia.
  - `exceljs` para exportar y manejar datos en hojas de cálculo.
  - `resend` para gestión y envío de correos electrónicos.
  - `zod` para la validación de esquemas y datos.

## 3. Arquitectura del Proyecto
El sistema se organiza en la carpeta `src/` adoptando las convenciones del *App Router* de Next.js, dividiendo visual y lógicamente la aplicación:

### Rutas (Carpetas principales en `src/app/`)
*   `(public)/`: Contiene todas las páginas accesibles sin autenticación: inicio, portal de noticias, catálogo de talleres, información de proyectos, formulario de asociación pública y login.
*   `(socio)/portal/`: Área privada exclusiva para los socios de la cooperativa. Les permite acceder a su dashboard, gestionar su perfil, dar de alta/baja a su grupo familiar, reportar pagos y gestionar sus inscripciones a talleres.
*   `(admin)/admin/`: Panel de control (Backoffice) reservado para administradores. Maneja métricas generales, ABM (Alta, Baja y Modificación) de socios, validación de pagos, gestión de talleres, publicación de noticias/contenidos, y configuraciones globales (ej. monto de cuota).
*   `api/`: Rutas de backend (Endopoints REST) separadas funcionalmente (auth, socios, pagos, talleres, noticias, grupo-familiar, etc.).
*   `middleware.ts`: Archivo crucial encargado de proteger las rutas y redirigir usuarios según su rol (ej. bloquea a socios de intentar entrar a `/admin`).

### Componentes y Utilidades
*   `src/components/layout/`: Elementos comunes de la interfaz (Navbars y Sidebars específicos por sección).
*   `src/components/ui/`: Componentes base (Botones, Badges, Botón de Logout, etc.).
*   `src/lib/`: Carpeta de lógica y configuraciones compartidas: cliente de Prisma (`db.ts`), configuración de NextAuth (`auth.ts`), funciones utilitarias y adaptadores de subida de archivos (storage local en desarrollo).

## 4. Diseño de Base de Datos (Esquema Prisma)
El esquema modela de manera relacional toda la lógica de negocio de la cooperativa. Algunas de las entidades más importantes son:

*   **Usuario & Socio:** Existe una separación clara. El `Usuario` maneja la autenticación y los roles. El `Socio` se relaciona 1-a-1 con un `Usuario` y contiene los datos personales, de contacto, tipo de miembro y vinculación con un ID propio de la cooperativa.
*   **GrupoFamiliar:** Relacionado al socio, permite llevar el registro de los integrantes de la familia y su contacto.
*   **Cuota & Pago:** Sistema de facturación donde un socio tiene `Cuotas` (mensuales). Estas reciben `Pagos` realizados por el socio, los cuales quedan con un `EstadoValidacionPago` (Pendiente, Aprobado, Rechazado) hasta que un admin los verifica.
*   **Taller & InscripcionTaller:** Catálogo de talleres con gestión de cupos, modalidades (Virtual/Presencial) y horarios. Los socios pueden inscribirse y el modelo restringe duplicados.
*   **ContenidoTaller:** Mini-LMS (Learning Management System) integrado, permitiendo asociar archivos, videos o links externos a un taller.
*   **Noticia & NoticiaRedSocial:** Módulo de blog/novedades con capacidad para marcar si se ha distribuido en redes sociales (TikTok, YouTube, Instagram, LinkedIn).
*   **Patrones Singleton (ConfiguracionCooperativa y ContenidoNosotros):** Tablas diseñadas para tener un solo registro con datos globales editables por el administrador (ej. CBU, alias, valor de la cuota o contenido de la landing page).
*   **ChatbotRespuesta:** Manejo dinámico de palabras clave y sus respuestas para alimentar el bot de asistencia al cliente.

## 5. Funcionalidades Clave y Flujos Implementados
1.  **Onboarding y Gestión de Socios:** Un socio puede solicitar la adhesión públicamente. El administrador la revisa, la aprueba y se genera de forma automática una credencial temporal.
2.  **Sistema de Cobranza Dinámico:** El socio sube comprobantes de transferencia. El admin recibe notificaciones (o visualiza el listado de pendientes), validando y aprobando el pago. Si es rechazado, el socio recibe la justificación y puede subir otro.
3.  **Talleres Intervivos:** Los cupos se descuentan en tiempo real. Un socio puede inscribirse y también darse de baja (limitado a las 48hs de haberse inscripto). Los profesores/admins pueden subir material de estudio de múltiples tipos.
4.  **Desactivación Segura:** Cuando un admin da de baja a un socio, el sistema invalida su sesión activa de inmediato a nivel base de datos al ser validado por los layouts protegidos.
5.  **Gestión de Contenido:** El admin puede publicar contenido institucional, actualizar el frontend desde el CMS nativo, y mantener un blog de noticias.

## 6. Siguientes Pasos de Mejora (Deuda Técnica / Features)
Basado en la estructura actual del proyecto (`README.md`):
*   **Migración de Storage:** Actualmente usa `/public/uploads` localmente. Se necesita adaptar a S3 o Cloudinary.
*   **Integración de API de Redes:** Conectar efectivamente la base de datos `NoticiaRedSocial` con las APIs de Meta, LinkedIn, etc., para autopublicación.
*   **Automatización de Emails:** Aprovechar la librería `resend` que está instalada para automatizar el envío de las credenciales, recordatorios de pago y confirmaciones de talleres.
*   **Invalidación de Sesiones Instantánea (NextAuth):** Implementar estrategias a base de datos de los JWT para una expiración absoluta en tiempo real sin requerir middleware adicional.

## Conclusión
La "Cooperativa Riojana" es un producto avanzado, bien segmentado, utilizando Next.js App Router a su máxima capacidad con renderizado híbrido. Cuenta con una base de datos normalizada sólida que permite escalar el proyecto sin sufrir bloqueos importantes en futuras iteraciones.
