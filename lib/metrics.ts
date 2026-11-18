import type { MetricsData } from "./types"

/**
 * Single entry point for MÉTRICAS data.
 *
 * No metrics source has been specified for this project yet, and the metrics
 * layer must stay independent of Renew's internal databases and programs.
 * Until a source exists this resolves to `null`, which the dashboard renders as
 * explanatory empty states. To connect real data, return a `MetricsData` here
 * (and throw on failure so the dashboard shows its error state); no UI
 * component needs to change.
 */
export async function fetchMetrics(): Promise<MetricsData | null> {
  return null
}
