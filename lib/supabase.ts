import { createClient } from "@supabase/supabase-js"

// Publishable (public) credentials: safe to ship to the browser. Access is
// governed by Row Level Security in the database, not by hiding these.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export const supabaseConfigured = Boolean(url && key)

export const supabase = createClient(
  url ?? "http://localhost:54321",
  key ?? "missing-publishable-key",
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } },
)

/** Translate Supabase auth errors into plain Spanish for the interface. */
export function authErrorMessage(error: { message?: string; code?: string } | null): string {
  if (!error) return ""
  const code = error.code ?? ""
  const msg = (error.message ?? "").toLowerCase()
  if (code === "invalid_credentials" || msg.includes("invalid login credentials"))
    return "Correo o contraseña incorrectos."
  if (code === "email_not_confirmed" || msg.includes("email not confirmed"))
    return "Confirme su correo: le enviamos un enlace de verificación."
  if (code === "over_request_rate_limit" || code === "over_email_send_rate_limit" || msg.includes("rate limit"))
    return "Demasiados intentos. Espere unos minutos e intente de nuevo."
  if (msg.includes("failed to fetch") || msg.includes("network"))
    return "No pudimos conectar. Revise su conexión a internet."
  return "No pudimos completar la operación. Intente de nuevo."
}
