"use client"

import { Wrench } from "lucide-react"
import { Tip } from "@/components/ui/tip"
import { useShellUi } from "@/lib/shell-ui"
import { SUPPORT_MAILTO, openSupportEmail } from "@/lib/support"
import { HelpCenter } from "./help-center"

/**
 * Permanent top bar: navigation control and system status on the left, quick
 * actions (support, FAQs) on the right. It is "almost glass" on purpose: the
 * 3D canvas sits right behind it, and backdrop-filter over a WebGL canvas
 * flickers, so it uses a translucent fill without blur.
 */
export function TopBar() {
  const { navOpen, toggleNav, hoverNav } = useShellUi()

  // Hover only opens the sidebar for a real mouse: on touch, a tap is a click.
  const onEnter = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") hoverNav(true)
  }
  const onLeave = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse") hoverNav(false)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-[55] flex h-[var(--topbar-h)] items-center justify-between gap-3 border-b border-border/60 glass px-3 pt-[env(safe-area-inset-top,0px)] md:px-4">
      <div className="flex min-w-0 items-center gap-2.5">
        <Tip label={navOpen ? "Contraer la navegación" : "Abrir la navegación"}><button
          type="button"
          onClick={toggleNav}
          onPointerEnter={onEnter}
          onPointerLeave={onLeave}
          aria-expanded={navOpen}
          aria-controls="main-nav"
          aria-label={navOpen ? "Contraer la navegación" : "Abrir la navegación"}
          className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-xl hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {/* The isotype's navy is brand colour and is never recoloured: on the dark theme it sits on a white plate. */}
          <span className="flex h-9 w-9 items-center justify-center rounded-lg dark:bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/renew-isotipo.png" alt="" width={83} height={160} className="h-7 w-auto" />
          </span>
        </button></Tip>

        <span
          aria-hidden={!navOpen}
          className={`overflow-hidden whitespace-nowrap font-brand text-[1.375rem] font-bold uppercase leading-none tracking-[0.04em] text-[#234D87] transition-[max-width,opacity] duration-300 ease-[var(--ease-out)] motion-reduce:transition-none dark:text-[#8FB3E6] ${
            navOpen ? "max-w-[8rem] opacity-100" : "max-w-0 opacity-0"
          }`}
        >
          Renew
        </span>

        <span
          role="status"
          className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full bg-[#45EF05] px-3 text-[11px] font-bold leading-none tracking-[0.08em] text-white [text-shadow:0_1px_1px_rgb(0_0_0/0.3)]"
        >
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-white motion-safe:animate-pulse" />
          TRABAJANDO
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <Tip label="Contactar con soporte"><a
          href={SUPPORT_MAILTO}
          onClick={openSupportEmail}
          aria-label="Contactar con soporte"
          className="press flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Wrench className="h-5 w-5" aria-hidden />
        </a></Tip>
        <HelpCenter />
      </div>
    </header>
  )
}
