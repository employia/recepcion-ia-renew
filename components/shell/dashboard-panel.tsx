"use client"

import { useEffect, useRef } from "react"
import { Menu, X } from "lucide-react"
import { useApp } from "@/lib/store"
import { useShellUi } from "@/lib/shell-ui"
import { EMPLOYEES } from "@/lib/employees"
import { navItem } from "@/lib/nav"
import type { ModuleId } from "@/lib/types"
import { Thumb } from "./employee-avatar"
import { ConversationsModule } from "@/components/modules/conversations"
import { EscalationsModule } from "@/components/modules/escalations"
import { MetricsModule } from "@/components/modules/metrics"
import { AccountModule } from "@/components/modules/account"

function ModuleBody({ id }: { id: ModuleId }) {
  switch (id) {
    case "conversations":
      return <ConversationsModule />
    case "escalations":
      return <EscalationsModule />
    case "metrics":
      return <MetricsModule />
    case "account":
      return <AccountModule />
    default:
      return null
  }
}

/**
 * Hosts whichever dashboard is open. Beside the office on wide screens
 * (desktop split view), covering it on tablets and phones.
 */
export function DashboardPanel() {
  const { activeModule, activeEmployee, openEmployee, closeModule } = useApp()
  const { navOpen, setNavOpen } = useShellUi()
  const open = activeModule !== null && activeModule !== "office"

  // Keep the last dashboard rendered while the panel leaves.
  const lastRef = useRef<ModuleId | null>(null)
  if (open) lastRef.current = activeModule
  const shown = open ? activeModule : lastRef.current
  const item = shown ? navItem(shown) : null
  const owner = item?.owner ? EMPLOYEES.find((e) => e.id === item.owner) : undefined

  const titleRef = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (open) titleRef.current?.focus({ preventScroll: true })
  }, [open, activeModule])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !navOpen && activeEmployee === null) closeModule()
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, navOpen, activeEmployee, closeModule])

  return (
    <section
      aria-label={item?.label}
      aria-hidden={!open}
      inert={!open}
      className={`fixed bottom-0 left-0 right-0 top-0 z-30 flex flex-col border-border bg-card transition-[transform,opacity,visibility] duration-300 ease-[var(--ease-out)] motion-reduce:transition-opacity md:left-16 lg:right-auto lg:w-[var(--panel-w)] lg:border-r ${
        open ? "translate-x-0 opacity-100" : "invisible -translate-x-4 opacity-0 motion-reduce:translate-x-0"
      }`}
    >
      {item && shown && (
        <>
          <header className="pt-safe flex shrink-0 items-center gap-2 border-b border-border px-3 pb-3 pt-3 md:px-5">
            <button
              onClick={() => setNavOpen(true)}
              aria-label="Abrir el menú"
              className="press flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden"
            >
  <Menu className="h-5 w-5" />
  </button>
  {/* Room for the floating help button, which sits above this corner. */}
  <span aria-hidden className="h-11 w-11 shrink-0" />
  <div className="min-w-0 flex-1">
              <h2
                ref={titleRef}
                tabIndex={-1}
                className="truncate font-serif text-xl font-medium tracking-tight outline-none"
              >
                {item.label}
              </h2>
              <p className="truncate text-xs text-muted-foreground">{item.subtitle}</p>
            </div>
            {owner && (
              <button
                onClick={(e) => {
                  const r = e.currentTarget.getBoundingClientRect()
                  openEmployee(owner.id, { x: r.left + r.width / 2, y: r.top + r.height / 2 })
                }}
                aria-label={`Ver la ficha de ${owner.name}`}
                className="press flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              >
                <Thumb employee={owner} size={36} badge />
              </button>
            )}
            <button
              onClick={closeModule}
              aria-label="Cerrar y volver a la oficina"
              className="press flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="scroll-slim pb-safe flex-1 overflow-y-auto px-5 py-4">
            <div key={shown} className="animate-in fade-in duration-300 motion-reduce:animate-none">
              <ModuleBody id={shown} />
            </div>
          </div>
        </>
      )}
    </section>
  )
}
