"use client"

import useSWR from "swr"
import { dataService } from "./data-service"

// Auto-refresh roughly once a minute.
const REFRESH_MS = 60_000
const options = { refreshInterval: REFRESH_MS, keepPreviousData: true }

export function useConversations() {
  return useSWR("conversations", () => dataService.conversations(), options)
}

export function useEscalations() {
  return useSWR("escalations", () => dataService.escalations(), options)
}

export function useMetrics() {
  return useSWR("metrics", () => dataService.metrics(), options)
}
