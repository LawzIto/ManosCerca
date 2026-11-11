# 📋 Informe Técnico de Auditoría y Handoff de Seguridad

**Proyecto:** ManosCerca (PWA On-Demand para Servicios Técnicos Locales)  
**Fecha de Intervención:** 2026-11-10  
**Objetivo:** Reporte detallado de remediaciones de seguridad, cambios estructurales, aplicación de migraciones y estado de validación para revisión de control de calidad (QA / Senior AppSec).

---

## 1. 📂 Estructura del Proyecto

Mapa arquitectónico de los módulos clave del repositorio (excluyendo artefactos de compilación y dependencias como `.next`, `node_modules` y `.git`):

```text
ManosCerca/
├── public/                     # Assets estáticos, PWA icons, branding y Service Worker (sw.js)
├── scripts/                    # Scripts auxiliares en Node.js (generación y redimensionamiento de iconos)
├── src/
│   ├── app/                    # Next.js App Router (Páginas, layouts y rutas API)
│   │   ├── (app)/              # Rutas autenticadas de la aplicación
│   │   │   ├── historial/      # Historial de servicios completados/cancelados
│   │   │   ├── inicio/         # Dashboard / página principal según rol (cliente/profesional)
│   │   │   ├── notificaciones/ # Bandeja de notificaciones in-app
│   │   │   ├── perfil/         # Configuración de perfil, especialidades y zona de trabajo
│   │   │   ├── solicitudes/    # Vistas de cliente: crear y ver detalle de solicitudes
│   │   │   └── trabajos/       # Vistas de profesional: feed de trabajos disponibles y mis trabajos
│   │   ├── (auth)/             # Flujo de autenticación (Login y Registro)
│   │   ├── auth/confirm/       # Callback handler para confirmación de correos
│   │   └── layout.tsx          # Layout raíz con proveedores y estructura base
│   ├── components/             # Componentes React (Client y Server Components)
│   │   ├── auth/               # Formularios de inicio de sesión y registro
│   │   ├── brand/              # Logotipos, isotipos y banner de confianza
│   │   ├── jobs/               # Tarjetas y listados de trabajos para profesionales
│   │   ├── notifications/      # Componentes de escucha en tiempo real y campana
│   │   ├── profile/            # Formularios de edición de datos, especialidades y mapa de radio
│   │   ├── proposals/          # Formularios de envío y gestión de cotizaciones
│   │   ├── push/               # Toggle e inicialización de notificaciones Web Push
│   │   ├── requests/           # Stepper, subida de imágenes, tarjetas y resumen de solicitudes
│   │   ├── reviews/            # Formularios y visualización de valoraciones y estrellas
│   │   ├── tracking/           # Seguimiento GPS (WorkerTracker y ClientTrackingMap)
│   │   └── ui/                 # Primitivas de UI estilizadas con Tailwind CSS
│   ├── hooks/                  # Custom React Hooks (ej. useGeolocation)
│   ├── lib/                    # Lógica de dominio, Server Actions, esquemas y utilidades
│   │   ├── auth/               # Server Actions de autenticación, sesión y esquemas Zod
│   │   ├── notifications/      # Server Actions para actualización de estado de notificaciones
│   │   ├── profile/            # Server Actions y esquemas de perfil y zona de trabajo
│   │   ├── proposals/          # Server Actions y esquemas de cotizaciones
│   │   ├── push/               # Server Actions y cliente Web Push para navegadores
│   │   ├── requests/           # Server Actions, esquemas de solicitudes y signed URLs
│   │   ├── reviews/            # Server Actions y esquemas de calificaciones
│   │   ├── security/           # Validadores transversales de seguridad (UUID, Magic Bytes, sanitización)
│   │   └── supabase/           # Instanciación de clientes Supabase (browser, server SSR y proxy)
│   ├── stores/                 # Estado global de cliente en memoria (Zustand)
│   └── types/                  # Definiciones TypeScript autogeneradas de la base de datos Supabase
└── supabase/                   # Configuración y assets de Supabase Local y Cloud
    ├── functions/              # Edge Functions en Deno (send-push para Web Push con VAPID)
    ├── migrations/             # Migraciones SQL incrementales para PostgreSQL y RLS
    ├── config.toml             # Configuración del entorno Supabase CLI
    └── schema.sql              # Esquema SQL inicial de referencia
```

