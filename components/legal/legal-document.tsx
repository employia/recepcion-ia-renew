import type { ReactNode } from "react"
import { LEGAL_UPDATED } from "@/lib/legal"
import { BackLink } from "./back-link"

export interface LegalSection {
  title: string
  body: ReactNode
}

/** Readable, public page for a legal document. */
export function LegalDocument({ title, intro, sections }: { title: string; intro: string; sections: LegalSection[] }) {
  return (
    <main className="min-h-screen w-full bg-background px-6 py-10">
      <article className="mx-auto w-full max-w-[720px]">
        <BackLink />

        <header className="mt-6 flex items-center gap-4 border-b border-border/70 pb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/renew-symbol.svg" alt="Renew" className="h-12 w-auto shrink-0" />
          <div className="min-w-0">
            <h1 className="text-balance text-2xl font-medium tracking-tight">{title}</h1>
            <p className="mt-1 text-xs text-muted-foreground">Última actualización: {LEGAL_UPDATED}</p>
          </div>
        </header>

        <p className="mt-6 text-sm leading-relaxed text-foreground/90">{intro}</p>

        <div className="mt-8 space-y-7">
          {sections.map((s, i) => (
            <section key={s.title}>
              <h2 className="text-base font-semibold tracking-tight">
                {i + 1}. {s.title}
              </h2>
              <div className="mt-2 space-y-2 text-sm leading-relaxed text-foreground/90">{s.body}</div>
            </section>
          ))}
        </div>
      </article>
    </main>
  )
}
