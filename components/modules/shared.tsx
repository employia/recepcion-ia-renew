"use client"

import { Search, X } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-xl border border-input bg-card/60 py-2.5 pl-9 pr-9 text-sm outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/10"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          aria-label="Borrar búsqueda"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

/** Sticks to the top of the panel's scroll area so search + filters stay reachable. */
export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div className="glass-strong sticky -top-4 z-10 -mx-5 -mt-4 mb-4 space-y-3 border-b border-border/50 px-5 pb-3 pt-4">
      {children}
    </div>
  )
}

export interface ChipOption {
  id: string
  label: string
  count: number
}

/** Segmented filter chips with live counts. */
export function FilterChips({
  options,
  value,
  onChange,
}: {
  options: ChipOption[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <div role="tablist" className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const active = o.id === value
        return (
          <button
            key={o.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.id)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border/70 bg-card/60 text-muted-foreground hover:border-border hover:text-foreground"
            }`}
          >
            {o.label}
            <span
              className={`tabular-nums text-[11px] ${active ? "text-primary-foreground/70" : "text-muted-foreground/80"}`}
            >
              {o.count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

const AVATAR_TONES = [
  "bg-accent/15 text-accent",
  "bg-terracotta/15 text-terracotta",
  "bg-amber-500/15 text-amber-700",
  "bg-emerald-500/15 text-emerald-700",
]

/** Initials circle with a stable tone per name. */
export function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/)
  const text = ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase()
  const tone = AVATAR_TONES[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % AVATAR_TONES.length]
  return (
    <span
      aria-hidden
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${tone}`}
    >
      {text}
    </span>
  )
}

const STATUS_STYLES: Record<string, string> = {
  attending: "bg-accent/10 text-accent border-accent/20",
  resolved: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  "waiting-human": "bg-amber-500/12 text-amber-700 border-amber-500/25",
  "human-attending": "bg-accent/10 text-accent border-accent/20",
}

const STATUS_LABEL: Record<string, string> = {
  attending: "Valentina atendiendo",
  resolved: "Conversación resuelta",
  "waiting-human": "Esperando humano",
  "human-attending": "Humano atendiendo",
}

export function StatusPill({ status, label }: { status: string; label?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
        STATUS_STYLES[status] ?? "border-border bg-secondary text-muted-foreground"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label ?? STATUS_LABEL[status] ?? status}
    </span>
  )
}

export function EmptyState({
  children,
  icon: Icon,
}: {
  children: ReactNode
  icon?: LucideIcon
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
      {Icon && <Icon className="h-5 w-5 opacity-60" />}
      {children}
    </div>
  )
}

export function RowCard({
  children,
  onClick,
  active,
}: {
  children: ReactNode
  onClick?: () => void
  active?: boolean
}) {
  const Comp = onClick ? "button" : "div"
  return (
    <Comp
      onClick={onClick}
      className={`w-full rounded-xl border p-3.5 text-left transition ${
        active
          ? "border-accent/40 bg-accent/5"
          : "border-border/70 bg-card/60 hover:border-border hover:bg-card"
      } ${onClick ? "cursor-pointer" : ""}`}
    >
      {children}
    </Comp>
  )
}

export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-[68px] animate-pulse rounded-xl border border-border/60 bg-secondary/50 motion-reduce:animate-none" />
      ))}
    </div>
  )
}

export function ReadOnlyNote({ children }: { children: ReactNode }) {
  return (
    <p className="mt-4 rounded-lg bg-secondary/70 px-3 py-2 text-[11px] leading-relaxed text-muted-foreground">
      {children}
    </p>
  )
}
