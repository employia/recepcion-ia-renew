"use client"

import { useMemo, useState } from "react"
import { CalendarX, MapPin, Stethoscope } from "lucide-react"
import { useAppointments } from "@/lib/hooks"
import { EmptyState, RowCard, SearchBox, SkeletonList, Toolbar } from "./shared"

export function AgendaModule() {
  const { data, isLoading } = useAppointments()
  const [query, setQuery] = useState("")

  const { grouped, total } = useMemo(() => {
    if (!data) return { grouped: [] as [string, NonNullable<typeof data>][], total: 0 }
    const q = query.trim().toLowerCase()
    const rows = q
      ? data.filter(
          (a) =>
            a.patientName.toLowerCase().includes(q) ||
            a.service.toLowerCase().includes(q) ||
            a.branchLabel.toLowerCase().includes(q),
        )
      : data
    const map = new Map<string, typeof rows>()
    for (const a of rows) {
      const list = map.get(a.date) ?? []
      list.push(a)
      map.set(a.date, list)
    }
    return { grouped: Array.from(map.entries()), total: rows.length }
  }, [data, query])

  return (
    <div>
      <Toolbar>
        <SearchBox
          value={query}
          onChange={setQuery}
          placeholder="Buscar paciente, servicio o sucursal..."
        />
        {data && (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium tabular-nums text-foreground">{total}</span>{" "}
            {total === 1 ? "cita" : "citas"}
          </p>
        )}
      </Toolbar>

      {isLoading && !data ? (
        <SkeletonList />
      ) : grouped.length === 0 ? (
        <EmptyState icon={CalendarX}>No hay citas para esta búsqueda.</EmptyState>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, rows]) => (
            <section key={date}>
              <h3 className="mb-2 flex items-center justify-between font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                <span>{date}</span>
                <span className="tabular-nums normal-case tracking-normal">{rows.length}</span>
              </h3>
              <div className="space-y-2.5">
                {rows.map((a) => (
                  <RowCard key={a.id}>
                    <div className="flex items-stretch gap-3">
                      {/* Time is the anchor of an appointment: give it its own column */}
                      <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-accent/10 px-1 py-1.5 text-accent">
                        <span className="font-mono text-sm font-semibold leading-none tabular-nums">
                          {a.time.split(" ")[0]}
                        </span>
                        <span className="mt-1 font-mono text-[10px] leading-none opacity-80">
                          {a.time.split(" ")[1] ?? ""}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{a.patientName}</p>
                        <div className="mt-1 flex flex-col gap-0.5 text-[11px] text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <Stethoscope className="h-3 w-3 shrink-0" />
                            <span className="truncate">{a.service}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{a.branchLabel}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </RowCard>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