---

## 2. 📝 Registro Detallado de Cambios

### 2.1. Archivos Eliminados
- **`supabase/functions/.env`**: Se eliminó del árbol de trabajo local para impedir la exposición o fuga accidental de la clave privada VAPID (`VAPID_PRIVATE_KEY`), el asunto de contacto (`VAPID_SUBJECT`) y el secreto del webhook (`PUSH_WEBHOOK_SECRET`).

---

### 2.2. Archivos Creados

#### 1. `supabase/migrations/20261110200000_security_audit_fixes.sql`
- **Propósito:** Consolida los parches a nivel de base de datos (PostgreSQL, RLS y triggers) para mitigar cuatro vulnerabilidades prioritarias:
  - `CRÍTICA-2`: Convierte el bucket `request-images` a privado (`public = false`) y restringe la política `SELECT` en `storage.objects` a participantes autenticados (el cliente dueño o profesionales registrados).
  - `ALTA-1`: Restringe la política de lectura de `tracking_locations` exclusivamente a servicios con estados `'aceptado'` o `'en_progreso'`. Añade el trigger `cleanup_tracking_on_complete` que elimina el registro de posición GPS en cuanto el servicio cambia a `'completado'` o `'cancelado'`.
  - `ALTA-2`: Refuerza la política `proposals: lectura contextual` como defensa en profundidad, garantizando que un profesional asignado nunca pueda leer propuestas de competidores descartadas.
  - `MEDIA-5`: Introduce la función y trigger `zzz_service_requests_reject_orphans` que marca automáticamente como `'rechazada'` cualquier propuesta que entre por race condition después de que una solicitud haya dejado el estado `'pendiente'`.

#### 2. `src/lib/security/validators.ts`
- **Propósito:** Provee funciones puras reutilizables para sanitización e inspección de seguridad:
  - `isValidUuid(value: unknown)`: Valida tipos UUID v4/v7 con Zod.
  - `sanitizeRequestImageUrls(rawUrls: FormDataEntryValue[])`: Garantiza que los paths almacenados provengan del bucket `request-images` del proyecto o cumplan con la convención interna `<uid>/<filename>.(ext)`, limitando a un máximo de 4 imágenes.
  - `hasValidImageMagicBytes(file: File)`: Inspecciona los primeros 12 bytes del archivo para corroborar firmas binarias legítimas (JPEG: `FF D8 FF`, PNG: `89 50 4E 47`, GIF: `47 49 46 38`, WEBP: `RIFF....WEBP`).

#### 3. `src/lib/requests/signed-images.ts`
- **Propósito:** Resuelve la privacidad de las fotos de daños (`CRÍTICA-2`). Proporciona la función `getSignedRequestImages(urls)` que extrae la ruta interna y genera Signed URLs temporales (15 minutos de caducidad) a través del cliente de servidor de Supabase, evitando URLs públicas permanentes.

---

### 2.3. Archivos Modificados

#### 1. `.gitignore`
- **Ruta:** `.gitignore`
- **Justificación (`CRÍTICA-1`):** Añadir exclusión explícita para evitar que `supabase/functions/.env` sea añadido a git ante comandos como `git add .` o configuraciones permisivas de IDE.

#### 2. `supabase/config.toml`
- **Ruta:** `supabase/config.toml`
- **Justificación (`MEDIA-1`, `BAJA-2`):** Fortalecer políticas de autenticación (`minimum_password_length = 8`, `password_requirements = "letters_digits"`, `secure_password_change = true`) y documentar el recordatorio para `enable_confirmations = true` en producción.

#### 3. `next.config.ts`
- **Ruta:** `next.config.ts`
- **Justificación (`BAJA-3`, `CRÍTICA-2`):** Eliminar el hostname fijo/hardcodeado de Supabase y permitir la carga de imágenes optimizadas tanto desde rutas públicas (`/public/**`) como firmadas (`/storage/v1/object/**`).

#### 4. `src/lib/proposals/actions.ts`
- **Ruta:** `src/lib/proposals/actions.ts`
- **Justificación (`ALTA-3`, `ALTA-4`):** Validar formato UUID en identificadores y blindar `withdrawProposal` contra Broken Object Level Authorization (BOLA), validando explícitamente `professional_id = profile.id` en el servidor y verificando el conteo de filas afectadas.

