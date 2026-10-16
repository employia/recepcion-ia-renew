"use client"

import { useMemo, useState } from "react"
import { CalendarDays, MessageSquare, Phone, SearchX, Stethoscope } from "lucide-react"
import { usePatients } from "@/lib/hooks"
import type { Patient } from "@/lib/types"
import { EmptyState, Initials, RowCard, SearchBox, SkeletonList, Toolbar } from "./shared"

export function PatientsModule() {
  const { data, isLoading } = usePatients()
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<Patient | null>(null)

  const filtered = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    return q
      ? data.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.service.toLowerCase().includes(q) ||
            p.phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")),
        )
      : data
  }, [data, query])

  const active = selected && filtered.some((p) => p.id === selected.id) ? selected : null

  return (
    <div>
      <Toolbar>
        <SearchBox value={query} onChange={setQuery} placeholder="Buscar paciente, servicio o teléfono..." />
        {data && (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium tabular-nums text-foreground">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "paciente" : "pacientes"}
          </p>
        )}
      </Toolbar>

      {active && (
        <div className="mb-4 rounded-2xl border border-accent/30 bg-accent/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Initials name={active.name} />
              <h3 className="truncate text-base font-semibold">{active.name}</h3>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="shrink-0 text-[11px] text-muted-foreground underline-offset-2 hover:underline"
            >
              Cerrar
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <Stat icon={<CalendarDays className="h-3.5 w-3.5" />} label="Citas" value={active.appointments} />
            <Stat icon={<MessageSquare className="h-3.5 w-3.5" />} label="Conversaciones" value={active.conversations} />
            <Stat icon={<Stethoscope className="h-3.5 w-3.5" />} label="Servicio" value={active.service} />
            <Stat icon={<Phone className="h-3.5 w-3.5" />} label="Teléfono" value={active.phone} />
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Última interacción: <span className="text-foreground">{active.lastInteraction}</span>
          </p>
        </div>
      )}

      {isLoading && !data ? (
        <SkeletonList />
      ) : filtered.length === 0 ? (
        <EmptyState icon={SearchX}>No se encontró ningún paciente.</EmptyState>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((p) => (
            <RowCard key={p.id} onClick={() => setSelected(p)} active={active?.id === p.id}>
              <div className="flex items-center gap-3">
                <Initials name={p.name} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{p.name}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{p.service}</p>
                </div>
                <div className="shrink-0 text-right text-[11px] text-muted-foreground">
                  <span className="tabular-nums">{p.appointments}</span> citas ·{" "}
                  <span className="tabular-nums">{p.conversations}</span> conv.
                </div>
              </div>
            </RowCard>
          ))}
        </div>
      )}

    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/70 p-2.5">
      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  )
}
