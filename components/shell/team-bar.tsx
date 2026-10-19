"use client"

import { Settings } from "lucide-react"
import { useApp } from "@/lib/store"
import { EMPLOYEES } from "@/lib/mock-data"
import type { Employee, EmployeeStatus } from "@/lib/types"

export const STATUS_LABEL: Record<EmployeeStatus, string> = {
  working: "Trabajando",
  resting: "En pausa",
}

/** Small colored dot for an employee's presence. Static on purpose: no
 * animation or blur here, because this sits on top of the live 3D canvas. */
export function StatusDot({ status }: { status: EmployeeStatus }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
        status === "working" ? "bg-emerald-500" : "bg-amber-400"
      }`}
    />
  )
}

/** Round close-up of an employee's face, cropped from their portrait, with an optional presence badge. */
export function Thumb({
  employee,
  size,
  badge = false,
}: {
  employee: Employee
  size: number
  badge?: boolean
}) {
  const zoom = 3.6 // portrait is shown 3.6x wider than the circle
  const imgW = size * zoom
  const imgH = imgW * 1.05
  const [fx, fy] = employee.portraitFace
  const pos = (f: number, img: number) =>
    `${Math.min(Math.max((f * img - size / 2) / (img - size), 0), 1) * 100}%`
  return (
    <span className="relative shrink-0" style={{ width: size, height: size }}>
      <span
        aria-hidden
        className="block rounded-full border border-border/70 bg-secondary"
        style={{
          width: size,
          height: size,
          backgroundImage: `url(${employee.portrait})`,
          backgroundSize: `${zoom * 100}%`,
          backgroundPosition: `${pos(fx, imgW)} ${pos(fy, imgH)}`,
          backgroundRepeat: "no-repeat",
          boxShadow: `0 0 0 2px ${employee.accent}33`,
        }}
      />
      {badge && (
        <span
          aria-hidden
          className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-card ${
            employee.status === "working" ? "bg-emerald-500" : "bg-amber-400"
          }`}
        />
      )}
    </span>
  )
}

/**
 * Team roster pinned to the bottom of the office. Makes the employees
 * discoverable (the 3D avatars carry no labels), works by keyboard and touch,
 * and shows who is "working". One click opens the employee's card.
 */
export function TeamBar() {
  const { activeEmployee, activeModule, openEmployee, openModule } = useApp()
  const settingsActive = activeModule === "account"
  // On wide screens a side panel covers the right 440px: keep the bar in the visible part.
  const panelOpen = activeEmployee !== null || (activeModule !== null && activeModule !== "office")

  return (
    <div className={`pointer-events-none fixed inset-x-0 bottom-[76px] z-30 flex justify-center px-3 transition-[padding] duration-300 md:bottom-6 ${
        panelOpen ? "md:pr-[452px]" : ""
      }`}>
      <ul
        aria-label="Equipo de la oficina"
        className="pointer-events-auto flex max-w-full items-stretch gap-1 rounded-2xl border border-border/70 bg-card/95 p-1.5 shadow-float"
      >
        {EMPLOYEES.map((e) => {
          const active = activeEmployee === e.id
          return (
            <li key={e.id} className="min-w-0 flex-1 md:flex-auto">
              <button
                onClick={() => openEmployee(e.id)}
                aria-pressed={active}
                aria-label={`${e.name}, ${e.role}. ${STATUS_LABEL[e.status]}. Ver ficha`}
                className={`group flex w-full flex-col items-center gap-1 rounded-xl px-2.5 py-2 text-center transition md:flex-row md:gap-2.5 md:px-3 md:py-1.5 md:text-left ${
                  active ? "bg-secondary" : "hover:bg-secondary/70"
                } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
                style={active ? { boxShadow: `inset 0 -2px 0 ${e.accent}` } : undefined}
              >
                <Thumb employee={e} size={38} badge />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold leading-tight md:text-sm">
                    {e.name}
                  </span>
                  <span className="hidden truncate text-[11px] leading-tight text-muted-foreground md:block">
                    {e.role}
                  </span>
                </span>
              </button>
            </li>
          )
        })}

        {/* Settings (account, support, legal): a gear at the end of the roster */}
        <li aria-hidden className="mx-0.5 my-1 w-px shrink-0 bg-border/70" />
        <li className="shrink-0">
          <button
            onClick={() => openModule("account")}
            aria-pressed={settingsActive}
            aria-label="Configuración"
            title="Configuración"
            className={`flex h-full min-h-[52px] w-11 items-center justify-center rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              settingsActive
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
            }`}
          >
            <Settings className="h-[18px] w-[18px]" />
          </button>
        </li>
      </ul>
    </div>
  )
}
