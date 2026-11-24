import { useSyncExternalStore } from "react"

/** Width of the collapsed floating sidebar (tablet and desktop). Keep in sync with `md:w-[68px]` in app-sidebar. */
export const RAIL_WIDTH = 68
/** Gap between the floating sidebar and the screen edge (and between it and the content). */
export const FLOAT_GAP = 12
/**
 * Horizontal space reserved for the floating sidebar: gap + rail + gap. The
 * dashboard panel joins the rail (its left edge is gap + rail = 80px, see
 * `md:left-[calc(80px+...)]` in dashboard-panel), so the office is framed to
 * the right of that panel with one more gap.
 */
export const RAIL_OFFSET = FLOAT_GAP + RAIL_WIDTH + FLOAT_GAP
/** Width of the employee profile panel on desktop. */
export const PROFILE_WIDTH = 420
/** From this width a dashboard and the office share the screen; below it a dashboard covers the office. */
export const SPLIT_MIN = 1024
/** From this width the sidebar is a permanent floating rail instead of a floating drawer. */
export const RAIL_MIN = 768

export function dashboardWidth(viewport: number) {
  return Math.round(Math.min(Math.max(viewport * 0.36, 400), 560))
}

function subscribe(onChange: () => void) {
  window.addEventListener("resize", onChange)
  return () => window.removeEventListener("resize", onChange)
}

/** Current viewport width; 1280 on the server. */
export function useViewportWidth() {
  return useSyncExternalStore(
    subscribe,
    () => window.innerWidth,
    () => 1280,
  )
}
