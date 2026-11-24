"use client"

import { Search, X } from "lucide-react"
import { Tip } from "@/components/ui/tip"
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
        className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-9 text-sm outline-none transition focus:border-ring focus:ring-4 focus:ring-ring/10"
      />
      {value && (
        <Tip label="Borrar búsqueda"><button
          onClick={() => onChange("")}
          aria-label="Borrar búsqueda"
          className="press absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button></Tip>
      )}
    </div>
  )
}

/** Sticks to the top of the panel's scroll area so search + filters stay reachable. */
export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div className="sticky -top-4 z-10 -mx-5 -mt-4 mb-4 space-y-3 border-b border-border/50 bg-card px-5 pb-3 pt-4">
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
            className={`press inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-input hover:text-foreground"
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
  "bg-brand/15 text-brand-ink",
  "bg-warning/15 text-warning-ink",
  "bg-success/15 text-success-ink",
  "bg-secondary text-secondary-foreground",
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
  attending: "bg-brand/10 text-brand-ink border-brand/25",
  resolved: "bg-success/10 text-success-ink border-success/25",
  "waiting-human": "bg-warning/12 text-warning-ink border-warning/30",
  "human-attending": "bg-brand/10 text-brand-ink border-brand/25",
  "waiting-person": "bg-warning/12 text-warning-ink border-warning/30",
  resumed: "bg-secondary text-muted-foreground border-border",
}

const STATUS_LABEL: Record<string, string> = {
  attending: "Valentina atendiendo",
  resolved: "Conversación resuelta",
  "waiting-human": "Esperando humano",
  "human-attending": "Humano atendiendo",
  "waiting-person": "Esperando persona",
  resumed: "Retomado",
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

/**
 * Empty area. With only `children` it renders the original compact message
 * (the FAQ panel uses it that way). With `title` it becomes a full state:
 * contextual icon, short message and an optional useful action.
 */
export function EmptyState({
  children,
  icon: Icon,
  title,
  description,
  action,
}: {
  children?: ReactNode
  icon?: LucideIcon
  title?: string
  description?: string
  action?: { label: string; onClick: () => void; icon?: LucideIcon }
}) {
  if (!title) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
        {Icon && <Icon className="h-5 w-5 opacity-60" />}
        {children}
      </div>
    )
  }
  const ActionIcon = action?.icon
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border px-6 py-12 text-center text-sm text-muted-foreground animate-in fade-in duration-300 motion-reduce:animate-none"
    >
      {Icon && (
        <span
          aria-hidden
          className="mb-1.5 flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-muted-foreground"
        >
          <Icon className="h-5 w-5" />
        </span>
      )}
      <p className="font-medium text-foreground">{title}</p>
      {description && <p className="max-w-[32ch] text-balance">{description}</p>}
      {children}
      {action && (
        <button
          onClick={action.onClick}
          className="press mt-3 inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 text-xs font-medium text-foreground hover:bg-secondary"
        >
          {ActionIcon && <ActionIcon className="h-3.5 w-3.5" />}
          {action.label}
        </button>
      )}
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
      className={`press w-full rounded-xl border p-3.5 text-left ${
        active
          ? "border-brand/40 bg-brand/5"
          : "border-border/70 bg-card hover:border-border hover:bg-surface-raised"
      } ${onClick ? "cursor-pointer" : ""}`}
    >
      {children}
    </Comp>
  )
}

/** A block that sweeps a soft highlight while content loads. Decorative. */
export function Skeleton({ className = "" }: { className?: string }) {
  // A caller-supplied radius (rounded-full for avatars) replaces the default one.
  return <div aria-hidden className={`skeleton ${/\brounded/.test(className) ? "" : "rounded-md"} ${className}`} />
}

/**
 * Placeholder rows shaped like the real ones (avatar, two lines, status), so
 * the list does not jump when data arrives. Announces itself once to screen readers.
 */
export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div aria-busy="true" className="space-y-2.5">
      <p role="status" className="sr-only">
        Cargando…
      </p>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} aria-hidden className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3.5">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-3.5 w-2/5" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="mt-3 h-5 w-28 rounded-full" />
          </div>
        </div>
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

/** Small labelled tile used in the expanded details of a row. */
export function Stat({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-2.5">
      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  )
}
