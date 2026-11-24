"use client"

import { useEffect, useRef } from "react"
import { Menu, RefreshCw, X } from "lucide-react"
import { useApp } from "@/lib/store"
import { useShellUi } from "@/lib/shell-ui"
import { EMPLOYEES } from "@/lib/employees"
import { navItem } from "@/lib/nav"
import { useModuleRefresh } from "@/lib/refresh"
import { usePullToRefresh } from "@/lib/pull-to-refresh"
import type { ModuleId } from "@/lib/types"
import { Thumb } from "./employee-avatar"
import { ConversationsModule } from "@/components/modules/conversations"
import { EscalationsModule } from "@/components/modules/escalations"
import { MetricsModule } from "@/components/modules/metrics"
import { AccountModule } from "@/components/modules/account"
import { ManagedRecordsModule } from "@/components/modules/managed-records"

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
    case "archived":
    case "trash":
      return <ManagedRecordsModule status={id} />
    default:
      return null
  }
}

/**
 * Hosts whichever dashboard is open. On tablet and desktop it sits flush against
 * the docked icon rail (left edge at 72px) and spans the full height of the
 * screen. Beside the office on wide screens (desktop split view), covering it
 * on tablets, full screen on phones.
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

  // Manual refresh of the open module: the header button (mouse, keyboard,
  // assistive tech) and the touch pull-to-refresh both end up here.
  const { refresh, refreshing, canRefresh } = useModuleRefresh(shown)
  const bodyRef = useRef<HTMLDivElement>(null)
  const ptrHostRef = useRef<HTMLDivElement>(null)
  usePullToRefresh({ scrollRef: bodyRef, hostRef: ptrHostRef, onRefresh: refresh, enabled: open && canRefresh })

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
      className={`fixed bottom-0 left-0 right-0 top-0 z-30 flex flex-col overflow-hidden border-border bg-card transition-[transform,translate,opacity,visibility] duration-300 ease-[var(--ease-out)] motion-reduce:transition-[opacity,visibility] motion-reduce:duration-150 md:bottom-0 md:left-[calc(72px+env(safe-area-inset-left,0px))] md:right-0 md:top-0 md:border-r md:shadow-none lg:right-auto lg:w-[var(--panel-w)] ${
        open ? "translate-x-0 opacity-100" : "invisible -translate-x-4 opacity-0 motion-reduce:translate-x-0"
      }`}
    >
      {item && shown && (
        <>
          <header className="pt-safe relative flex shrink-0 items-center gap-2 border-b border-border px-3 pb-3 pt-3 md:px-5">
            <button
              onClick={() => setNavOpen(true)}
              aria-label="Abrir el menú"
              className="press flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden"
            >
  <Menu className="h-5 w-5" />
  </button>
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
            {canRefresh && (
              <button
                onClick={() => void refresh()}
                disabled={refreshing}
                aria-label={refreshing ? "Actualizando" : "Actualizar"}
                className="press flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground disabled:pointer-events-none max-md:sr-only"
              >
                <RefreshCw className={`h-[18px] w-[18px] ${refreshing ? "animate-spin motion-reduce:animate-none" : ""}`} />
              </button>
            )}
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
            {refreshing && (
              <span aria-hidden className="absolute inset-x-0 -bottom-px h-0.5 overflow-hidden">
                <span className="block h-full w-1/3 animate-[refresh-bar_1s_var(--ease-out)_infinite] bg-brand motion-reduce:w-full motion-reduce:animate-none motion-reduce:opacity-60" />
              </span>
            )}
          </header>
          <p role="status" className="sr-only">
            {refreshing ? "Actualizando datos" : ""}
          </p>

          <div ref={ptrHostRef} className="relative min-h-0 flex-1 overflow-hidden">
            {canRefresh && (
              <div
                aria-hidden
                className="ptr-indicator pointer-events-none absolute left-1/2 top-0 z-10 -ml-4 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-soft"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin motion-reduce:animate-none" : ""}`}
                  style={refreshing ? undefined : { transform: "rotate(calc(var(--ptr-p, 0) * 240deg))" }}
                />
              </div>
            )}
            <div ref={bodyRef} className="scroll-slim pb-safe h-full overflow-y-auto overscroll-y-contain px-5 py-4">
              <div className="ptr-content">
                <div key={shown} className="animate-in fade-in duration-300 motion-reduce:animate-none">
                  <ModuleBody id={shown} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}
