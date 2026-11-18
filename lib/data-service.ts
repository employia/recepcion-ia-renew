// Data access layer. Conversaciones and Escalamientos return demonstration data
// behind an async contract, so a real source can replace the bodies without
// touching any UI component. Métricas lives in ./metrics and never fabricates.

import { getAllConversations, getEscalations } from "./demo-data"
import { fetchMetrics } from "./metrics"
import type { Conversation, Escalation, MetricsData } from "./types"

function delay<T>(value: T, ms = 220): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

export const dataService = {
  conversations: (): Promise<Conversation[]> => delay(getAllConversations()),
  escalations: (): Promise<Escalation[]> => delay(getEscalations()),
  metrics: (): Promise<MetricsData | null> => fetchMetrics(),
}
