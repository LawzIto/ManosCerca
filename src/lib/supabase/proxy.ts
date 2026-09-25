import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { HOME_PATH } from "@/lib/auth/redirect";
import type { Database } from "@/types/database";

/** Rutas accesibles sin sesión. */
const PUBLIC_PATHS = ["/", "/login", "/registro", "/auth"];

/** Rutas que no tienen sentido con sesión iniciada: se redirige a HOME_PATH. */
const GUEST_ONLY_PATHS = ["/", "/login", "/registro"];

function matches(paths: string[], pathname: string) {
  return paths.some(
    (path) => pathname === path || (path !== "/" && pathname.startsWith(`${path}/`)),
  );
}

/** Refresca la sesión de Supabase en cada petición y protege rutas privadas. */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
        },
      },
    },
  );

  // No colocar lógica entre createServerClient y getClaims(): puede cerrar sesiones al azar.
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims);
  const { pathname } = request.nextUrl;

  // Las redirecciones deben conservar las cookies de sesión recién refrescadas.
  const redirectTo = (url: URL) => {
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  };

  if (!isSignedIn && !matches(PUBLIC_PATHS, pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", pathname + request.nextUrl.search);
    return redirectTo(url);
  }

  if (isSignedIn && matches(GUEST_ONLY_PATHS, pathname)) {
    return redirectTo(new URL(HOME_PATH, request.url));
  }

  return response;
}
