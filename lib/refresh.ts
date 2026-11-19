"use client"

import { useCallback, useRef, useState } from "react"
import { useSWRConfig } from "swr"
import { SWR_KEYS } from "./hooks"
import type { ModuleId } from "./types"

/** Modules that show live data and can be refreshed by hand. */
const REFRESH_KEY: Partial<Record<ModuleId, string>> = {
  conversations: SWR_KEYS.conversations,
  escalations: SWR_KEYS.escalations,
  metrics: SWR_KEYS.metrics,
}

/** Keeps the feedback visible long enough to be seen when the data arrives instantly. */
const MIN_VISIBLE_MS = 600

/**
 * Manual refresh of the open module. It only revalidates the module's SWR key,
 * so nothing else reloads, and the previous data stays on screen meanwhile.
 */
export function useModuleRefresh(module: ModuleId | null) {
  const { mutate } = useSWRConfig()
  const [refreshing, setRefreshing] = useState(false)
  const busy = useRef(false)
  const key = module ? REFRESH_KEY[module] : undefined

  const refresh = useCallback(async () => {
    if (!key || busy.current) return
    busy.current = true
    setRefreshing(true)
    try {
      await Promise.all([mutate(key), new Promise((r) => setTimeout(r, MIN_VISIBLE_MS))])
    } catch {
      // A failed revalidation is surfaced by the module's own error state.
    } finally {
      busy.current = false
      setRefreshing(false)
    }
  }, [key, mutate])

  return { refresh, refreshing, canRefresh: key !== undefined }
}
