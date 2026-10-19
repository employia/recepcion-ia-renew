// Legal documents the user must accept before entering the office.
// Bump LEGAL_VERSION whenever either document changes materially: everyone is
// then asked to accept again. While it stays the same, an acceptance already
// recorded is never asked for twice.
export const LEGAL_VERSION = "2026-10-18"

export const LEGAL_DOCS = ["terms", "privacy"] as const
export type LegalDoc = (typeof LEGAL_DOCS)[number]

export const LEGAL_PATH: Record<LegalDoc, string> = {
  terms: "/terminos",
  privacy: "/privacidad",
}

export const LEGAL_CONTACT = "employiahq@gmail.com"

// Display date of the current version.
export const LEGAL_UPDATED = "18 de octubre de 2026"
