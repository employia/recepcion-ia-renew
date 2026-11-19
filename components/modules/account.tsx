"use client"

import { ChevronRight, LogOut, Mail, Monitor, Moon, Sun, type LucideIcon } from "lucide-react"
import { useApp } from "@/lib/store"
import { LEGAL_PATH } from "@/lib/legal"
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

      <button
        onClick={signOut}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium press hover:bg-secondary"
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </button>
    </div>
  )
}

const THEME_OPTIONS: { id: ThemePreference; label: string; icon: LucideIcon }[] = [
  { id: "light", label: "Claro", icon: Sun },
  { id: "dark", label: "Oscuro", icon: Moon },
  { id: "system", label: "Sistema", icon: Monitor },
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
              className={`press flex min-h-11 items-center justify-center gap-2 rounded-xl px-2 text-sm font-medium ${
                selected
                  ? "bg-card text-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{label}</span>
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
