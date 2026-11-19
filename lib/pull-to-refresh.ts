"use client"

import { useEffect, useRef, type RefObject } from "react"

const THRESHOLD = 64 // px of pull needed to trigger
const HOLD = 56 // px the content rests at while refreshing
const MAX_PULL = 110
const RESISTANCE = 0.5
const LOCK_PX = 8 // movement before the gesture's axis is decided

interface Options {
  /** The element that scrolls. */
  scrollRef: RefObject<HTMLElement | null>
  /** The element that receives pointer-driven CSS variables (--ptr, --ptr-p). */
  hostRef: RefObject<HTMLElement | null>
  onRefresh: () => Promise<unknown>
  enabled: boolean
}

/** True when something between the touch target and the scroller is itself scrolled down. */
function nestedScrolled(target: EventTarget | null, root: HTMLElement) {
  let el = target instanceof HTMLElement ? target : null
  while (el && el !== root) {
    if (el.scrollTop > 0) {
      const oy = getComputedStyle(el).overflowY
      if (oy === "auto" || oy === "scroll") return true
    }
    el = el.parentElement
  }
  return false
}

/**
 * Touch-only pull-to-refresh. It engages only when the scroller is at the top
 * and the finger moves mostly downward, so normal scrolling, horizontal swipes
 * and nested scrollers are never intercepted. Mouse and keyboard users are
 * unaffected; they use the refresh button.
 */
export function usePullToRefresh({ scrollRef, hostRef, onRefresh, enabled }: Options) {
  const onRefreshRef = useRef(onRefresh)
  useEffect(() => {
    onRefreshRef.current = onRefresh
  })

  useEffect(() => {
    const scroller = scrollRef.current
    const host = hostRef.current
    if (!enabled || !scroller || !host) return

    let startX = 0
    let startY = 0
    let axis: "x" | "y" | null = null
    let tracking = false
    let pull = 0
    let busy = false

    function paint(px: number) {
      host!.style.setProperty("--ptr", `${px}px`)
      host!.style.setProperty("--ptr-p", String(Math.min(px / HOLD, 1)))
    }
    function setPulling(v: boolean) {
      host!.dataset.pulling = String(v)
    }
    function reset() {
      tracking = false
      axis = null
      pull = 0
      setPulling(false)
      paint(0)
    }

    function onStart(e: TouchEvent) {
      if (busy || e.touches.length !== 1 || scroller!.scrollTop > 0 || nestedScrolled(e.target, scroller!)) return
      tracking = true
      axis = null
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }

    function onMove(e: TouchEvent) {
      if (!tracking) return
      const dx = e.touches[0].clientX - startX
      const dy = e.touches[0].clientY - startY
      if (axis === null) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < LOCK_PX) return
        // Only a mostly-vertical downward gesture is ours; anything else is left alone.
        axis = dy > 0 && Math.abs(dy) > Math.abs(dx) * 1.2 ? "y" : "x"
        if (axis === "y") setPulling(true)
      }
      if (axis !== "y") return
      if (scroller!.scrollTop > 0 || dy <= 0) return reset()
      if (e.cancelable) e.preventDefault()
      pull = Math.min((dy - LOCK_PX) * RESISTANCE, MAX_PULL)
      paint(Math.max(pull, 0))
    }

    async function onEnd() {
      if (!tracking) return
      const triggered = axis === "y" && pull >= THRESHOLD
      tracking = false
      axis = null
      setPulling(false)
      if (!triggered) return reset()
      busy = true
      host!.dataset.refreshing = "true"
      paint(HOLD)
      try {
        await onRefreshRef.current()
      } finally {
        busy = false
        delete host!.dataset.refreshing
        reset()
      }
    }

    scroller.addEventListener("touchstart", onStart, { passive: true })
    scroller.addEventListener("touchmove", onMove, { passive: false })
    scroller.addEventListener("touchend", onEnd)
    scroller.addEventListener("touchcancel", reset)
    return () => {
      scroller.removeEventListener("touchstart", onStart)
      scroller.removeEventListener("touchmove", onMove)
      scroller.removeEventListener("touchend", onEnd)
      scroller.removeEventListener("touchcancel", reset)
      reset()
    }
  }, [scrollRef, hostRef, enabled])
}
