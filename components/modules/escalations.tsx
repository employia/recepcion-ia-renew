"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Building2,
  ChevronDown,
  CircleAlert,
  Mail,
  MessageSquare,
  Phone,
  RotateCcw,
  SearchX,
} from "lucide-react"
import { useEscalations } from "@/lib/hooks"
import type { Escalation, EscalationTrigger } from "@/lib/types"
import {
  EmptyState,
  FilterChips,
  Initials,
  SearchBox,
  SkeletonList,
  Stat,
  StatusPill,
  Toolbar,
} from "./shared"

const FILTERS = [
  { id: "all", label: "Todos" },
  { id: "waiting-person", label: "Esperando" },
  { id: "resumed", label: "Retomados" },
] as const

const TRIGGER_LABEL: Record<EscalationTrigger, string> = {
  "explicit-request": "Petición del paciente",
  complaint: "Queja",
  "failed-attempts": "Dos intentos fallidos",
}

function ago(minutes: number) {
  if (minutes < 60) return `hace ${minutes} min`
  return `hace ${Math.round(minutes / 60)} h`
}

/**
 * Read-only list of conversations handed off to a person. Same interaction as
 * Pacientes: the details open in place, under the row that was clicked.
 */
export function EscalationsModule() {
  const { data, isLoading } = useEscalations()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<string>("all")
  const [openId, setOpenId] = useState<string | null>(null)

  const options = useMemo(
    () =>
      FILTERS.map((f) => ({
        ...f,
        count: !data ? 0 : f.id === "all" ? data.length : data.filter((e) => e.status === f.id).length,
      })),
    [data],
  )

  const filtered = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    return data.filter(
      (e) =>
        (filter === "all" || e.status === filter) &&
        (!q || e.patientName.toLowerCase().includes(q) || e.reason.toLowerCase().includes(q)),
    )
  }, [data, query, filter])

  // Once the expand animation ends, make sure the whole row is on screen.
  useEffect(() => {
    if (!openId) return
    const t = setTimeout(() => {
      document.getElementById(`escalation-${openId}`)?.scrollIntoView({
        block: "nearest",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      })
    }, 320)
    return () => clearTimeout(t)
  }, [openId])

  return (
    <div>
      <Toolbar>
        <SearchBox value={query} onChange={setQuery} placeholder="Buscar paciente o motivo..." />
        <FilterChips options={options} value={filter} onChange={setFilter} />
      </Toolbar>

      {isLoading && !data ? (
        <SkeletonList rows={4} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={SearchX}>No hay escalamientos con estos filtros.</EmptyState>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((e) => (
            <EscalationRow
              key={e.id}
              escalation={e}
              open={openId === e.id}
              onToggle={() => setOpenId(openId === e.id ? null : e.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function EscalationRow({
  escalation: e,
  open,
  onToggle,
}: {
  escalation: Escalation
  open: boolean
  onToggle: () => void
}) {
  const waiting = e.status === "waiting-person"
  return (
    <div
      id={`escalation-${e.id}`}
      className={`scroll-mt-32 scroll-mb-4 rounded-xl border transition-colors ${
        open
          ? "border-accent/40 bg-accent/5"
          : "border-border/70 bg-card/60 hover:border-border hover:bg-card"
      }`}
    >
      <button
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`escalation-${e.id}-details`}
        className="flex w-full items-start gap-3 rounded-xl p-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Initials name={e.patientName} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-sm font-semibold">{e.patientName}</p>
            <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
              {ago(e.minutesAgo)}
            </span>
          </div>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{e.reason}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
            <StatusPill status={e.status} />
            <span className="truncate text-[11px] text-muted-foreground">{e.branchName}</span>
          </div>
        </div>
        <ChevronDown
          aria-hidden
          className={`mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 motion-reduce:transition-none ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        id={`escalation-${e.id}-details`}
        role="region"
        aria-label={`Detalle del escalamiento de ${e.patientName}`}
        className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden" inert={!open}>
          <div className="space-y-3 px-3.5 pb-3.5">
            <div className="grid grid-cols-2 gap-2.5">
              <Stat icon={<CircleAlert className="h-3.5 w-3.5" />} label="Disparador" value={TRIGGER_LABEL[e.trigger]} />
              <Stat icon={<Building2 className="h-3.5 w-3.5" />} label="Sucursal" value={e.branchName} />
              <Stat icon={<Phone className="h-3.5 w-3.5" />} label="Teléfono" value={e.phone} />
              <Stat
                icon={<MessageSquare className="h-3.5 w-3.5" />}
                label="Último mensaje"
                value={e.lastMessageTime}
              />
            </div>

            <ul className="space-y-1.5 text-xs">
              <li className="flex items-start gap-2 text-muted-foreground">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  Correo enviado al equipo de Renew a las{" "}
                  <span className="text-foreground">{e.noticeTime}</span>
                </span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <RotateCcw className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  {waiting ? (
                    <>
                      La recepción digital está en pausa en esta conversación y la retomará{" "}
                      <span className="text-foreground">5 min después del último mensaje</span>.
                    </>
                  ) : (
                    <>
                      La recepción digital retomó la conversación a las{" "}
                      <span className="text-foreground">{e.resumedTime}</span>.
                    </>
                  )}
                </span>
              </li>
            </ul>

            <div className="rounded-xl bg-secondary/60 p-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Resumen
              </p>
              <p className="mt-1 text-xs leading-relaxed text-foreground/90">{e.summary}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
