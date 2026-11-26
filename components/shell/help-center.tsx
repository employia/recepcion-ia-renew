"use client"

import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react"
import { ChevronDown, CircleHelp, SearchX, X } from "lucide-react"
import { FAQ_CATEGORIES, FAQ_ITEMS, type FaqItem } from "@/lib/faq"
import { EmptyState, SearchBox } from "@/components/modules/shared"

/** Lowercase, accent-free, punctuation-free, so "metricas" finds "Métricas". */
function fold(text: string) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
}

const SEARCH_INDEX = FAQ_ITEMS.map((item) => ({
  item,
  haystack: ` ${fold([item.question, item.answer, item.category, ...(item.keywords ?? [])].join(" "))}`,
}))

function searchFaq(query: string): FaqItem[] {
  const terms = fold(query).split(" ").filter(Boolean)
  if (terms.length === 0) return FAQ_ITEMS
  // Each term must start a word, so "tema" does not match "sistema".
  return SEARCH_INDEX.filter(({ haystack }) => terms.every((t) => haystack.includes(` ${t}`))).map((r) => r.item)
}

interface HelpState {
  open: boolean
  panelId: string
  toggle: () => void
  registerFab: (el: HTMLButtonElement | null) => void
}

const HelpContext = createContext<HelpState | null>(null)

function useHelp() {
  const ctx = useContext(HelpContext)
  if (!ctx) throw new Error("HelpFab must be rendered inside HelpCenter")
  return ctx
}

/**
 * Help state and panel. The trigger is `HelpFab`, rendered wherever the shell
 * needs it: inside the team dock on desktop, floating at the top on mobile.
 */
