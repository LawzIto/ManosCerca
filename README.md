# ManosCerca

Plataforma on-demand para pedir técnicos del hogar (plomeros, cerrajeros, electricistas…) y recibir cotizaciones de profesionales cercanos.

**Stack:** Next.js 16 · TypeScript · Tailwind CSS v4 · shadcn/ui · Supabase · React Query · Zustand

## Puesta en marcha

1. Instala dependencias: `npm install`
2. Crea un proyecto en [Supabase](https://supabase.com) y, en el **SQL Editor**, ejecuta `supabase/schema.sql` y luego cada archivo de `supabase/migrations/` en orden.
3. Copia `.env.example` a `.env.local` y completa la URL y la publishable key del proyecto.
4. Arranca: `npm run dev` → http://localhost:3000

## Autenticación (Supabase Dashboard)

- **Authentication → URL Configuration**: define *Site URL* (`http://localhost:3000` en desarrollo) y agrega `http://localhost:3000/**` a *Redirect URLs*.
- **Authentication → Email Templates → Confirm signup**: para que el enlace funcione aunque se abra en otro navegador o dispositivo, usa:

  ```html
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/inicio">Confirmar mi cuenta</a>
  ```

- En desarrollo puedes desactivar *Confirm email* (Authentication → Sign In / Providers → Email) para entrar sin confirmar el correo.

Consulta `CLAUDE.md` para ver la arquitectura, el modelo de datos y las convenciones.
