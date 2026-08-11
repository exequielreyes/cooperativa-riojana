# Cooperativa Riojana

Next.js 14 (App Router) + TailwindCSS + Prisma/MySQL, basado en los
prototipos de Figma (sitio institucional, portal del socio y panel de
administración).

## Stack

- **Next.js 14** (App Router, TypeScript)
- **TailwindCSS** (tokens de diseño en `tailwind.config.ts`)
- **Prisma + MySQL** (esquema completo en `prisma/schema.prisma`)
- **NextAuth** (credentials provider, roles SOCIO / SUPER_ADMIN / EDITOR_CONTENIDOS)

## Cómo correrlo localmente

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# completar DATABASE_URL con tus credenciales de MySQL
# generar un NEXTAUTH_SECRET, por ejemplo: openssl rand -base64 32

# 3. Crear la base de datos y aplicar el esquema
npx prisma migrate dev --name init

# 4. Cargar datos de prueba (admin + socio + taller + noticia)
npm run db:seed

#5.
npx prisma db push


# 6. Levantar el servidor de desarrollo
npm run dev
```

La app queda en `http://localhost:3000`.

### Credenciales de prueba (después de `npm run db:seed`)

| Rol   | Usuario                     | Contraseña  |
|-------|------------------------------|-------------|
| Admin | admin@cooperativa.com        | cambiar123  |
| Socio | juan.perez@example.com       | cambiar123  |

## Estructura de carpetas

```
src/
  app/
    (public)/        -- sitio institucional: inicio, noticias, talleres, proyectos, asociarme, login
    (socio)/portal/   -- portal del socio: dashboard, perfil, grupo familiar, pagos, talleres, configuración
    (admin)/admin/    -- panel admin: métricas, socios, pagos, contenidos (noticias + redes sociales), configuración
    api/              -- rutas API (auth, socios, pagos, talleres, noticias, grupo-familiar)
    middleware.ts     -- protección de /portal/* y /admin/* según rol
  components/
    layout/           -- navbars y sidebar por sección
    ui/                -- Button, StatusBadge, LogoutButton
    admin/, socio/     -- componentes cliente específicos (formularios interactivos)
  lib/
    db.ts             -- cliente Prisma
    auth.ts           -- configuración de NextAuth (roles, JWT, callbacks)
    utils.ts          -- formateo de moneda/fecha
prisma/
  schema.prisma       -- modelo completo de datos
  seed.ts             -- datos de prueba
```

## Qué está funcionando de punta a punta

- **Login real** (NextAuth + credentials) con redirección según rol
  (`SOCIO` → `/portal`, resto → `/admin`) y rutas protegidas por middleware.
- **Alta de socio** desde el admin: crea `Usuario` + `Socio`, genera el ID de
  cooperativa correlativo y una contraseña temporal.
- **Grupo familiar**: alta y baja de asociados desde el portal del socio.
- **Reportar pago**: el socio sube un comprobante para su próxima cuota
  pendiente; queda en estado "En revisión".
- **Validar pagos**: el admin aprueba o rechaza desde el listado; al aprobar,
  la cuota pasa a `PAGADO` automáticamente.
- **Talleres**: listado público con cupos en tiempo real, inscripción desde
  el detalle del taller, y vista de "Mis Talleres" para el socio.
- **Métricas del admin** con agregados reales (socios activos, recaudación
  del mes, solicitudes pendientes, talleres activos) y **gráficos reales**
  (recharts) de tendencia de cobranza y nuevos socios de los últimos 6 meses.
- **Subida de archivos real**: comprobantes de pago e imágenes de noticias
  se guardan en `/public/uploads` (ver `src/lib/storage.ts`). Es un adaptador
  simple para desarrollo local — migrar a S3/Cloudinary sólo implica
  reescribir esa función; el resto de la app no cambia.
- **Publicar / Despublicar noticias** desde "Contenidos Recientes" en el
  panel admin.
- **Perfil y contraseña del socio**: desde `/portal/configuracion` el socio
  puede cambiar su nombre/teléfono y su contraseña (validando la actual).
- **Aprobación de solicitudes de socio**: la contraseña temporal ya NO se
  genera al crear la solicitud pública (`/asociarme`) sino recién cuando el
  admin la **aprueba** desde "Gestión de Socios" — ahí se muestra en un
  modal para compartírsela al socio.
- **Gestión de Talleres** (`/admin/talleres`): el admin ve las inscripciones
  pendientes y puede **confirmarlas o rechazarlas**, además de un resumen de
  cupos por taller.
- **Baja de taller dentro de 2 días**: el socio puede darse de baja de un
  taller desde "Mis Talleres" únicamente dentro de las 48hs de haberse
  inscripto (se valida también en el servidor, no sólo en la UI).
- **Material de estudio**: cada taller puede tener un link de material
  (cargado por el admin al crearlo) que el socio ve en "Mis Talleres".
- **Foto de perfil** del socio, editable desde Configuración.
- **Grupo familiar con contacto**: cada asociado puede tener email y celular.
- **Vista de perfil de socio en el admin** (`/admin/socios/[id]`): datos de
  contacto, deuda total, cuotas pendientes (con botón para marcar como
  pagadas en efectivo) y grupo familiar con su contacto.
- **Cambiar contraseña cierra la sesión** automáticamente para que el socio
  vuelva a entrar con la nueva.
- **Dar de baja bloquea el acceso**: al pasar a "Inactivo" se desactiva el
  usuario (`Usuario.activo = false`), lo que impide un nuevo login; además
  los layouts protegidos revalidan esto contra la base en cada carga de
  página, así que una sesión ya abierta también queda cortada.
- **Solicitud pública de asociación** con los mismos campos que "Añadir
  Nuevo Socio" del admin (teléfono, región, tipo de miembro).
- **Datos de transferencia (CBU/alias)** configurables, mostrados al socio
  cuando elige "Transferencia" en Reportar Pago.
- **Monto de cuota configurable**: desde Gestión de Pagos el admin puede
  actualizar el precio de la cuota social y generar la cuota del mes para
  todos los socios activos de un solo paso.
- **Botón "Volver"** en todas las subpáginas del portal del socio, para
  regresar al panel principal.

## Qué falta (próximos pasos sugeridos)

1. **Storage en la nube**: reemplazar `src/lib/storage.ts` (hoy guarda en
   `/public/uploads`) por un adaptador a S3/Cloudinary para producción.
2. **Publicación real en redes sociales**: `NoticiaRedSocial` guarda la
   intención de publicar en cada red; falta integrar las APIs de Meta,
   TikTok, YouTube y LinkedIn para publicar y actualizar `estadoPublicacion`
   (hay un TODO marcado en `src/app/api/noticias/[id]/route.ts`).
3. **Envío de credenciales por email**: hoy se muestran en pantalla al admin
   (tanto al crear un socio como al aprobar una solicitud).
4. **Configuración del sistema** (`/admin/configuracion`): sigue con datos
   de ejemplo; el CBU/alias hoy sólo se puede cargar por seed o directo en
   la base — falta una pantalla para editarlos (la de monto de cuota sí está).
5. **Preferencias de notificaciones** del socio: son visuales, no están
   conectadas a un envío real todavía.
6. **Invalidación instantánea de sesión**: al dar de baja a un socio, se
   revalida contra la base en cada carga de página (por eso ya no puede
   *navegar*), pero el JWT en sí sigue siendo técnicamente válido hasta que
   expire — para invalidación 100% instantánea habría que pasar a estrategia
   de sesión por base de datos.


