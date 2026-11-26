"use client"

import { useEffect, useRef, useState } from "react"
import { ChevronRight, LogOut, Mail, Moon, Palette, Sun, Trash2, type LucideIcon } from "lucide-react"
import { useApp } from "@/lib/store"
import { COOKIE_POLICY_PATH, LEGAL_PATH } from "@/lib/legal"
import { supabase } from "@/lib/supabase"
import { useTheme, type ThemePreference } from "@/lib/theme"

const SUPPORT_EMAIL = "employiahq@gmail.com"
const SUPPORT_SUBJECT = "Soporte de Recepción Digital · Renew"

/**
 * On a phone, mailto: opens the Gmail (or mail) app. On a computer it usually
 * does nothing when no mail program is set up, so there we open Gmail's
 * compose window on the web instead.
 */
function openSupportEmail(e: React.MouseEvent<HTMLAnchorElement>) {
  const isPhone = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
  if (isPhone) return // let the mailto: link work
  e.preventDefault()
  const url =
    "https://mail.google.com/mail/?view=cm&fs=1" +
    `&to=${encodeURIComponent(SUPPORT_EMAIL)}&su=${encodeURIComponent(SUPPORT_SUBJECT)}`
  window.open(url, "_blank", "noopener,noreferrer") // new tab: the office stays open
}

