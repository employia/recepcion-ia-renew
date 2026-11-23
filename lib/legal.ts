// Legal documents the user must accept before entering the office.
// The version that is currently in force lives in the database (table
// public.legal_document_versions) and is returned by the RPC
// legal_acceptance_status(): to ask everyone to accept again after a material
// change, update current_version there (no redeploy needed). The date below is
// only a display fallback.
export const LEGAL_VERSION = "2026-10-18"

export const LEGAL_DOCS = ["terms", "privacy"] as const
export type LegalDoc = (typeof LEGAL_DOCS)[number]

export const LEGAL_PATH: Record<LegalDoc, string> = {
  terms: "/terminos",
  privacy: "/privacidad",
}

export const COOKIE_POLICY_PATH = "/cookies"

export const LEGAL_CONTACT = "employiahq@gmail.com"

// Display date of the current version.
export const LEGAL_UPDATED = "18 de octubre de 2026"

// Sentinel cookie: set when the person accepts. If a signed-in person has a
// valid acceptance but the sentinel is missing, their cookies were cleared
// outside the app (e.g. from the browser settings), so the acceptance is reset.
// The "renew-" prefix makes the in-app "delete cookies" action remove it too.
export const LEGAL_SENTINEL_COOKIE = "renew-legal-ack"

export function setLegalSentinel() {
  try {
    document.cookie = `${LEGAL_SENTINEL_COOKIE}=1; Max-Age=31536000; path=/; SameSite=Lax${
      location.protocol === "https:" ? "; Secure" : ""
    }`
  } catch {
    // Cookies may be unavailable in restricted browser contexts.
  }
}

export function hasLegalSentinel(): boolean {
  try {
    return document.cookie.split(";").some((c) => c.trim().startsWith(`${LEGAL_SENTINEL_COOKIE}=`))
  } catch {
    return true // cannot tell: never reset on a guess
  }
}
