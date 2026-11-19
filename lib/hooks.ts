"use client"

import useSWR from "swr"
import { dataService } from "./data-service"

// Auto-refresh roughly once a minute.
const REFRESH_MS = 60_000
const options = { refreshInterval: REFRESH_MS, keepPreviousData: true }

/** SWR cache keys, shared with the manual refresh (button and pull-to-refresh). */
export const SWR_KEYS = {
  conversations: "conversations",
  escalations: "escalations",
  metrics: "metrics",
} as const

export function useConversations() {
  return useSWR(SWR_KEYS.conversations, () => dataService.conversations(), options)
}

export function useEscalations() {
  return useSWR(SWR_KEYS.escalations, () => dataService.escalations(), options)
}

export function useMetrics() {
  return useSWR(SWR_KEYS.metrics, () => dataService.metrics(), options)
}
