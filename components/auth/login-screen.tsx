"use client"

import { useRef, useState } from "react"
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react"
import { useApp } from "@/lib/store"
import { EMPLOYEES } from "@/lib/mock-data"
import { StatusDot, Thumb } from "@/components/shell/team-bar"

// Demo access: the form comes filled in, so entering the office is one click.
const DEMO_EMAIL = "equipo@renew.do"
const DEMO_PASSWORD = "renew-demo"

interface FieldErrors {
  email?: string
  password?: string
}

export function LoginScreen() {
  const { signIn } = useApp()
  const [email, setEmail] = useState(DEMO_EMAIL)
  const [password, setPassword] = useState(DEMO_PASSWORD)
  const [showPassword, setShowPassword] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  function validate(): FieldErrors {
    const next: FieldErrors = {}
    const value = email.trim()
    if (!value) next.email = "Escriba su correo electrónico."
    else if (!/^\S+@\S+\.\S+$/.test(value)) next.email = "Escriba un correo válido, por ejemplo nombre@renew.do."
    if (!password) next.password = "Escriba su contraseña."
    return next
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    const found = validate()
    setErrors(found)
    if (found.email) return emailRef.current?.focus()
    if (found.password) return passwordRef.current?.focus()
    setLoading(true)
    // Mock authentication for the demo.
    setTimeout(() => signIn(email.trim()), 650)
  }

  const inputClass = (invalid: boolean) =>
    `w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none transition disabled:opacity-60 focus:ring-4 ${
      invalid
        ? "border-destructive focus:border-destructive focus:ring-destructive/10"
        : "border-input focus:border-ring focus:ring-ring/10"
    }`

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-6 py-10">
      {/* Ambient warm light, very subtle */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1000px 520px at 50% -10%, oklch(0.985 0.02 80 / 0.9), transparent 65%), radial-gradient(800px 420px at 50% 115%, oklch(0.95 0.02 215 / 0.3), transparent 60%)",
        }}
      />

      <div className="relative flex w-full max-w-[400px] flex-col items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/renew-symbol.svg" alt="Renew" className="h-[76px] w-auto" />

        <div className="mt-6 text-center">
          <h1 className="text-balance text-2xl font-medium tracking-tight">
            Bienvenido a su recepción digital
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Su equipo ya está atendiendo a sus pacientes.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-8 w-full space-y-4 rounded-2xl border border-border bg-card p-6 shadow-float"
        >
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Correo electrónico
            </label>
            <input
              ref={emailRef}
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              disabled={loading}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors((p) => ({ ...p, email: undefined }))
              }}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={inputClass(!!errors.email)}
              placeholder="nombre@renew.do"
            />
            {errors.email && (
              <p id="email-error" role="alert" className="text-xs text-destructive">
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              Contraseña
            </label>
            <div className="relative">
              <input
                ref={passwordRef}
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                disabled={loading}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors((p) => ({ ...p, password: undefined }))
                }}
                onKeyDown={(e) => setCapsLock(e.getModifierState("CapsLock"))}
                onKeyUp={(e) => setCapsLock(e.getModifierState("CapsLock"))}
                onBlur={() => setCapsLock(false)}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "password-error" : capsLock ? "password-caps" : undefined}
                className={`${inputClass(!!errors.password)} pr-11`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                disabled={loading}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={showPassword}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password ? (
              <p id="password-error" role="alert" className="text-xs text-destructive">
                {errors.password}
              </p>
            ) : (
              capsLock && (
                <p id="password-caps" className="text-xs text-amber-700">
                  Bloq Mayús está activado.
                </p>
              )
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Entrando…
              </>
            ) : (
              <>
                Entrar a la oficina
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        {/* The team, already at work */}
        <div className="mt-7 flex items-center gap-3">
          <ul aria-label="Equipo de la oficina" className="flex -space-x-2">
            {EMPLOYEES.map((e) => (
              <li key={e.id} className="rounded-full ring-2 ring-background" title={`${e.name} · ${e.role}`}>
                <Thumb employee={e} size={32} />
              </li>
            ))}
          </ul>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <StatusDot status="working" />
            Su equipo está trabajando
          </p>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          Fortaleciendo &amp; Restaurando su Salud
        </p>
      </div>
    </main>
  )
}
