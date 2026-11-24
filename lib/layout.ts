import { useSyncExternalStore } from "react"

/** Width of the docked icon rail, level one of the navigation (tablet and desktop). Keep in sync with `md:w-[72px]` in app-sidebar and `md:left-[calc(72px+...)]` in dashboard-panel. */
export const SIDEBAR_WIDTH = 72
/**
 * Horizontal space reserved for the docked rail. The dashboard panel (level two)
 * starts right at its edge (`md:left-[calc(72px+...)]` in dashboard-panel) and the
 * office is framed in whatever remains to the right.
 */
export const RAIL_OFFSET = SIDEBAR_WIDTH
/** Width of the employee profile panel on desktop. */
export const PROFILE_WIDTH = 420
/** From this width a dashboard and the office share the screen; below it a dashboard covers the office. */
export const SPLIT_MIN = 1024
/** From this width the icon rail is permanently docked instead of a drawer. */
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
