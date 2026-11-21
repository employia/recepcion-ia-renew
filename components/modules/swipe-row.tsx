"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import type { LucideIcon } from "lucide-react"

export interface SwipeAction {
  id: string
  label: string
  icon: LucideIcon
  /** Runs the action. The row closes afterwards. */
  onSelect?: () => void
  /** Renders a link instead of a button (for example tel:). */
  href?: string
  tone?: "brand" | "neutral" | "danger"
}

const ACTION_W = 76 // px per action
const LOCK_PX = 10 // movement before the axis is decided
const SNAP_MS = 280

/**
 * Touch-only horizontal swipe that reveals contextual actions behind a row.
 *
 * - `touch-action: pan-y` leaves vertical scrolling to the browser; only a
 *   mostly-horizontal drag reaches this component.
 * - Mouse, pen and keyboard never engage it: the same actions must already
 *   exist as ordinary controls inside the row.
 * - The revealed actions are inert while hidden, so assistive technology
 *   never sees duplicates of the row's own controls.
 */
export function SwipeRow({ actions, children }: { actions: SwipeAction[]; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const layerRef = useRef<HTMLDivElement>(null)
  const actionsRef = useRef<HTMLDivElement>(null)
  const suppressClick = useRef(false)
  const drag = useRef<{
    id: number
    x: number
    y: number
    base: number
    offset: number
    axis: "x" | "y" | null
    t: number
    v: number
  } | null>(null)

  const total = actions.length * ACTION_W

  const place = useCallback((offset: number, animate: boolean) => {
    const layer = layerRef.current
    const acts = actionsRef.current
    if (!layer || !acts) return
    layer.style.transition = animate ? `transform ${SNAP_MS}ms var(--ease-out)` : "none"
    layer.style.transform = `translateX(${offset}px)`
    acts.style.transition = animate ? "opacity 200ms" : "none"
    acts.style.opacity = String(Math.min(Math.abs(offset) / ACTION_W, 1))
  }, [])

  const snap = useCallback(
    (next: boolean) => {
      place(next ? -total : 0, !window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      setOpen(next)
    },
    [place, total],
  )

  // Tapping anywhere else closes an open row.
  useEffect(() => {
    if (!open) return
    function onDown(e: PointerEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) snap(false)
    }
    document.addEventListener("pointerdown", onDown, true)
    return () => document.removeEventListener("pointerdown", onDown, true)
  }, [open, snap])

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "touch" || !e.isPrimary) return
    suppressClick.current = false
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, base: open ? -total : 0, offset: open ? -total : 0, axis: null, t: performance.now(), v: 0 }
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current
    if (!d || e.pointerId !== d.id) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    if (d.axis === null) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < LOCK_PX) return
      d.axis = Math.abs(dx) > Math.abs(dy) * 1.2 ? "x" : "y"
      if (d.axis === "x") e.currentTarget.setPointerCapture(e.pointerId)
    }
    if (d.axis !== "x") return
    const raw = d.base + dx
    // Past either end the row resists instead of leaving its box.
    const offset = raw > 0 ? raw * 0.2 : raw < -total ? -total + (raw + total) * 0.2 : raw
    const now = performance.now()
    d.v = (offset - d.offset) / Math.max(now - d.t, 1)
    d.offset = offset
    d.t = now
    place(offset, false)
  }

  function finish(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current
    if (!d || e.pointerId !== d.id) return
    drag.current = null
    if (d.axis !== "x") return
    suppressClick.current = true
    setTimeout(() => (suppressClick.current = false), 60)
    const fast = performance.now() - d.t < 80
    const shouldOpen = fast && Math.abs(d.v) > 0.5 ? d.v < 0 : d.offset < -total * 0.4
    snap(shouldOpen)
  }

  return (
    <div ref={wrapRef} className="relative overflow-hidden rounded-xl">
      <div
        ref={actionsRef}
        inert={!open}
        className="absolute inset-y-0 right-0 flex opacity-0"
        style={{ width: total }}
      >
        {actions.map((a) => {
          const Icon = a.icon
          const cls = `press flex flex-1 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
            a.tone === "brand" ? "bg-brand text-brand-foreground" : a.tone === "danger" ? "bg-destructive text-destructive-foreground" : "bg-secondary text-foreground"
          }`
          const body = (
            <>
              <Icon aria-hidden className="h-4 w-4" />
              {a.label}
            </>
          )
          return a.href ? (
            <a key={a.id} href={a.href} onClick={() => snap(false)} className={cls}>
              {body}
            </a>
          ) : (
            <button
              key={a.id}
              onClick={() => {
                a.onSelect?.()
                snap(false)
              }}
              className={cls}
            >
              {body}
            </button>
          )
        })}
      </div>

      <div
        ref={layerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finish}
        onPointerCancel={finish}
        onClickCapture={(e) => {
          if (suppressClick.current) {
            e.preventDefault()
            e.stopPropagation()
          } else if (open) {
            // A tap on an open row just closes it; it must not also toggle the row.
            e.preventDefault()
            e.stopPropagation()
            snap(false)
          }
        }}
        className="relative touch-pan-y rounded-xl bg-card"
      >
        {children}
        <span
          aria-hidden
          className="pointer-events-none absolute right-1 top-1/2 hidden h-5 w-[3px] -translate-y-1/2 rounded-full bg-border pointer-coarse:block"
        />
      </div>
    </div>
  )
}
