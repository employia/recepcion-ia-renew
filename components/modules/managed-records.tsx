"use client"

import { Archive, MessageSquare, RotateCcw, Trash2, UserRoundCheck } from "lucide-react"
import { useRecordManagement, type ManagedRecord, type RecordStatus } from "@/lib/record-management"

function recordTitle(record: ManagedRecord) {
  return record.data?.patientName ?? "Elemento"
}

function recordDetail(record: ManagedRecord) {
  if (!record.data) return ""
  return record.kind === "conversation"
    ? (record.data as Extract<NonNullable<ManagedRecord["data"]>, { intent: string }>).intent
    : (record.data as Extract<NonNullable<ManagedRecord["data"]>, { reason: string }>).reason
}

export function ManagedRecordsModule({ status }: { status: RecordStatus }) {
  const { records, isLoading, restore, deleteForever } = useRecordManagement()
  const items = records.filter((record) => record.status === status).sort((a, b) => b.movedAt - a.movedAt)
  const isTrash = status === "trash"

  if (isLoading) {
    return <div className="flex min-h-52 items-center justify-center text-sm text-muted-foreground" aria-busy="true">Cargando elementos…</div>
  }

  if (items.length === 0) {
    const Icon = isTrash ? Trash2 : Archive
    return (
      <div className="flex min-h-[min(52vh,26rem)] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface-raised px-6 py-10 text-center">
        <span className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-secondary text-muted-foreground"><Icon aria-hidden className="size-5" /></span>
        <h3 className="font-serif text-xl font-medium">{isTrash ? "La papelera está vacía" : "Todavía no hay archivados"}</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {isTrash
            ? "Los elementos que elimines de las bandejas aparecerán aquí."
            : "Archiva una conversación o un escalamiento para guardarlo aquí."}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted-foreground" aria-live="polite">{items.length} {items.length === 1 ? "elemento" : "elementos"}</p>
      {items.map((record) => {
        if (!record.data) return null
        const Icon = record.kind === "conversation" ? MessageSquare : UserRoundCheck
        return (
          <article key={record.key} className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 sm:flex-row sm:items-center">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-brand-ink"><Icon aria-hidden className="size-4" /></span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="truncate text-sm font-semibold">{recordTitle(record)}</h3>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {record.kind === "conversation" ? "Conversación" : "Escalamiento"}
                </span>
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">{recordDetail(record)}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {record.kind === "conversation" ? "Conversaciones" : "Escalamientos"} · {new Date(record.movedAt).toLocaleDateString("es-DO", { dateStyle: "medium" })}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => void restore(record)}
                className="press inline-flex min-h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-border px-3 text-xs font-semibold hover:bg-secondary sm:flex-none"
              >
                <RotateCcw aria-hidden className="size-3.5" /> Restaurar
              </button>
              <button
                onClick={() => void deleteForever(record)}
                aria-label={`Eliminar definitivamente: ${recordTitle(record)}`}
                className="press inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-destructive/30 px-3 text-xs font-semibold text-destructive hover:bg-destructive/10"
              >
                <Trash2 aria-hidden className="size-3.5" /> <span className="sm:hidden">Eliminar</span><span className="hidden sm:inline">Eliminar</span>
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
