/** Ruta a la que se entra tras iniciar sesión. */
export const HOME_PATH = "/inicio";

/** Acepta solo rutas internas para evitar open redirects (`//evil.com`, `https://…`). */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return HOME_PATH;
  }
  return next;
}
