"use client"

import { useEffect } from "react"
import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { useApp } from "@/lib/store"
import { useShellUi } from "@/lib/shell-ui"
import { useEscalations } from "@/lib/hooks"
import { NAV_ITEMS, SETTINGS_ITEM, type NavItem } from "@/lib/nav"

/**
 * Main navigation. A 64px rail on tablet and desktop that expands to half the
 * screen on demand; a drawer on phones. Expanding overlays the content, so the
 * office and the dashboards never resize underneath it.
 */
export function AppSidebar() {
  const { activeModule, openModule } = useApp()
  const { navOpen, setNavOpen } = useShellUi()
  const { data: escalations } = useEscalations()
  const waiting = escalations?.filter((e) => e.status === "waiting-person").length ?? 0

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
    const badge = item.id === "escalations" && waiting > 0 ? waiting : 0
    return (
      <li key={item.id}>
        <button
          onClick={() => go(item)}
          aria-current={active ? "page" : undefined}
          title={navOpen ? undefined : item.label}
          className={`press relative flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left hover:bg-secondary/80 ${
            active ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {active && <span aria-hidden className="absolute inset-y-2.5 left-0 w-[3px] rounded-full bg-brand" />}
          <span className="relative flex h-6 w-6 shrink-0 items-center justify-center">
            <Icon className={`h-5 w-5 ${active ? "text-brand-ink" : ""}`} />
            {badge > 0 && !navOpen && (
              <span aria-hidden className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-terracotta ring-2 ring-card" />
            )}
          </span>
          <span className={`min-w-0 flex-1 ${navOpen ? "" : "md:sr-only"}`}>
            <span className="block truncate text-sm font-medium text-foreground">{item.label}</span>
            <span className="block truncate text-xs font-normal text-muted-foreground">{item.description}</span>
          </span>
          {badge > 0 && (
            <>
              <span
                aria-hidden
                className={`shrink-0 rounded-full bg-terracotta px-2 py-0.5 text-xs font-semibold tabular-nums text-terracotta-foreground ${
                  navOpen ? "" : "md:hidden"
                }`}
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
        className={`fixed inset-0 z-[45] bg-black/30 transition-opacity duration-300 ${
          navOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />
      <nav
        aria-label="Navegación principal"
        className={`pt-safe pb-safe pl-safe fixed left-0 top-0 z-50 flex h-dvh flex-col border-r border-border bg-card transition-[transform,width,visibility] duration-300 ease-[var(--ease-out)] motion-reduce:transition-none ${
          navOpen
            ? "w-[min(86vw,320px)] translate-x-0 shadow-float md:w-1/2 md:min-w-[320px]"
            : "w-[min(86vw,320px)] max-md:invisible max-md:-translate-x-full md:w-16"
        }`}
      >
        <div className="flex h-16 shrink-0 items-center gap-1 px-2.5">
          <button
            onClick={() => setNavOpen(!navOpen)}
            aria-expanded={navOpen}
            aria-label={navOpen ? "Contraer el menú" : "Expandir el menú"}
            className="press flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <span className="md:hidden">
              <Menu className="h-5 w-5" />
            </span>
            <span className="hidden md:inline">
              {navOpen ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
            </span>
          </button>
          {navOpen && (
            <div className="min-w-0 pl-1">
              <p className="truncate text-sm font-semibold leading-tight">Renew</p>
              <p className="truncate text-xs leading-tight text-muted-foreground">Recepción Digital</p>
            </div>
          )}
        </div>

        <ul className="scroll-slim mx-2.5 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden md:max-w-lg">
          {NAV_ITEMS.map(renderItem)}
        </ul>

        <ul className="mx-2.5 mb-3 mt-2 flex flex-col gap-1 border-t border-border pt-2 md:max-w-lg">
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
      className="press glass pt-safe-offset fixed left-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-border/60 shadow-soft md:hidden"
      style={{ marginTop: "env(safe-area-inset-top, 0px)" }}
    >
      <Menu className="h-5 w-5" />
    </button>
  )
}
