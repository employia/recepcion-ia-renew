"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react"
import { useApp } from "@/lib/store"
import { EMPLOYEES } from "@/lib/employees"
import { LEGAL_PATH } from "@/lib/legal"
import { StatusDot, Thumb } from "@/components/shell/employee-avatar"
import { RenewReceptionShowcase } from "@/components/auth/renew-reception-showcase"

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
  // Escala del bloque de login en escritorio (1 = tamaño base). Crece con la ventana (p. ej. pantalla
  // completa) para que no sobre espacio; nunca pasa de lo que cabe en su columna.
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      if (vw < 1024) return setScale(1)
      // mismas medidas que --art-w (ver abajo)
      const artW = Math.min((vh - 64) * 1.339, vw * 0.55 - 40)
      const artH = artW / 1.339
      const region = artH * (1 - 0.047 - 0.109) // franja vertical del diseño de la izquierda
      const colW = vw - (artW + 40)
      // el formulario ocupa como máximo ~72% de su columna: siempre queda aire a los lados
      const k = Math.min(region / 470, (colW * 0.72) / 400, 1.6)
      setScale(Math.max(1, Math.round(k * 100) / 100))
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])
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
    <main
      className="force-light relative min-h-dvh w-full overflow-x-hidden bg-background text-foreground lg:grid lg:grid-cols-[calc(var(--art-w)+2.5rem)_1fr] lg:bg-white"
      style={
        {
          // Ancho del diseño de la izquierda: llena la altura de la ventana (con margen) sin pasarse de
          // 55% del ancho (los dos lados quedan casi iguales). La columna izquierda se ajusta a él.
          "--art-w": "min(calc((100dvh - 4rem) * 1.339), calc(55vw - 2.5rem))",
          "--art-h": "calc(var(--art-w) / 1.339)",
          "--art-pt": "calc(var(--art-w) / 1.339 * 0.047)",
          "--art-pb": "calc(var(--art-w) / 1.339 * 0.109)",
        } as React.CSSProperties
      }
    >
      {/* Solo escritorio: pieza de marca a la izquierda. En móvil no se muestra. */}
      <div className="hidden items-center justify-end bg-white py-6 pl-6 pr-0 lg:flex xl:pl-10">
        {/* El ancho también se limita por la altura de la ventana para que nunca haga scroll. */}
        <div style={{ width: "min(100%, var(--art-w))" }}>
          <RenewReceptionShowcase />
        </div>
      </div>

      <div className="relative flex min-h-dvh w-full items-center justify-center px-6 py-6 lg:px-10 lg:border-l lg:border-[#dadde1]">
      {/* Ambient warm light, very subtle */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 lg:hidden"
        style={{
          background:
            "radial-gradient(900px 480px at 50% -10%, color-mix(in srgb, var(--brand) 12%, transparent), transparent 65%)",
        }}
      />

      <div className="relative flex w-full max-w-[400px] flex-col items-center lg:h-[var(--art-h)] lg:justify-center lg:pt-[var(--art-pt)] lg:pb-[var(--art-pb)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/renew-symbol.svg" alt="Renew" className="h-[72px] w-auto lg:hidden [@media(max-height:680px)]:h-14" />

        {/* Móvil: sin cambios */}
        <div className="mt-5 text-center lg:hidden">
          <h1 className="text-balance font-serif text-2xl font-medium tracking-tight sm:text-3xl">
            Bienvenido a su recepción digital
          </h1>
          <div className="mt-4 flex items-center justify-center gap-3">
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
        </div>

        {/* Escritorio: caras + estado + formulario, escalados juntos con la ventana. En móvil "contents" no genera caja. */}
        <div
          className="contents lg:flex lg:w-full lg:flex-col lg:items-center"
          style={{ transform: `scale(${scale})`, transformOrigin: "center" }}
        >
        {/* Escritorio: caras del equipo + estado como etiqueta */}
        <div className="hidden w-full flex-col items-center text-center lg:flex">
          <h1 className="sr-only">Recepción digital de Renew</h1>
          <ul aria-label="Equipo de la oficina" className="flex -space-x-2.5">
            {EMPLOYEES.map((e) => (
              <li key={e.id} className="rounded-full ring-[3px] ring-background" title={`${e.name} · ${e.role}`}>
                <Thumb employee={e} size={46} />
              </li>
            ))}
          </ul>
          <p className="mt-4 whitespace-nowrap text-2xl text-foreground xl:text-[27px]">
            tu equipo ya está{" "}
            <span
              className="rounded-lg px-2.5 py-0.5 font-medium text-white"
              style={{ background: "linear-gradient(180deg, #5fe77b, #22bd44)" }}
            >
              trabajando
            </span>
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 w-full space-y-3.5 rounded-2xl lg:mt-8 lg:space-y-5 lg:p-8 border border-border bg-card p-5 shadow-float [@media(max-height:680px)]:mt-4"
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
      </div>
    </main>
  )
}
