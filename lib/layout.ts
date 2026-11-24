import { useSyncExternalStore } from "react"

/** Width of the collapsed sidebar rail (tablet and desktop). */
export const RAIL_WIDTH = 64
/** Width of the employee profile panel on desktop. */
export const PROFILE_WIDTH = 420
/** From this width a dashboard and the office share the screen; below it a dashboard covers the office. */
export const SPLIT_MIN = 1024
/** From this width the sidebar is a permanent rail instead of a drawer. */
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
