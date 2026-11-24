"use client"

import { Moon, Sun } from "lucide-react"
import { useApp } from "@/lib/store"
import { useTheme } from "@/lib/theme"
import { EMPLOYEES } from "@/lib/employees"
import { STATUS_LABEL, StatusDot, Thumb } from "./employee-avatar"

/**
 * Floating capsule with the four employees, centered in the free part of the
 * office. It makes the team reachable by keyboard and touch (the 3D avatars
 * carry no labels). Hover or focus shows name, role and presence.
 */
export function TeamBar({
  insetLeft,
  insetRight,
  hidden,
}: {
  insetLeft: number
  insetRight: number
  hidden: boolean
}) {
  const { activeEmployee, openEmployee } = useApp()
  const { resolved, setPreference } = useTheme()
  const nextTheme = resolved === "dark" ? "light" : "dark"
  const ThemeIcon = nextTheme === "dark" ? Moon : Sun
  const themeLabel = nextTheme === "dark" ? "Cambiar a tema oscuro" : "Cambiar a tema claro"

  return (
    <div
      inert={hidden}
      style={{ paddingLeft: insetLeft + 12, paddingRight: insetRight + 12 }}
      className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center pb-[max(1rem,env(safe-area-inset-bottom))] transition-[padding,opacity] duration-300 ease-[var(--ease-out)] motion-reduce:transition-none md:pb-6 ${
        hidden ? "opacity-0" : ""
      }`}
    >
      <div className="relative flex items-center">
        <ul
          aria-label="Equipo de la oficina"
          className="pointer-events-auto glass flex items-center gap-1 rounded-full border border-border/60 p-1.5 shadow-float max-md:gap-1.5"
        >
          {EMPLOYEES.map((e) => {
            const active = activeEmployee === e.id
            return (
              <li key={e.id} className="group relative">
                <button
                  onClick={(ev) => {
                    const r = ev.currentTarget.getBoundingClientRect()
                    openEmployee(e.id, { x: r.left + r.width / 2, y: r.top + r.height / 2 })
                  }}
                  aria-pressed={active}
                  aria-label={`${e.name}, ${e.role}. ${STATUS_LABEL[e.status]}. Ver ficha`}
                  className={`press flex h-11 w-11 items-center justify-center rounded-full hover:scale-105 md:h-12 md:w-12 ${
                    active ? "ring-2 ring-brand ring-offset-2 ring-offset-card" : ""
                  }`}
                >
                  <Thumb employee={e} size={44} badge />
                </button>
                <span
                  aria-hidden
                  className="pointer-events-none absolute bottom-full left-1/2 mb-3 hidden -translate-x-1/2 whitespace-nowrap rounded-xl border border-border bg-popover px-3 py-2 text-left opacity-0 shadow-float transition-opacity duration-150 group-hover:opacity-100 group-has-[:focus-visible]:opacity-100 md:block"
                >
                  <span className="block text-sm font-semibold leading-tight">{e.name}</span>
                  <span className="block text-xs leading-snug text-muted-foreground">{e.role}</span>
                  <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <StatusDot status={e.status} />
                    {STATUS_LABEL[e.status]}
                  </span>
                </span>
              </li>
            )
          })}
          <li aria-hidden className="mx-1 h-7 w-px self-center bg-border" />
          <li className="group relative">
            <button
              onClick={() => setPreference(nextTheme)}
              aria-label={themeLabel}
              className="press flex h-11 w-11 items-center justify-center rounded-full hover:scale-105 md:h-12 md:w-12"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary text-foreground transition-colors duration-200 group-hover:bg-accent md:h-11 md:w-11">
                <ThemeIcon
                  key={nextTheme}
                  className="h-5 w-5 animate-in fade-in zoom-in-50 spin-in-90 duration-300 motion-reduce:animate-none"
                />
              </span>
            </button>
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-full right-0 mb-3 hidden whitespace-nowrap rounded-xl border border-border bg-popover px-3 py-2 text-sm font-semibold leading-tight opacity-0 shadow-float transition-opacity duration-150 group-hover:opacity-100 group-has-[:focus-visible]:opacity-100 md:block"
            >
              {themeLabel}
            </span>
          </li>
        </ul>
      </div>
    </div>
  )
}
