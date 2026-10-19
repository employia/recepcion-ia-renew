"use client"

import { useState } from "react"
import { ArrowRight, Loader2 } from "lucide-react"
import { useApp } from "@/lib/store"
import { LEGAL_PATH } from "@/lib/legal"

/** Shown after sign-in until the current version of both documents is accepted. */
export function LegalGate() {
  const { session, acceptLegal, signOut } = useApp()
  const [terms, setTerms] = useState(false)
  const [privacy, setPrivacy] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault()
    if (loading || !terms || !privacy) return
    setError("")
    setLoading(true)
    const result = await acceptLegal()
    // On success the app swaps this screen for the office.
    if (result) setError(result)
    setLoading(false)
  }

  const link = "font-medium text-foreground underline underline-offset-4 hover:opacity-80"
  const box = "mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-6 py-10">
      <div className="relative flex w-full max-w-[440px] flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/renew-symbol.svg" alt="Renew" className="h-[76px] w-auto" />

        <div className="mt-6 text-center">
          <h1 className="text-balance text-2xl font-medium tracking-tight">Antes de continuar</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {session?.name ? `${session.name}, ` : ""}para entrar a la oficina necesitamos que lea y acepte estos
            documentos.
          </p>
        </div>

        <form
          onSubmit={handleAccept}
          className="mt-8 w-full space-y-4 rounded-2xl border border-border bg-card p-6 shadow-float"
        >
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-snug">
            <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className={box} />
            <span>
              He leído y acepto los{" "}
              <a href={LEGAL_PATH.terms} className={link}>
                Términos y Condiciones de Uso
              </a>
              .
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 text-sm leading-snug">
            <input type="checkbox" checked={privacy} onChange={(e) => setPrivacy(e.target.checked)} className={box} />
            <span>
              He leído y acepto la{" "}
              <a href={LEGAL_PATH.privacy} className={link}>
                Política de Privacidad
              </a>
              .
            </span>
          </label>

          <p className="text-xs text-muted-foreground">
            Dejaremos constancia de su aceptación, así que no tendrá que repetirla en cada inicio de sesión.
          </p>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !terms || !privacy}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Registrando…
              </>
            ) : (
              <>
                Aceptar y continuar
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => void signOut()}
            disabled={loading}
            className="w-full text-center text-sm text-muted-foreground transition hover:text-foreground disabled:opacity-60"
          >
            No acepto, cerrar sesión
          </button>
        </form>
      </div>
    </main>
  )
}
