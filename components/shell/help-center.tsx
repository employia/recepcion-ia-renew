"use client"

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
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

/**
 * Help lives beside the office team dock, not in the global navigation. The
 * shell only mounts it while the office itself is active.
 */
export function HelpCenter({
  insetLeft = 0,
  insetRight = 0,
}: {
  insetLeft?: number
  insetRight?: number
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const fabRef = useRef<HTMLButtonElement>(null)
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

  const close = useCallback(() => {
    setOpen(false)
    fabRef.current?.focus({ preventScroll: true })
  }, [])

  function toggle() {
    if (open) return close()
    setQuery("")
    setExpandedId(null)
    setOpen(true)
  }

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

  return (
    <>
      <div
        className="group pointer-events-auto fixed bottom-[calc(max(1rem,env(safe-area-inset-bottom,0px))+8px)] left-3 z-[32] transition-[left,opacity] duration-300 ease-[var(--ease-out)] motion-reduce:transition-none md:absolute md:bottom-auto md:left-auto md:right-full md:top-1/2 md:mr-2 md:-translate-y-1/2"
        style={{ ["--help-center" as string]: `calc((100vw + ${insetLeft}px - ${insetRight}px) / 2)` }}
      >
        <button
          ref={fabRef}
          onClick={toggle}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label="Preguntas frecuentes"
          className={`press glass flex h-11 w-11 items-center justify-center rounded-full border shadow-soft hover:scale-105 ${
            open ? "border-brand/60 text-brand" : "border-border/60 text-muted-foreground hover:text-foreground"
          }`}
        >
          <CircleHelp className="h-5 w-5" />
        </button>
        <span
          aria-hidden
          className={`pointer-events-none absolute right-0 top-full mt-2 hidden whitespace-nowrap rounded-xl border border-border bg-popover px-3 py-1.5 text-sm font-semibold opacity-0 shadow-float transition-opacity duration-150 md:block ${
            open ? "" : "group-hover:opacity-100 group-has-[:focus-visible]:opacity-100"
          }`}
        >
          Preguntas frecuentes
        </span>
      </div>

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
        className={`fixed inset-x-3 bottom-[calc(max(1rem,env(safe-area-inset-bottom,0px))+4.25rem)] z-[42] flex max-h-[calc(100dvh-7rem-env(safe-area-inset-bottom,0px))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-float transition-[transform,opacity,visibility] duration-300 ease-[var(--ease-out)] motion-reduce:transition-opacity md:inset-x-auto md:bottom-24 md:left-[var(--help-center)] md:w-[min(26rem,calc(100vw-100px))] md:-translate-x-1/2 ${
          open
            ? "pointer-events-auto visible translate-y-0 opacity-100"
            : "pointer-events-none invisible translate-y-3 opacity-0 motion-reduce:translate-y-0"
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
    </>
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
