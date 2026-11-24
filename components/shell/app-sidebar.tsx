"use client"

import { useEffect } from "react"
import { Menu } from "lucide-react"
import { useApp } from "@/lib/store"
import { useShellUi } from "@/lib/shell-ui"
import { useEscalations } from "@/lib/hooks"
import { NAV_ITEMS, SETTINGS_ITEM, type NavItem } from "@/lib/nav"
import { useRecordManagement } from "@/lib/record-management"

/**
 * Main navigation, docked and expanded variant.
 *
 * - Tablet and desktop: a permanent 280px column flush against the left, top
 *   and bottom edges of the screen, always showing icons and labels. The office
 *   and the dashboards are laid out to its right, so nothing sits underneath it.
 * - Phones: hidden until the floating menu button is tapped; the card then
 *   grows out of that button (same top-left corner), so the origin of the
 *   motion is the control that triggered it.
 */
export function AppSidebar() {
  const { activeModule, openModule } = useApp()
  const { navOpen, setNavOpen } = useShellUi()
  const { data: escalations } = useEscalations()
  const { records } = useRecordManagement()
  const waiting = escalations?.filter((e) => e.status === "waiting-person" && !records.some((record) => record.key === `escalation:${e.id}`)).length ?? 0

  useEffect(() => {
    if (!navOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setNavOpen(false)
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [navOpen, setNavOpen])

  function go(item: NavItem) {
    openModule(item.id)
    setNavOpen(false)
  }

  function renderItem(item: NavItem) {
    const active = item.id === "office" ? activeModule === null : activeModule === item.id
    const Icon = item.icon
    const badge = item.id === "escalations"
      ? waiting
      : item.id === "archived" || item.id === "trash"
        ? records.filter((record) => record.status === item.id).length
        : 0
    return (
      <li key={item.id}>
        <button
          onClick={() => go(item)}
          aria-current={active ? "page" : undefined}
                    className={`press relative flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left hover:bg-secondary/80 ${
            active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {active && <span aria-hidden className="absolute inset-y-2.5 left-0 w-[3px] rounded-full bg-brand" />}
          <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
            <Icon aria-hidden className={`h-5 w-5 ${active ? "text-brand-ink" : ""}`} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-foreground">{item.label}</span>
            <span className="block truncate text-xs font-normal text-muted-foreground">{item.description}</span>
          </span>
          {badge > 0 && (
            <>
              <span
                aria-hidden
                className="shrink-0 rounded-full bg-warning px-2 py-0.5 text-xs font-semibold tabular-nums text-warning-foreground"
              >
                {badge}
              </span>
              <span className="sr-only">{badge} esperando a una persona</span>
            </>
          )}
        </button>
      </li>
    )
  }

  return (
    <>
      <div
        aria-hidden
        onClick={() => setNavOpen(false)}
        className={`fixed inset-0 z-[45] bg-black/30 transition-opacity duration-300 motion-reduce:duration-150 md:hidden ${
          navOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <nav
        aria-label="Navegación principal"
        className={`fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] left-[calc(0.75rem+env(safe-area-inset-left,0px))] top-[calc(0.75rem+env(safe-area-inset-top,0px))] z-50 flex origin-top-left flex-col overflow-hidden rounded-2xl border border-border bg-card transition-[transform,translate,scale,opacity,width,border-radius,visibility] duration-300 ease-[var(--ease-out)] motion-reduce:transition-[opacity,visibility] motion-reduce:duration-150 md:visible md:bottom-0 md:left-0 md:top-0 md:w-[280px] md:translate-x-0 md:scale-100 md:rounded-none md:border-y-0 md:border-l-0 md:pb-[env(safe-area-inset-bottom,0px)] md:pl-[env(safe-area-inset-left,0px)] md:pt-[env(safe-area-inset-top,0px)] md:opacity-100 md:shadow-none ${
          navOpen
            ? "w-[min(86vw,320px)] translate-x-0 scale-100 opacity-100 shadow-float"
            : "w-[min(86vw,320px)] shadow-soft max-md:invisible max-md:-translate-x-3 max-md:scale-95 max-md:opacity-0 max-md:motion-reduce:translate-x-0 max-md:motion-reduce:scale-100"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center gap-1 px-2.5">
          <button
            onClick={() => setNavOpen(false)}
            aria-label="Cerrar el menú"
            className="press flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden"
          >
            <Menu aria-hidden className="h-5 w-5" />
          </button>
          <div className="min-w-0 pl-1 md:pl-2.5">
            <p className="truncate text-sm font-semibold leading-tight">Renew</p>
            <p className="truncate text-xs leading-tight text-muted-foreground">Recepción Digital</p>
          </div>
        </div>

        <ul className="scroll-slim mx-2 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden overscroll-contain">
          {NAV_ITEMS.map(renderItem)}
        </ul>

        <ul className="mx-2 mb-2 mt-2 flex flex-col gap-1 border-t border-border pt-2">
          {renderItem(SETTINGS_ITEM)}
        </ul>
      </nav>
    </>
  )
}

/** Floating menu button for phones, shown over the office. */
export function MobileMenuButton() {
  const { setNavOpen } = useShellUi()
  return (
    <button
      onClick={() => setNavOpen(true)}
      aria-label="Abrir el menú"
      className="press glass pt-safe-offset fixed left-3 top-3 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-border/60 shadow-soft md:hidden"
      style={{ marginTop: "env(safe-area-inset-top, 0px)" }}
    >
      <Menu className="h-6 w-6" />
    </button>
  )
}
