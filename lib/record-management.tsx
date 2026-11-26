"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import useSWR, { useSWRConfig } from "swr"
import { useApp } from "@/lib/store"
import type { Conversation, Escalation } from "@/lib/types"

export type RecordKind = "conversation" | "escalation"
export type RecordStatus = "archived" | "trash" | "deleted"
export type ManagedData = Conversation | Escalation

/**
 * A conversation or escalation moved out of its dashboard. The original item
 * is stored whole so restoring it returns the exact same record to its module.
 */
export interface ManagedRecord {
  key: string
  kind: RecordKind
  status: RecordStatus
  data?: ManagedData
  movedAt: number
}

interface RecordManagementValue {
  records: ManagedRecord[]
  isLoading: boolean
  isManaged: (kind: RecordKind, id: string) => boolean
  archive: (kind: RecordKind, data: ManagedData) => Promise<void>
  moveToTrash: (kind: RecordKind, data: ManagedData) => Promise<void>
  restore: (record: ManagedRecord) => Promise<void>
  deleteForever: (record: ManagedRecord) => Promise<void>
}

const RecordManagementContext = createContext<RecordManagementValue | null>(null)

const DB_NAME = "renew-records"
const STORE_NAME = "records"
const SWR_KEY = "managed-records"

/** Local storage on this device, keyed by signed-in user so accounts never see each other's records. */
interface StoredRecord extends Omit<ManagedRecord, "key"> {
  key: string
  recordKey: string
  userId: string
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: "key" })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function withStore<T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await openDb()
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = run(db.transaction(STORE_NAME, mode).objectStore(STORE_NAME))
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

async function loadRecords(userId: string): Promise<ManagedRecord[]> {
  const all = await withStore<StoredRecord[]>("readonly", (store) => store.getAll())
  return all
    .filter((record) => record.userId === userId)
    .map(({ userId: _owner, recordKey, ...record }) => ({ ...record, key: recordKey }))
}

export function RecordManagementProvider({ children }: { children: ReactNode }) {
  const { session } = useApp()
  const userId = session?.id ?? null
  const { mutate: globalMutate } = useSWRConfig()
  const cacheKey = userId ? `${SWR_KEY}:${userId}` : null
  const { data, isLoading } = useSWR(cacheKey, () => loadRecords(userId as string))
  const records = useMemo(() => data ?? [], [data])
  const [notice, setNotice] = useState<{ message: string; undo?: () => Promise<void> } | null>(null)
  // The card stays mounted for the length of its exit animation (see .undo-toast).
  const [shown, setShown] = useState<typeof notice>(null)
  const [toastOpen, setToastOpen] = useState(false)

  useEffect(() => {
    if (!notice) return
    const timeout = window.setTimeout(() => setNotice(null), 5000)
    return () => window.clearTimeout(timeout)
  }, [notice])

  useEffect(() => {
    if (notice) {
      setShown(notice)
      setToastOpen(true)
      return
    }
    setToastOpen(false)
    const timeout = window.setTimeout(() => setShown(null), 300)
    return () => window.clearTimeout(timeout)
  }, [notice])

  const refresh = useCallback(() => globalMutate(cacheKey), [globalMutate, cacheKey])

  const put = useCallback(
    async (record: ManagedRecord) => {
      if (!userId) return
      const stored: StoredRecord = { ...record, recordKey: record.key, key: `${userId}:${record.key}`, userId }
      await withStore("readwrite", (store) => store.put(stored))
      await refresh()
    },
    [userId, refresh],
  )

  const remove = useCallback(
    async (key: string) => {
      if (!userId) return
      await withStore("readwrite", (store) => store.delete(`${userId}:${key}`))
      await refresh()
    },
    [userId, refresh],
  )

  const moveRecord = useCallback(
    async (kind: RecordKind, data: ManagedData, status: RecordStatus) => {
      try {
        const key = `${kind}:${data.id}`
        const previous = records.find((record) => record.key === key)
        const moved: ManagedRecord = { key, kind, status, data, movedAt: Date.now() }
        await put(moved)
        setNotice({
          message: status === "archived" ? "Elemento archivado" : "Elemento enviado a la papelera",
          undo: async () => {
            if (previous) await put(previous)
            else await remove(key)
          },
        })
      } catch {
        setNotice({ message: "No se pudo guardar el cambio en este navegador." })
      }
    },
    [put, records, remove],
  )

  const restore = useCallback(
    async (record: ManagedRecord) => {
      try {
        await remove(record.key)
        setNotice({ message: "Elemento restaurado" })
      } catch {
        setNotice({ message: "No se pudo restaurar el elemento." })
      }
    },
    [remove],
  )

  const deleteForever = useCallback(
    async (record: ManagedRecord) => {
      if (!window.confirm("¿Eliminar definitivamente este elemento? Esta acción no se puede deshacer.")) return
      try {
        await put({ key: record.key, kind: record.kind, status: "deleted", movedAt: Date.now() })
        setNotice({ message: "Elemento eliminado definitivamente" })
      } catch {
        setNotice({ message: "No se pudo eliminar el elemento." })
      }
    },
    [put],
  )

  const value = useMemo<RecordManagementValue>(
    () => ({
      records,
      isLoading,
      isManaged: (kind, id) => records.some((record) => record.key === `${kind}:${id}`),
      archive: (kind, data) => moveRecord(kind, data, "archived"),
      moveToTrash: (kind, data) => moveRecord(kind, data, "trash"),
      restore,
      deleteForever,
    }),
    [records, isLoading, moveRecord, restore, deleteForever],
  )

  return (
    <RecordManagementContext.Provider value={value}>
      {children}
      {shown && (
        <div className="pointer-events-none fixed inset-x-3 bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] z-[70] flex justify-center md:bottom-6">
          <div
            data-state={toastOpen ? "open" : "closed"}
            aria-hidden={toastOpen ? undefined : true}
            className="undo-toast pointer-events-auto flex w-full max-w-md items-center justify-between gap-4 rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground shadow-float"
            role="status"
            aria-live="polite"
          >
            <span>{shown.message}</span>
            {shown.undo && (
              <button
                className="shrink-0 rounded-lg px-3 py-2 font-semibold text-brand-ink hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={async () => {
                  try {
                    await shown.undo?.()
                  } catch {
                    setNotice({ message: "No se pudo deshacer el cambio." })
                  }
                  setNotice(null)
                }}
              >
                Deshacer
              </button>
            )}
          </div>
        </div>
      )}
    </RecordManagementContext.Provider>
  )
}

export function useRecordManagement() {
  const context = useContext(RecordManagementContext)
  if (!context) throw new Error("useRecordManagement must be used within RecordManagementProvider")
  return context
}
