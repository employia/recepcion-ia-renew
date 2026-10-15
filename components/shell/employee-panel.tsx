"use client"

import { useEffect, useState } from "react"
import { Check, X } from "lucide-react"
import { useApp } from "@/lib/store"
import { EMPLOYEES } from "@/lib/mock-data"
import type { Employee } from "@/lib/types"

/**
 * Presentation card for a 3D employee. Opens when the person clicks an
 * employee in the office. Static portrait (no second WebGL context on purpose:
 * the office canvas is already the heavy part of the app).
 */
export function EmployeePanel() {
  const { activeEmployee, closeEmployee } = useApp()
  const open = activeEmployee !== null

  // Keep the last employee rendered while the panel slides out, so the content
  // doesn't vanish mid-animation.
  const [shown, setShown] = useState<Employee | null>(null)
  useEffect(() => {
    if (activeEmployee) setShown(EMPLOYEES.find((e) => e.id === activeEmployee) ?? null)
  }, [activeEmployee])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeEmployee()
    }
    if (open) document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, closeEmployee])

  return (
    <>
      <div
        onClick={closeEmployee}
        aria-hidden={!open}
        className={`fixed inset-0 z-30 transition-all duration-300 ${
          open
            ? "pointer-events-auto bg-neutral-900/10 backdrop-blur-[2px]"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        aria-hidden={!open}
        inert={!open}
        className={`fixed right-0 top-0 z-40 flex h-full w-full max-w-[440px] flex-col border-l border-border/70 shadow-float transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="glass-strong flex h-full flex-col">
          {shown && (
            <>
              <header className="flex items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
                <div className="min-w-0">
                  <p
                    className="font-mono text-[10px] uppercase tracking-wider"
                    style={{ color: shown.accent }}
                  >
                    {shown.role}
                  </p>
                  <h2 className="mt-0.5 truncate text-lg font-semibold tracking-tight">
                    {shown.name}
                  </h2>
                  <p className="truncate text-xs text-muted-foreground">{shown.tagline}</p>
                </div>
                <button
                  onClick={closeEmployee}
                  aria-label="Cerrar panel"
                  className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div className="scroll-slim flex-1 space-y-6 overflow-y-auto px-5 py-5">
                <Portrait employee={shown} />

                <section className="space-y-2">
                  <h3 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Quién es
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground/90">{shown.summary}</p>
                </section>

                <section className="space-y-3">
                  <h3 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Qué hace
                  </h3>
                  <ul className="space-y-2">
                    {shown.duties.map((duty) => (
                      <li
                        key={duty}
                        className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-card/70 px-3.5 py-2.5 text-sm"
                      >
                        <Check
                          className="mt-0.5 h-4 w-4 shrink-0"
                          style={{ color: shown.accent }}
                        />
                        <span>{duty}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  )
}

function Portrait({ employee }: { employee: Employee }) {
  const [failed, setFailed] = useState(false)

  // Reset the error state when switching to another employee.
  useEffect(() => setFailed(false), [employee.id])

  return (
    <div
      className="flex h-80 items-end justify-center overflow-hidden rounded-2xl border border-border/60"
      style={{
        background: `radial-gradient(120% 90% at 50% 100%, ${employee.accent}33, ${employee.accent}0d 60%, transparent)`,
      }}
    >
      {failed ? (
        <div
          className="mb-10 flex h-24 w-24 items-center justify-center rounded-full text-4xl font-semibold text-white"
          style={{ background: employee.accent }}
        >
          {employee.name.charAt(0)}
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={employee.portrait}
          alt={`${employee.name}, ${employee.role}`}
          onError={() => setFailed(true)}
          className="h-full w-auto max-w-full object-contain"
        />
      )}
    </div>
  )
}
