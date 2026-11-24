"use client"

import { Tooltip } from "@base-ui/react/tooltip"
import type { ReactElement, ReactNode } from "react"

/**
 * One tooltip for the whole app. It opens on mouse hover (after a short delay,
 * instantly when moving between neighbouring tooltips) and on keyboard focus,
 * closes when the pointer leaves, flips to stay on screen, and never opens on
 * touch. It supplements `aria-label`, it does not replace it.
 */
export function TipProvider({ children }: { children: ReactNode }) {
  return (
    <Tooltip.Provider delay={450} closeDelay={0} timeout={400}>
      {children}
    </Tooltip.Provider>
  )
}

export function Tip({
  label,
  children,
  side = "bottom",
  align = "center",
  disabled = false,
}: {
  label: ReactNode
  /** A single element that accepts a ref (a button, a link). */
  children: ReactElement
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  disabled?: boolean
}) {
  return (
    <Tooltip.Root disabled={disabled}>
      <Tooltip.Trigger render={children} />
      <Tooltip.Portal>
        <Tooltip.Positioner side={side} align={align} sideOffset={8} collisionPadding={8} className="z-[80]">
          <Tooltip.Popup className="glass-strong pointer-events-none origin-[var(--transform-origin)] rounded-lg border border-border/70 px-2.5 py-1.5 text-xs font-medium leading-tight text-popover-foreground shadow-float transition-[opacity,transform] duration-150 ease-[var(--ease-out)] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 motion-reduce:transition-none">
            {label}
          </Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}
