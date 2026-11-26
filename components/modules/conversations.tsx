"use client"

import { useMemo, useState } from "react"
import { Archive, CircleAlert, MessageSquare, MessagesSquare, RefreshCw, SearchX, Trash2 } from "lucide-react"
import { useConversations } from "@/lib/hooks"
import { useRecordManagement } from "@/lib/record-management"
import { SwipeRow } from "./swipe-row"
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
  const { data, isLoading, error, mutate } = useConversations()
  const { isManaged, archive, moveToTrash, isLoading: recordsLoading } = useRecordManagement()
  const visibleData = useMemo(() => data?.filter((item) => !isManaged("conversation", item.id)), [data, isManaged])
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<string>("all")

  const options = useMemo(
    () =>
      FILTERS.map((f) => ({
        ...f,
        count: !visibleData ? 0 : f.id === "all" ? visibleData.length : visibleData.filter((c) => c.status === f.id).length,
      })),
    [visibleData],
  )

  const filtered = useMemo(() => {
    if (!visibleData) return []
    const q = query.trim().toLowerCase()
    return visibleData.filter(
      (c) =>
        (filter === "all" || c.status === filter) &&
        (!q || c.patientName.toLowerCase().includes(q) || c.intent.toLowerCase().includes(q)),
    )
  }, [visibleData, query, filter])

  return (
    <div>
      <Toolbar>
        <SearchBox value={query} onChange={setQuery} placeholder="Buscar paciente o motivo..." />
        <FilterChips options={options} value={filter} onChange={setFilter} />
      </Toolbar>

      {(isLoading && !data) || recordsLoading ? (
        <SkeletonList />
      ) : error && !data ? (
        <EmptyState
          icon={CircleAlert}
          title="No se pudieron cargar las conversaciones"
          description="Vuelve a intentarlo en unos segundos."
          action={{ label: "Reintentar", icon: RefreshCw, onClick: () => void mutate() }}
        />
      ) : visibleData && visibleData.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title="Aún no hay conversaciones"
          description="Cuando la recepción digital atienda a alguien, la conversación aparecerá aquí."
          action={{ label: "Actualizar", icon: RefreshCw, onClick: () => void mutate() }}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Sin resultados"
          description="Ninguna conversación coincide con la búsqueda o el filtro."
          action={{
            label: "Limpiar filtros",
            onClick: () => {
              setQuery("")
              setFilter("all")
            },
          }}
        />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((c) => (
            <SwipeRow
              key={c.id}
              actions={[
                { id: "archive", label: "Archivar", icon: Archive, onSelect: () => void archive("conversation", c), tone: "brand" },
                { id: "trash", label: "Eliminar", icon: Trash2, onSelect: () => void moveToTrash("conversation", c), tone: "danger" },
              ]}
            >
              <RowCard>
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
              {/* Mouse / trackpad: buttons. Touch: the same actions live in SwipeRow; here they stay only for screen readers. */}
              <div className="mt-3 flex justify-end gap-2 border-t border-border/70 pt-3 pointer-coarse:sr-only">
                <button onClick={() => void archive("conversation", c)} className="press inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold hover:bg-secondary">
                  <Archive aria-hidden className="size-3.5" /> Archivar
                </button>
                <button onClick={() => void moveToTrash("conversation", c)} className="press inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-xs font-semibold bg-signout text-white hover:opacity-90">
                  <Trash2 aria-hidden className="size-3.5" /> Eliminar
                </button>
              </div>
              </RowCard>
            </SwipeRow>
          ))}
        </div>
      )}
    </div>
  )
}
