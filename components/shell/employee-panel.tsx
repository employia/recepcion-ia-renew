"use client"

import { useEffect, useRef, useState } from "react"
import { Check, X } from "lucide-react"
import { useApp } from "@/lib/store"
import { EMPLOYEES } from "@/lib/employees"
import { navItem } from "@/lib/nav"
import { PROFILE_WIDTH, TOPBAR_HEIGHT, useViewportWidth } from "@/lib/layout"
import type { Employee } from "@/lib/types"
import { STATUS_LABEL, StatusDot } from "./employee-avatar"

const DECELERATION = 0.998
const DISMISS_DISTANCE = 160

/**
 * Employee profile. A floating panel on desktop that grows from the avatar the
 * person clicked; a bottom sheet on tablets and phones that can be dragged
 * down to dismiss. The portrait is a static image on purpose: the office
 * canvas is already the heavy part of the app.
 */
export function EmployeePanel() {
  const { activeEmployee, employeeOrigin, closeEmployee, openModule } = useApp()
  const viewport = useViewportWidth()
  const open = activeEmployee !== null

  // Keep the last employee rendered while the panel leaves.
  const lastRef = useRef<Employee | null>(null)
  const current = activeEmployee ? (EMPLOYEES.find((e) => e.id === activeEmployee) ?? null) : null
  if (current) lastRef.current = current
  const shown = current ?? lastRef.current
  const tool = shown?.tool ?? null
  const ToolIcon = tool ? navItem(tool.module).icon : null

  const asideRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    returnFocusRef.current = document.activeElement as HTMLElement | null
    closeRef.current?.focus({ preventScroll: true })
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeEmployee()
    }
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("keydown", onKey)
      returnFocusRef.current?.focus?.({ preventScroll: true })
    }
  }, [open, closeEmployee])

  const bodyRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    bodyRef.current?.scrollTo({ top: 0 })
  }, [activeEmployee])

  // Drag-to-dismiss for the bottom sheet. Mutates the style directly so the
  // sheet follows the finger 1:1 without re-rendering.
  const drag = useRef<{ startY: number; y: number; t: number; v: number } | null>(null)
  function onDragStart(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { startY: e.clientY, y: 0, t: performance.now(), v: 0 }
    if (asideRef.current) asideRef.current.style.transition = "none"
  }
  function onDragMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current
    if (!d || !asideRef.current) return
    const dy = e.clientY - d.startY
    const now = performance.now()
    d.v = (dy - d.y) / Math.max(now - d.t, 1)
    d.y = dy
    d.t = now
    // Upward drags meet resistance instead of moving the sheet off its edge.
    asideRef.current.style.transform = `translateY(${dy > 0 ? dy : dy * 0.15}px)`
  }
  function onDragEnd() {
    const d = drag.current
    drag.current = null
    const el = asideRef.current
    if (!d || !el) return
    el.style.transition = ""
    el.style.transform = ""
    const velocity = performance.now() - d.t > 80 ? 0 : d.v // px per ms
    const projected = d.y + velocity * 1000 * (DECELERATION / (1 - DECELERATION)) * 0.001
    if (projected > DISMISS_DISTANCE) closeEmployee()
  }

  // On desktop the panel floats at right-4, just under the top bar; its transform origin is the
  // clicked avatar, expressed relative to the panel's own box.
  const panelLeft = viewport - 16 - PROFILE_WIDTH
  const transformOrigin = employeeOrigin
    ? `${Math.round(employeeOrigin.x - panelLeft)}px ${Math.round(employeeOrigin.y - (TOPBAR_HEIGHT + 8))}px`
    : "100% 50%"

  return (
    <>
      <div
        aria-hidden
        onClick={closeEmployee}
        className={`fixed inset-0 z-[35] bg-black/30 transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        ref={asideRef}
        data-state={open ? "open" : "closed"}
        inert={!open}
        role="dialog"
        aria-modal={viewport < 1024}
        aria-label={shown ? `Ficha de ${shown.name}` : undefined}
        style={{ transformOrigin }}
        className="profile-panel fixed inset-x-0 bottom-0 z-40 mx-auto flex max-h-[88dvh] w-full max-w-[520px] flex-col overflow-hidden rounded-t-3xl border border-b-0 border-border bg-card shadow-float lg:inset-x-auto lg:bottom-4 lg:right-4 lg:top-[calc(var(--topbar-h)+0.5rem)] lg:mx-0 lg:max-h-none lg:w-[420px] lg:max-w-none lg:rounded-3xl lg:border-b"
      >
        {shown && (
          <>
            <div
              onPointerDown={onDragStart}
              onPointerMove={onDragMove}
              onPointerUp={onDragEnd}
              onPointerCancel={onDragEnd}
              className="flex h-6 shrink-0 cursor-grab touch-none items-center justify-center lg:hidden"
            >
              <span aria-hidden className="h-1 w-9 rounded-full bg-border" />
            </div>

            <header className="flex items-start justify-between gap-3 px-5 pb-3 pt-1 lg:pt-5">
              <div className="min-w-0">
                <h2 className="truncate font-serif text-2xl font-medium tracking-tight">{shown.name}</h2>
                <p className="truncate text-sm text-muted-foreground">{shown.role}</p>
              </div>
              <button
                ref={closeRef}
                onClick={closeEmployee}
                aria-label="Cerrar la ficha"
                className="press flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div ref={bodyRef} className="scroll-slim flex-1 overflow-y-auto px-5 pb-5">
              <div key={shown.id} className="space-y-6 animate-in fade-in duration-300 motion-reduce:animate-none">
                <Portrait employee={shown} />

                <section className="space-y-2">
                  <h3 className="text-sm font-semibold">Quién es</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{shown.summary}</p>
                </section>

                <section className="space-y-2">
                  <h3 className="text-sm font-semibold">Qué hace</h3>
                  <ul className="divide-y divide-border">
                    {shown.duties.map((duty) => (
                      <li key={duty} className="flex items-start gap-3 py-2.5 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: shown.accent }} />
                        <span>{duty}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>

            {tool && ToolIcon && (
              <footer className="pb-safe shrink-0 border-t border-border px-5 py-3">
                <button
                  onClick={() => openModule(tool.module)}
                  className="press flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  <ToolIcon className="h-4 w-4" />
                  {tool.label}
                </button>
              </footer>
            )}
          </>
        )}
      </aside>
    </>
  )
}

function Portrait({ employee }: { employee: Employee }) {
  const [failed, setFailed] = useState(false)

  useEffect(() => setFailed(false), [employee.id])

  return (
    <div
      className="relative flex h-56 items-end justify-center overflow-hidden rounded-2xl border border-border sm:h-64"
      style={{
        background: `radial-gradient(120% 90% at 50% 100%, ${employee.accent}33, ${employee.accent}0d 60%, transparent)`,
      }}
    >
      <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium">
        <StatusDot status={employee.status} />
        {STATUS_LABEL[employee.status]}
      </span>
      {failed ? (
        <div
          className="mb-8 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-semibold text-white"
          style={{ background: employee.accent }}
        >
          {employee.name.charAt(0)}
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={employee.portrait}
          alt={`${employee.name}, ${employee.role}`}
          width={400}
          height={420}
          onError={() => setFailed(true)}
          className="h-full w-auto max-w-full object-contain"
        />
      )}
    </div>
  )
}