export function AccountModule() {
  const { signOut } = useApp()
  const [confirmClear, setConfirmClear] = useState(false)
  const [clearing, setClearing] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [confirmSignOut, setConfirmSignOut] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const signOutDialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (confirmClear && !dialog.open) dialog.showModal()
    if (!confirmClear && dialog.open) dialog.close()
  }, [confirmClear])

  useEffect(() => {
    const dialog = signOutDialogRef.current
    if (!dialog) return
    if (confirmSignOut && !dialog.open) dialog.showModal()
    if (!confirmSignOut && dialog.open) dialog.close()
  }, [confirmSignOut])

  async function confirmAndSignOut() {
    if (signingOut) return
    setSigningOut(true)
    try {
      await signOut()
    } finally {
      setSigningOut(false)
      setConfirmSignOut(false)
    }
  }

  async function clearCookiesAndLocalData() {
    if (clearing) return
    setClearing(true)
    try {
      // Record the reset while the session is still valid; the next sign-in
      // will then require accepting the legal documents again.
      await supabase.rpc("reset_legal_acceptance", { p_reason: "cookies_cleared_by_user" })
    } catch {
      // If it fails, the missing sentinel cookie triggers the reset at next sign-in.
    }
    try {
      await signOut()
    } catch {
      // Local session data is still removed below if Supabase is unreachable.
    } finally {
      const prefixes = ["renew-", "sb-"]
      try {
        for (const storage of [localStorage, sessionStorage]) {
          const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index))
          for (const key of keys) {
            if (key && prefixes.some((prefix) => key.startsWith(prefix))) storage.removeItem(key)
          }
        }
      } catch {
        // Browser storage may be unavailable; Supabase sign-out was still attempted.
      }

      try {
        const cookieNames = document.cookie
          .split(";")
          .map((cookie) => cookie.trim().split("=")[0])
          .filter((name) => prefixes.some((prefix) => name.startsWith(prefix)))
        for (const name of cookieNames) {
          document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`
          document.cookie = `${name}=; Max-Age=0; path=/; domain=${location.hostname}; SameSite=Lax`
        }
      } catch {
        // Cookies may be unavailable in restricted browser contexts.
      }

      window.location.replace("/")
    }
  }

  return (
    <div className="space-y-6">
      {/* Organization */}
      <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/renew-symbol.svg" alt="" aria-hidden className="h-14 w-auto shrink-0" />
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Organización</p>
          <p className="truncate font-serif text-2xl font-medium tracking-tight">Renew</p>
        </div>
      </div>

      <div className="space-y-2.5">
        <Field label="Producto" value="Recepción Digital" />
        <Field label="Versión" value="Demostración" />
      </div>

      <Appearance />

      {/* Support */}
      <section className="space-y-2.5">
        <h3 className="text-sm font-semibold">
          Soporte
        </h3>
        <div className="rounded-2xl border border-border/60 bg-card p-4">
          <p className="text-sm font-semibold">EMPLOYIA</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Soporte de la recepción digital</p>
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(SUPPORT_SUBJECT)}`}
            onClick={openSupportEmail}
            className="mt-3 inline-flex max-w-full items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium press hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{SUPPORT_EMAIL}</span>
          </a>
        </div>
      </section>

      {/* Legal */}
      <section className="space-y-2.5">
        <h3 className="text-sm font-semibold">
          Información legal
        </h3>
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
          {[
            { href: LEGAL_PATH.terms, label: "Términos y Condiciones de Uso" },
            { href: LEGAL_PATH.privacy, label: "Política de Privacidad" },
            { href: COOKIE_POLICY_PATH, label: "Política de cookies" },
          ].map((d, i) => (
            <a
              key={d.href}
              href={d.href}
              className={`flex items-center justify-between gap-3 px-4 py-3 text-sm press hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
                i > 0 ? "border-t border-border/60" : ""
              }`}
            >
              <span>{d.label}</span>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </a>
          ))}
        </div>
      </section>

      <section className="space-y-2.5">
        <button
          type="button"
          onClick={() => setConfirmClear(true)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium press hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Trash2 className="h-4 w-4 text-muted-foreground" />
          Eliminar cookies y datos locales
        </button>
        <p className="px-1 text-xs leading-relaxed text-muted-foreground">
          Elimina la sesión y las preferencias guardadas en este navegador. No borra información de Renew ni datos del servidor.
        </p>
      </section>

      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => setConfirmSignOut(true)}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium press hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </button>

      <dialog
        ref={signOutDialogRef}
        aria-labelledby="sign-out-title"
        aria-describedby="sign-out-description"
        onCancel={(event) => {
          if (signingOut) event.preventDefault()
          else setConfirmSignOut(false)
        }}
        onClose={() => setConfirmSignOut(false)}
        className="confirm-dialog m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-card p-0 text-card-foreground shadow-float backdrop:bg-foreground/30"
      >
        <div className="p-5">
          <h3 id="sign-out-title" className="text-base font-semibold">Cerrar sesión</h3>
          <p id="sign-out-description" className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Saldrá de la cuenta administrativa y volverá a la pantalla de inicio de sesión. La información de Renew y las preferencias de este navegador se conservan.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              disabled={signingOut}
              onClick={() => setConfirmSignOut(false)}
              className="rounded-xl border border-border px-3 py-2 text-sm font-medium press hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={signingOut}
              onClick={() => void confirmAndSignOut()}
              className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground press hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
            >
              {signingOut ? "Cerrando sesión…" : "Cerrar sesión"}
            </button>
          </div>
        </div>
      </dialog>

      <dialog
        ref={dialogRef}
        aria-labelledby="clear-data-title"
        aria-describedby="clear-data-description"
        onCancel={() => setConfirmClear(false)}
        onClose={() => setConfirmClear(false)}
        className="confirm-dialog m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-card p-0 text-card-foreground shadow-float backdrop:bg-foreground/30"
      >
        <div className="p-5">
          <h3 id="clear-data-title" className="text-base font-semibold">Eliminar cookies y datos locales</h3>
          <p id="clear-data-description" className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Se cerrará la sesión administrativa y volverá a la pantalla de inicio de sesión. Solo se eliminarán las cookies propias de la aplicación y sus datos locales de este navegador; la información de Renew, los registros de actividad y la configuración del servidor no se modificarán.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              disabled={clearing}
              onClick={() => setConfirmClear(false)}
              className="rounded-xl border border-border px-3 py-2 text-sm font-medium press hover:bg-secondary disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="button"
              disabled={clearing}
              onClick={() => void clearCookiesAndLocalData()}
              className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground press hover:opacity-90 disabled:opacity-60"
            >
              {clearing ? "Eliminando…" : "Eliminar y cerrar sesión"}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  )
}

const THEME_OPTIONS: { id: ThemePreference; label: string; icon: LucideIcon }[] = [
  { id: "light", label: "Claro", icon: Sun },
  { id: "dark", label: "Oscuro", icon: Moon },
  { id: "default", label: "Predeterminado", icon: Palette },
]

function Appearance() {
  const { preference, setPreference } = useTheme()
  return (
    <section className="space-y-2.5">
      <h3 id="appearance-title" className="text-sm font-semibold">
        Apariencia
      </h3>
      <div
        role="radiogroup"
        aria-labelledby="appearance-title"
        className="grid grid-cols-3 gap-1 rounded-2xl border border-border/60 bg-secondary p-1"
      >
        {THEME_OPTIONS.map(({ id, label, icon: Icon }) => {
          const selected = preference === id
          return (
            <button
              key={id}
              role="radio"
              aria-checked={selected}
              onClick={() => setPreference(id)}
              className={`press flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-1.5 text-[13px] font-medium sm:flex-row sm:gap-2 sm:px-2 sm:text-sm ${
                selected
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="min-w-0 text-center [overflow-wrap:anywhere]">{label}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-3.5 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
