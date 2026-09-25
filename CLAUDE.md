@AGENTS.md

# ManosCerca

Plataforma on-demand (estilo InDriver/Maxim) para servicios técnicos del hogar. Un **cliente** publica una solicitud (plomería, cerrajería, electricidad…), los **profesionales** cercanos envían cotizaciones y el cliente acepta una. El servicio avanza `pendiente → aceptado → en_progreso → completado` (o `cancelado`), y al terminar ambas partes se califican.

Estado actual: MVP en construcción. La UI está en español y pensada para móvil (PWA).

## Stack

- **Next.js 16** (App Router, TypeScript, React 19). Ojo: en Next 16 `middleware.ts` se llama `proxy.ts`. Antes de usar una API de Next, consulta `node_modules/next/dist/docs/`.
- **Tailwind CSS v4** + **shadcn/ui** (sobre **Base UI**, no Radix: usa la prop `render` en lugar de `asChild`; para enlaces con estilo de botón usa `buttonVariants`).
- **Supabase**: Postgres, Auth, Realtime y RLS. Integración con `@supabase/ssr`.
- **React Query** (`@tanstack/react-query`) para el estado del servidor en el cliente y **Zustand** solo para estado de UI local.

## Comandos

```bash
npm run dev          # servidor de desarrollo (http://localhost:3000)
npm run build        # build de producción
npm run lint         # ESLint
npm run typecheck    # tsc --noEmit
npm run db:types     # regenera src/types/database.ts (requiere `npx supabase link`)
npx shadcn@latest add <componente>   # agrega componentes de shadcn/ui
```

Variables de entorno: copia `.env.example` a `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).

## Estructura

```
src/
  app/                  rutas (App Router); Server Components por defecto
  components/ui/        componentes de shadcn (generados; no editar a mano salvo necesidad)
  components/           componentes propios de la app
  lib/supabase/         client.ts (navegador) · server.ts (RSC/Server Actions) · proxy.ts (sesión)
  stores/               stores de Zustand (solo estado de UI)
  types/database.ts     tipos de la BD (formato `supabase gen types`)
  proxy.ts              refresca la sesión y redirige a /login en rutas privadas
supabase/
  schema.sql            esquema inicial: tablas, índices, triggers, RPC, RLS, realtime
  config.toml           configuración del CLI de Supabase
```

## Autenticación

- Correo + contraseña con Supabase Auth. Server Actions en `src/lib/auth/actions.ts` (`signIn`, `signUp`, `signOut`) validadas con Zod (`src/lib/auth/schemas.ts`); los formularios usan `useActionState`.
- El registro envía `role`, `full_name` y `phone` en `options.data`; el trigger `handle_new_user` crea el perfil.
- `/auth/confirm` procesa los enlaces de correo (`token_hash` o `code`). Toda redirección con `next` pasa por `safeNextPath()`.
- En Server Components usa `getCurrentProfile()` / `requireProfile()` de `src/lib/auth/session.ts` (memoizados por petición).
- `src/proxy.ts`: sin sesión, las rutas no públicas redirigen a `/login?next=…`; con sesión, `/`, `/login` y `/registro` redirigen a `/inicio`.
- Rutas: `(auth)/` agrupa las pantallas públicas de acceso; `(app)/` agrupa las privadas.
- Por rol: el cliente usa `/inicio` y `/solicitudes/**`; el profesional, `/trabajos` (disponibles), `/trabajos/mios` y `/trabajos/[id]`. Protege cada página con `requireRole()`.

## Modelo de datos

- `profiles` (1:1 con `auth.users`, se crea por trigger al registrarse; `role` = `client | professional | admin` tomado de `raw_user_meta_data.role`, nunca admin).
- `categories`, `professional_categories` (especialidades de cada profesional).
- `service_requests` → `proposals` (una por profesional y solicitud) → `reviews` (una por participante y solicitud; un trigger actualiza `profiles.rating_avg/rating_count`).

## Convenciones

- **Seguridad en la BD, no en el cliente.** Toda regla de acceso vive en políticas RLS. Los campos sensibles (rol, verificación, rating, estados) no se pueden actualizar directamente: los estados cambian solo con las RPC `accept_proposal(p_proposal_id)` y `update_request_status(p_request_id, p_status)`.
- **Cambios de esquema**: cada cambio va en una migración nueva en `supabase/migrations/` (`npx supabase migration new <nombre>`); no reescribas `schema.sql`. Después, actualiza `src/types/database.ts`. Por ahora las migraciones se aplican a mano en el SQL Editor: avisa al usuario cuando haya una nueva.
- **`profiles.phone` es privado**: no se puede leer por la API (`select("*")` sobre `profiles` falla). Usa `PROFILE_COLUMNS` de `src/lib/auth/session.ts`, y las RPC `get_my_phone()` y `get_request_contact(p_request_id)` para el teléfono.
- `service_requests` y `proposals` tienen **dos** FKs entre sí (`proposals.request_id` y `service_requests.accepted_proposal_id`). Al embeber, especifica siempre la FK: `proposals!proposals_request_id_fkey(...)`; si no, PostgREST responde `PGRST201`.
- Crea un cliente de Supabase nuevo por petición en el servidor. En el proxy usa `auth.getClaims()`; nunca confíes en `getSession()` en el servidor.
- Para leer datos, prefiere Server Components; para mutaciones, Server Actions. Los botones de acción usan `<ActionButton action={accion.bind(null, id)} />`, que se encarga de la confirmación, el estado pendiente y el toast.
- Tiempo real: `<RealtimeRefresh channel subscriptions />` hace `router.refresh()` cuando cambian las filas suscritas (Realtime respeta RLS). React Query queda para estado de servidor puramente cliente.
- Región: Colombia. Moneda COP sin decimales; formatea con `formatCurrency` de `src/lib/format.ts`.
- Identificadores de código y de BD en inglés (`snake_case` en SQL, `camelCase` en TS, `PascalCase` en componentes). Los textos visibles y los valores de estado del dominio van en español.
- Archivos en `kebab-case.tsx`. Importa con el alias `@/`. Nada de `any`: usa los tipos de `@/types/database` (`Tables<"proposals">`, `Enums<"request_status">`).
- Diseña mobile-first; la app se usa principalmente en el teléfono.
- Antes de dar algo por terminado: `npm run lint && npm run typecheck`.
