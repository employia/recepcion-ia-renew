"use client"

import { useRef, useState } from "react"
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react"
import { useApp } from "@/lib/store"
import { EMPLOYEES } from "@/lib/employees"
import { LEGAL_PATH } from "@/lib/legal"
import { StatusDot, Thumb } from "@/components/shell/employee-avatar"

interface FieldErrors {
  email?: string
  password?: string
}

export function LoginScreen() {
  const { signIn } = useApp()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [formError, setFormError] = useState("")
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loading) return
    setFormError("")
    const found = validate()
    setErrors(found)
    if (found.email) return emailRef.current?.focus()
    if (found.password) return passwordRef.current?.focus()
    setLoading(true)
    try {
      // On success the session listener swaps this screen for the office.
      const error = await signIn(email.trim(), password)
      if (error) setFormError(error)
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (invalid: boolean) =>
    `w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm outline-none transition disabled:opacity-60 focus:ring-4 ${
      invalid
        ? "border-destructive focus:border-destructive focus:ring-destructive/10"
        : "border-input focus:border-ring focus:ring-ring/10"
    }`

  return (
    <main className="relative grid min-h-dvh w-full overflow-x-hidden bg-background lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      {/* Left: presentation and sign-in */}
      <section className="relative flex flex-col px-6 py-6 sm:px-10 lg:px-14 xl:px-20">
        {/* The logo's navy is part of the brand and is never recoloured: on the dark theme it sits on a white plate. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/renew-logo.png"
          alt="Renew, Centro de Terapia Física y Rehabilitación"
          width={720}
          height={463}
          className="h-[72px] w-auto self-start rounded-xl dark:bg-white dark:px-3 dark:py-1.5 sm:h-24 [@media(max-height:680px)]:h-14"
        />

        <div className="flex flex-1 flex-col justify-center py-6">
          <div className="w-full max-w-[460px]">
            <h1 className="font-serif text-4xl font-medium leading-[1.08] tracking-tight text-balance sm:text-5xl xl:text-[3.25rem] [@media(max-height:680px)]:text-3xl">
              Bienvenido a su recepción digital
            </h1>
            <div className="mt-5 flex items-center gap-3 [@media(max-height:680px)]:mt-3">
              <ul aria-label="Equipo de la oficina" className="flex -space-x-2">
                {EMPLOYEES.map((e) => (
                  <li key={e.id} className="rounded-full ring-2 ring-background" title={`${e.name} · ${e.role}`}>
                    <Thumb employee={e} size={32} />
                  </li>
                ))}
              </ul>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <StatusDot status="working" />
                Su equipo está trabajando
              </p>
            </div>
            <form
              onSubmit={handleSubmit}
              noValidate
              className="mt-7 w-full max-w-[400px] space-y-3.5 rounded-2xl border border-border bg-card p-5 shadow-float [@media(max-height:760px)]:mt-4"
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
                    <p id="password-caps" className="text-xs text-warning-ink">
                      Bloq Mayús está activado.
                    </p>
                  )
                )}
              </div>

              {formError && (
                <p role="alert" className="text-sm text-destructive">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="press group flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-70"
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

              <p className="text-center text-xs leading-relaxed text-muted-foreground">
                Al continuar, acepta los{" "}
                <a href={LEGAL_PATH.terms} className="underline underline-offset-4 transition hover:text-foreground">
                  Términos y Condiciones de Uso
                </a>{" "}
                y la{" "}
                <a href={LEGAL_PATH.privacy} className="underline underline-offset-4 transition hover:text-foreground">
                  Política de Privacidad
                </a>
                .
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Right: real staff photography with floating glass details (lg and up) */}
      <section aria-hidden className="relative hidden items-center justify-center p-8 xl:p-12 lg:flex">
        <div className="relative h-[min(78dvh,720px)] w-full max-w-[620px]">
          {/* Soft brand shapes behind the photo, taken from the isotype colours */}
          <span className="absolute -left-14 top-10 h-28 w-28 rounded-full bg-[#F26522]/90" />
          <span className="absolute -right-8 bottom-32 h-16 w-16 rounded-full bg-[#253370]/90" />

          {/* Main photo */}
          <div className="absolute inset-0 overflow-hidden rounded-[28px] shadow-float ring-1 ring-black/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/equipo-renew.webp"
              alt=""
              width={962}
              height={676}
              fetchPriority="high"
              className="h-full w-full object-cover"
              style={{ objectPosition: "63% 30%" }}
            />
          </div>

          {/* Circular detail: another framing of the same photo */}
          <div
            className="motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 absolute -left-10 bottom-20 h-32 w-32 rounded-full border-4 border-background shadow-float duration-700 xl:h-36 xl:w-36"
            style={{
              backgroundImage: "url(/brand/equipo-renew.webp)",
              backgroundSize: "300% auto",
              backgroundPosition: "66.5% 21.8%",
            }}
          />

          {/* Glass card: brand tagline from the official logo */}
          <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 absolute -right-4 bottom-8 flex max-w-[280px] items-center gap-3 rounded-2xl border border-white/50 bg-white/60 p-3.5 pr-5 text-[#1d1d1f] shadow-float backdrop-blur-xl duration-700 xl:-right-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/renew-isotipo.png" alt="" width={44} height={80} className="h-11 w-auto" />
            <p className="text-sm font-medium leading-snug">Fortaleciendo &amp; Restaurando su Salud</p>
          </div>
        </div>
      </section>
    </main>
  )
}
