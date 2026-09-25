import type { AuthError } from "@supabase/supabase-js";

const MESSAGES: Record<string, string> = {
  invalid_credentials: "Correo o contraseña incorrectos.",
  email_not_confirmed: "Confirma tu correo antes de ingresar. Revisa tu bandeja de entrada.",
  user_already_exists: "Ya existe una cuenta con este correo.",
  email_exists: "Ya existe una cuenta con este correo.",
  weak_password: "La contraseña es demasiado débil. Usa una más larga o variada.",
  email_address_invalid: "Ingresa un correo válido.",
  over_email_send_rate_limit: "Demasiados intentos. Espera unos minutos y vuelve a intentar.",
  over_request_rate_limit: "Demasiados intentos. Espera unos minutos y vuelve a intentar.",
  otp_expired: "El enlace expiró o ya fue usado. Solicita uno nuevo.",
};

/** Traduce un error de Supabase Auth a un mensaje para el usuario. */
export function authErrorMessage(error: AuthError): string {
  return (error.code && MESSAGES[error.code]) || "Ocurrió un error. Intenta de nuevo.";
}
