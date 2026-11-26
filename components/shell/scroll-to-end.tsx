"use client"

import { useCallback, useEffect, useRef, useState, type RefObject } from "react"
import { ChevronDown } from "lucide-react"

const DURATION_MS = 350
/** Distance (px) from the bottom under which the button is not needed. */
const THRESHOLD = 96

/** Same curve as --ease-out (cubic-bezier(0.32, 0.72, 0, 1)). */
function easeOut(x: number) {
  const [x1, y1, x2, y2] = [0.32, 0.72, 0, 1]
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by
  let t = x
  for (let i = 0; i < 6; i++) {
    const err = ((ax * t + bx) * t + cx) * t - x
    const slope = (3 * ax * t + 2 * bx) * t + cx
    if (Math.abs(err) < 1e-4 || slope === 0) break
    t -= err / slope
  }
  return ((ay * t + by) * t + cy) * t
}

/**
 * Desktop-only button that glides a scroll container to its end in 350 ms.
 * Shows only while there is content below; any wheel, touch or key input by
 * the person cancels the glide. Render it inside a `relative` host that also
 * contains the scroller.
 */
export function ScrollToEnd({ scrollRef }: { scrollRef: RefObject<HTMLElement | null> }) {
  const [visible, setVisible] = useState(false)
  const frame = useRef(0)

  const update = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setVisible(el.scrollHeight - el.scrollTop - el.clientHeight > THRESHOLD)
  }, [scrollRef])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    update()
    el.addEventListener("scroll", update, { passive: true })
    // Content (lists loading, rows expanding) changes the scrollable length without scrolling.
    const ro = new ResizeObserver(update)
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    return () => {
      el.removeEventListener("scroll", update)
      ro.disconnect()
      cancelAnimationFrame(frame.current)
    }
  }, [scrollRef, update])

  function scrollToEnd() {
    const el = scrollRef.current
    if (!el) return
    cancelAnimationFrame(frame.current)
    const from = el.scrollTop
    const to = el.scrollHeight - el.clientHeight
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || to <= from) {
      el.scrollTop = to
      return
    }
    const start = performance.now()
    const stop = () => {
      cancelAnimationFrame(frame.current)
      cleanup()
    }
    const cleanup = () => {
      el.removeEventListener("wheel", stop)
      el.removeEventListener("touchstart", stop)
      el.removeEventListener("keydown", stop)
      el.removeEventListener("pointerdown", stop)
    }
    el.addEventListener("wheel", stop, { passive: true })
    el.addEventListener("touchstart", stop, { passive: true })
    el.addEventListener("keydown", stop)
    el.addEventListener("pointerdown", stop)
    const step = (now: number) => {
      const p = Math.min((now - start) / DURATION_MS, 1)
      const end = el.scrollHeight - el.clientHeight // content may have grown meanwhile
      el.scrollTop = from + (Math.max(to, end) - from) * easeOut(p)
      if (p < 1) frame.current = requestAnimationFrame(step)
      else cleanup()
    }
    frame.current = requestAnimationFrame(step)
  }

  return (
    <button
      type="button"
      onClick={scrollToEnd}
      inert={!visible}
      aria-label="Ir al final"
      className={`press absolute bottom-4 right-5 z-10 hidden h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-float transition-[opacity,transform,visibility,color,background-color] duration-350 ease-[var(--ease-out)] hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-opacity md:flex ${
        visible ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible translate-y-2 opacity-0 motion-reduce:translate-y-0"
      }`}
    >
      <ChevronDown className="h-5 w-5" />
    </button>
  )
}