export function HelpCenter({
  insetLeft = 0,
  insetRight = 0,
  children,
}: {
  insetLeft?: number
  insetRight?: number
  children?: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const fabs = useRef(new Set<HTMLButtonElement>())
  const titleRef = useRef<HTMLHeadingElement>(null)
  const panelId = useId()
  const titleId = useId()

  const results = useMemo(() => searchFaq(query), [query])
  const groups = useMemo(
    () =>
      FAQ_CATEGORIES.map((category) => ({
        category,
        items: results.filter((i) => i.category === category),
      })).filter((g) => g.items.length > 0),
    [results],
  )

  const registerFab = useCallback((el: HTMLButtonElement | null) => {
    if (el) fabs.current.add(el)
  }, [])

  const close = useCallback(() => {
    setOpen(false)
    // Two triggers exist (dock on desktop, floating on mobile); focus the visible one.
    const visible = [...fabs.current].find((b) => b.isConnected && b.getClientRects().length > 0)
    visible?.focus({ preventScroll: true })
  }, [])

  const toggle = useCallback(() => {
    if (open) return close()
    setQuery("")
    setExpandedId(null)
    setOpen(true)
  }, [open, close])

  useEffect(() => {
    if (!open) return
    titleRef.current?.focus({ preventScroll: true })
    // Capture phase: the help panel is the topmost layer, so Escape closes it
    // before the module or profile panels underneath see the key.
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return
      e.stopPropagation()
      close()
    }
    document.addEventListener("keydown", onKey, true)
    return () => document.removeEventListener("keydown", onKey, true)
  }, [open, close])

  const state = useMemo(() => ({ open, panelId, toggle, registerFab }), [open, panelId, toggle, registerFab])

  return (
    <HelpContext.Provider value={state}>
      {children}

      <div
        aria-hidden
        onClick={close}
        className={`fixed inset-0 z-[41] bg-black/30 transition-opacity duration-300 motion-reduce:transition-none md:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <section
        id={panelId}
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        inert={!open}
        style={{ ["--help-center" as string]: `calc((100vw + ${insetLeft}px - ${insetRight}px) / 2)` }}
        className={`fixed inset-x-3 top-[calc(4.75rem+env(safe-area-inset-top,0px))] z-[42] flex max-h-[calc(100dvh-5.75rem-env(safe-area-inset-top,0px))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-float transition-[transform,opacity,visibility] duration-300 ease-[var(--ease-out)] motion-reduce:transition-opacity md:inset-x-auto md:bottom-24 md:top-auto md:max-h-[calc(100dvh-7rem-env(safe-area-inset-bottom,0px))] md:left-[var(--help-center)] md:w-[min(26rem,calc(100vw-100px))] md:-translate-x-1/2 ${
          open
            ? "pointer-events-auto visible translate-y-0 opacity-100"
            : "pointer-events-none invisible -translate-y-3 opacity-0 md:translate-y-3 motion-reduce:translate-y-0"
        }`}
      >
        <div className="shrink-0 space-y-3 border-b border-border/60 p-4">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h2
                id={titleId}
                ref={titleRef}
                tabIndex={-1}
                className="font-serif text-xl leading-tight outline-none"
              >
                Preguntas frecuentes
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">Respuestas rápidas sobre la Recepción Digital</p>
            </div>
            <button
              onClick={close}
              aria-label="Cerrar las preguntas frecuentes"
              className="press -mr-1 -mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <SearchBox value={query} onChange={setQuery} placeholder="Buscar una pregunta" />
        </div>

        <div className="scroll-slim min-h-0 flex-1 overflow-y-auto p-4">
          <p role="status" className="sr-only">
            {results.length === 0
              ? "Sin resultados"
              : `${results.length} ${results.length === 1 ? "pregunta" : "preguntas"}`}
          </p>
          {groups.length === 0 ? (
            <EmptyState icon={SearchX}>
              <p className="font-medium text-foreground">No encontramos preguntas relacionadas</p>
              <p className="px-6">Prueba con otra palabra, como «tema», «métricas» o «menú».</p>
            </EmptyState>
          ) : (
            <div className="space-y-5">
              {groups.map((group) => (
                <section key={group.category} aria-labelledby={`${panelId}-${group.category}`}>
                  <h3
                    id={`${panelId}-${group.category}`}
                    className="mb-2 text-sm font-semibold text-muted-foreground"
                  >
                    {group.category}
                  </h3>
                  <ul className="space-y-2">
                    {group.items.map((item) => (
                      <FaqRow
                        key={item.id}
                        item={item}
                        baseId={panelId}
                        expanded={expandedId === item.id}
                        onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
                      />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </section>
    </HelpContext.Provider>
  )
}

/**
 * Trigger of the help panel.
 * - `dock`: desktop only, first item of the team capsule. Its tooltip opens to
 *   the left, or above when `tooltipAbove` (a module is open and the dock sits
 *   next to the module panel).
 * - `floating`: mobile only, fixed at the top right (unchanged).
 */
export function HelpFab({
  variant,
  tooltipAbove = false,
}: {
  variant: "dock" | "floating"
  tooltipAbove?: boolean
}) {
  const { open, panelId, toggle, registerFab } = useHelp()

  if (variant === "floating") {
    return (
      <div className="pointer-events-auto fixed right-3 top-3 z-[32] mt-[env(safe-area-inset-top,0px)] md:hidden">
        <button
          ref={registerFab}
          onClick={toggle}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label="Preguntas frecuentes"
          className={`press glass flex h-12 w-12 items-center justify-center rounded-full border shadow-soft hover:scale-105 ${
            open ? "border-brand/60 text-brand" : "border-border/60 text-muted-foreground hover:text-foreground"
          }`}
        >
          <CircleHelp className="h-6 w-6" />
        </button>
      </div>
    )
  }

  return (
    <li className="group relative hidden md:block">
      <button
        ref={registerFab}
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Preguntas frecuentes"
        className="press flex h-12 w-12 items-center justify-center rounded-full hover:scale-105"
      >
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-full border bg-secondary transition-colors duration-200 ${
            open ? "border-brand/60 text-brand" : "border-border text-muted-foreground group-hover:bg-accent group-hover:text-foreground"
          }`}
        >
          <CircleHelp className="h-5 w-5" />
        </span>
      </button>
      <span
        aria-hidden
        className={`pointer-events-none absolute whitespace-nowrap rounded-xl border border-border bg-popover px-3 py-2 text-sm font-semibold leading-tight opacity-0 shadow-float transition-opacity duration-150 ${
          tooltipAbove ? "bottom-full left-0 mb-3" : "right-full top-1/2 mr-3 -translate-y-1/2"
        } ${open ? "" : "group-hover:opacity-100 group-has-[:focus-visible]:opacity-100"}`}
      >
        Preguntas frecuentes
      </span>
    </li>
  )
}

function FaqRow({
  item,
  baseId,
  expanded,
  onToggle,
}: {
  item: FaqItem
  baseId: string
  expanded: boolean
  onToggle: () => void
}) {
  const buttonId = `${baseId}-${item.id}-q`
  const regionId = `${baseId}-${item.id}-a`
  return (
    <li
      className={`rounded-xl border transition-colors duration-200 ${
        expanded ? "border-brand/40 bg-brand/5" : "border-border/70 bg-background/40"
      }`}
    >
      <h4>
        <button
          id={buttonId}
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={regionId}
          className="press flex min-h-11 w-full items-start gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-medium leading-snug"
        >
          <span className="min-w-0 flex-1 text-pretty">{item.question}</span>
          <ChevronDown
            className={`mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ease-[var(--ease-out)] motion-reduce:transition-none ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>
      </h4>
      <div
        className={`grid transition-[grid-template-rows] duration-250 ease-[var(--ease-out)] motion-reduce:transition-none ${
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div id={regionId} role="region" aria-labelledby={buttonId} inert={!expanded} className="px-3.5 pb-3.5">
            <p className="text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
          </div>
        </div>
      </div>
    </li>
  )
}
