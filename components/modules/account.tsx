"use client"

import { LogOut, Mail } from "lucide-react"
import { useApp } from "@/lib/store"

const SUPPORT_EMAIL = "employiahq@gmail.com"
const SUPPORT_SUBJECT = "Soporte de Recepción Digital · Renew"

export function AccountModule() {
  const { signOut } = useApp()

  return (
    <div className="space-y-6">
      {/* Organization */}
      <div className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card/70 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/renew-symbol.svg" alt="" aria-hidden className="h-14 w-auto shrink-0" />
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Organización</p>
          <p className="truncate text-lg font-semibold tracking-tight">Renew</p>
        </div>
      </div>

      <div className="space-y-2.5">
        <Field label="Producto" value="Recepción Digital" />
        <Field label="Versión" value="Demostración" />
      </div>

      {/* Support */}
      <section className="space-y-2.5">
        <h3 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
          Soporte
        </h3>
        <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
          <p className="text-sm font-semibold">EMPLOYIA</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Soporte de la recepción digital</p>
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(SUPPORT_SUBJECT)}`}
            className="mt-3 inline-flex max-w-full items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium transition hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{SUPPORT_EMAIL}</span>
          </a>
        </div>
      </section>

      <button
        onClick={signOut}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-medium transition hover:bg-secondary"
      >
        <LogOut className="h-4 w-4" />
        Cerrar sesión
      </button>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/70 px-3.5 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
