"use client"

import { useMemo, useState } from "react"
import { MessageSquare, SearchX } from "lucide-react"
import { useConversations } from "@/lib/hooks"
import {
  EmptyState,
  FilterChips,
  Initials,
  RowCard,
  SearchBox,
  SkeletonList,
  StatusPill,
  Toolbar,
} from "./shared"

const FILTERS = [
  { id: "all", label: "Todas" },
  { id: "attending", label: "Atendiendo" },
  { id: "waiting-human", label: "Esperando" },
  { id: "resolved", label: "Resueltas" },
] as const

export function ConversationsModule() {
  const { data, isLoading } = useConversations()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<string>("all")

  const options = useMemo(
    () =>
      FILTERS.map((f) => ({
        ...f,
        count: !data ? 0 : f.id === "all" ? data.length : data.filter((c) => c.status === f.id).length,
      })),
    [data],
  )

  const filtered = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    return data.filter(
      (c) =>
        (filter === "all" || c.status === filter) &&
        (!q || c.patientName.toLowerCase().includes(q) || c.intent.toLowerCase().includes(q)),
    )
  }, [data, query, filter])

  return (
    <div>
      <Toolbar>
        <SearchBox value={query} onChange={setQuery} placeholder="Buscar paciente o motivo..." />
        <FilterChips options={options} value={filter} onChange={setFilter} />
      </Toolbar>

      {isLoading && !data ? (
        <SkeletonList />
      ) : filtered.length === 0 ? (
        <EmptyState icon={SearchX}>No hay conversaciones con estos filtros.</EmptyState>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((c) => (
            <RowCard key={c.id}>
              <div className="flex items-start gap-3">
                <Initials name={c.patientName} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="truncate text-sm font-semibold">{c.patientName}</p>
                    <span className="shrink-0 font-mono text-[11px] text-muted-foreground">
                      {c.time}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{c.intent}</p>
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <StatusPill status={c.status} />
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      {c.messages} mensajes
                    </span>
                  </div>
                </div>
              </div>
            </RowCard>
          ))}
        </div>
      )}
    </div>
  )
}
