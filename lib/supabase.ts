import { createClient } from "@supabase/supabase-js"

// Publishable (public) credentials: safe to ship to the browser. Access is
// governed by Row Level Security in the database, not by hiding these.
// Environment variables take priority (the Vercel <-> Supabase integration names
// the key NEXT_PUBLIC_SUPABASE_ANON_KEY, so both names are accepted); the public
// values of the "recepcion-digital-app" project are the fallback, so the login
// never depends on the hosting configuration. Literal references so Next.js can
// inline them.
const FALLBACK_URL = "https://scwhujwxpdijekzxmyco.supabase.co"
const FALLBACK_KEY = "sb_publishable_Oftr6ZkcsYxa-Lsry0wT0A_J1YScGvz"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  FALLBACK_KEY

export const supabaseConfigured = Boolean(url && key)

export const supabase = createClient(
  url,
  key,
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
