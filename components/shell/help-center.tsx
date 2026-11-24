"use client"

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import { ChevronDown, CircleHelp, SearchX, X } from "lucide-react"
import { useApp } from "@/lib/store"
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
 * FAQs live in the top bar and are always reachable. Opening them closes any
 * module or employee window, and opening one of those closes the FAQs, so two
 * floating windows are never open at once.
 */
export function HelpCenter() {
  const { activeModule, activeEmployee, closeModule } = useApp()
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
    if (activeModule !== null || activeEmployee !== null) closeModule()
    setQuery("")
    setExpandedId(null)
    setOpen(true)
  }

  // A module or an employee window opened: the FAQs yield.
  useEffect(() => {
    if (activeModule !== null || activeEmployee !== null) setOpen(false)
  }, [activeModule, activeEmployee])

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
      <button
        ref={fabRef}
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Preguntas frecuentes"
        title="Consultar preguntas frecuentes"
        className={`press flex h-10 w-10 items-center justify-center rounded-full hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          open ? "bg-secondary text-brand-ink" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <CircleHelp className="h-5 w-5" aria-hidden />
      </button>

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
        className={`fixed right-3 top-[calc(var(--topbar-h)+0.5rem)] z-[42] flex max-h-[calc(100dvh-var(--topbar-h)-1.25rem)] w-[min(26rem,calc(100vw-1.5rem))] origin-top-right flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-float transition-[transform,opacity,visibility] duration-300 ease-[var(--ease-out)] motion-reduce:transition-opacity ${
          open
            ? "pointer-events-auto visible translate-y-0 scale-100 opacity-100"
            : "pointer-events-none invisible -translate-y-2 scale-[0.98] opacity-0 motion-reduce:translate-y-0 motion-reduce:scale-100"
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
