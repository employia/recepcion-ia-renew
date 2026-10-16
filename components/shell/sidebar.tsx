"use client"

import {
  Building2,
  CalendarDays,
  LayoutGrid,
  LineChart,
  MessageSquare,
  UserRound,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useApp } from "@/lib/store"
import type { ModuleId } from "@/lib/types"

// `short` is the label used in the compact bottom bar on phones.
const NAV: { id: ModuleId; label: string; short: string; icon: LucideIcon }[] = [
  { id: "office", label: "Oficina", short: "Oficina", icon: LayoutGrid },
  { id: "conversations", label: "Conversaciones", short: "Chats", icon: MessageSquare },
  { id: "agenda", label: "Citas", short: "Citas", icon: CalendarDays },
  { id: "patients", label: "Pacientes", short: "Pacientes", icon: Users },
  { id: "metrics", label: "Métricas", short: "Métricas", icon: LineChart },
  { id: "account", label: "Cuenta", short: "Cuenta", icon: UserRound },
]

/**
 * Side rail on tablet/desktop; compact bottom tab bar on phones.
 */
export function Sidebar() {
  const { activeModule, activeEmployee, openModule, closeModule, closeEmployee } = useApp()

  return (
    <nav
      aria-label="Navegación principal"
      className="pointer-events-auto fixed inset-x-0 bottom-0 z-40 md:inset-x-auto md:bottom-auto md:left-4 md:top-1/2 md:-translate-y-1/2"
    >
      <div className="glass flex items-stretch justify-around gap-0.5 border-t border-border/70 px-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] pt-1.5 shadow-float md:flex-col md:justify-start md:gap-1 md:rounded-2xl md:border md:p-2">
        {/* Brand mark (desktop only) */}
        <div className="mb-1 hidden items-center gap-2 px-2 py-1.5 md:flex">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Building2 className="h-3.5 w-3.5" />
          </span>
          <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground lg:block">
            Renew
          </span>
        </div>

        {NAV.map((item) => {
          const isOffice = item.id === "office"
          const active = isOffice
            ? activeModule === null && activeEmployee === null
            : activeModule === item.id
          const Icon = item.icon
          const isAccount = item.id === "account"
          return (
            <div key={item.id} className="contents">
              {/* Divider before Cuenta (desktop only) */}
              {isAccount && <div className="my-1 hidden h-px bg-border/70 md:block" />}
              <button
                onClick={() => {
                  if (isOffice) {
                    closeModule()
                    closeEmployee()
                  } else {
                    openModule(item.id)
                  }
                }}
                aria-current={active ? "page" : undefined}
                aria-label={item.label}
                className={`group flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-1.5 text-center transition md:flex-none md:flex-row md:gap-2.5 md:px-2.5 md:py-2 md:text-left ${
                  active
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0 md:h-4 md:w-4" />
                <span className="w-full truncate text-[10px] leading-tight md:hidden">
                  {item.short}
                </span>
                <span className="hidden w-28 truncate text-sm lg:block">{item.label}</span>
              </button>
            </div>
          )
        })}
      </div>
    </nav>
  )
}