#### 5. `src/lib/requests/actions.ts`
- **Ruta:** `src/lib/requests/actions.ts`
- **Justificación (`ALTA-4`, `MEDIA-2`):** Sanitizar URLs de imágenes entrantes en `createServiceRequest` para evitar inyección de URLs maliciosas externas, y validar el formato UUID en `cancelServiceRequest`, `acceptProposal` y `updateJobStatus`.

#### 6. `src/app/(app)/solicitudes/[id]/page.tsx` y `src/app/(app)/trabajos/[id]/page.tsx`
- **Rutas:**
  - `src/app/(app)/solicitudes/[id]/page.tsx`
  - `src/app/(app)/trabajos/[id]/page.tsx`
- **Justificación (`CRÍTICA-2`):** Convertir las rutas privadas de imágenes de la solicitud en Signed URLs temporales mediante `getSignedRequestImages()` antes de renderizarlas en el componente visual `<RequestSummary />`.

#### 7. `src/components/requests/image-uploader.tsx` y `src/lib/profile/actions.ts`
- **Rutas:**
  - `src/components/requests/image-uploader.tsx`
  - `src/lib/profile/actions.ts`
- **Justificación (`MEDIA-3`, Calidad / Fugas de Memoria):**
  - Validar Magic Bytes de archivos en subida de fotos de daños y de avatares.
  - Normalizar extensión mediante mapa `MIME_TO_EXT` (`file.type`) en vez de confiar en `file.name`.
  - Liberar URLs en memoria mediante `URL.revokeObjectURL(removed.previewUrl)` en `removeImage`.

#### 8. `supabase/migrations/20260925000000_protect_phone_and_requote.sql`
- **Ruta:** `supabase/migrations/20260925000000_protect_phone_and_requote.sql`
- **Justificación:** Idempotencia en sentencias SQL. Se corrigió `drop policy` para incluir `if exists`, previniendo errores durante la sincronización inicial con bases de datos que no contaban con la política previa.

#### 9. Limpieza de ESLint en Tracking y Configuración
- **Rutas:**
  - `eslint.config.mjs`: Añadido `"scripts/**"` a `globalIgnores`.
  - `src/components/tracking/client-tracking-map.tsx`: Eliminados imports y props no utilizados.
  - `src/components/tracking/worker-tracker.tsx`: Eliminado icono no usado `LoaderCircle`.

---

## 3. 🔍 Comprobación y Verificaciones Realizadas

### 3.1. Estado de la Base de Datos Remota
- **Reparación del historial de migraciones:** Las migraciones previas que ya existían en el esquema remoto (`20260925000000` a `20261108010000`) fueron marcadas como `applied` en `supabase_migrations.schema_migrations`.
- **Despliegue de la migración de seguridad:** Se ejecutó `npx supabase db push` exitosamente, aplicando `20261110200000_security_audit_fixes.sql`.
- **Regeneración de tipos TypeScript:** Se ejecutó `npm run db:types`, actualizando `src/types/database.ts` con la base de datos remota sincronizada.

### 3.2. Pruebas Automatizadas

| Verificación | Comando | Resultado |
|---|---|---|
| **Chequeo de Tipos TypeScript** | `npm run typecheck` (`tsc --noEmit`) | **Exitoso (Exit code 0)** — 0 errores de tipos en todo el proyecto. |
| **Análisis Estático de Código** | `npm run lint` (`eslint`) | **Exitoso (Exit code 0)** — 0 errores, 0 advertencias. |
| **Historial de Migraciones Supabase** | `npx supabase migration list` | **100% Sincronizado** — Todas las 8 migraciones marcadas como `applied` local y remotamente. |
| **Control de Fugas de Secretos** | `git ls-files --error-unmatch supabase/functions/.env` | **Exitoso** — El archivo no está rastreado por Git. |

---

### 3.3. Acciones Finales Recomendadas en Producción
1. **Rotación de Credenciales VAPID:** Como buena práctica post-auditoría, rotar el par de claves VAPID y el webhook secret en el dashboard de Supabase Vault / Secrets si alguna vez estuvieron en un entorno compartido.
2. **Confirmación de Correo:** Asegurar que en el panel de Supabase Auth en Producción la opción **"Enable email confirmations"** se encuentre activa (`true`).

