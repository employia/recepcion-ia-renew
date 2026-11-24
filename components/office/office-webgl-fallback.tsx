"use client"

import { MonitorOff, RefreshCw } from "lucide-react"

// Shown instead of the 3D office when the browser cannot create a WebGL
// context (hardware acceleration off, GPU blocked, driver problems). The rest
// of the shell (team bar, dashboards, navigation) is plain DOM and keeps
// working, so the reception stays usable.
//
// Copy is deliberately plain: no technical terms, one obvious action first.
//
// Structure matters here: `.office-surface` forces light-theme colour tokens on
// everything inside it, so it only paints the background layer. The card is a
// sibling, outside that scope, so it follows the app theme (a dark card gets
// light text). Horizontal centring mirrors TeamBar (same insets + 12px), so the
// card lines up with the floating employee bar in every layout.
export function OfficeWebglFallback({ insetLeft, insetRight }: { insetLeft: number; insetRight: number }) {
  return (
    <div role="alert" className="absolute inset-0">
      <div aria-hidden className="office-surface absolute inset-0" />
      <div
        style={{ paddingLeft: insetLeft + 12, paddingRight: insetRight + 12 }}
        className="relative flex h-full items-center justify-center pb-28 pt-[calc(var(--topbar-h)+1rem)] transition-[padding] duration-300 ease-[var(--ease-out)] motion-reduce:transition-none"
      >
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center text-card-foreground shadow-float">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <MonitorOff className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2 className="text-balance text-lg font-semibold text-foreground">No pudimos mostrar la oficina</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tu navegador no logró cargarla. El resto de la recepción sigue funcionando.
          </p>
          <ol className="mx-auto mt-4 max-w-xs list-decimal space-y-1.5 pl-5 text-left text-sm text-foreground marker:text-muted-foreground">
            <li>Actualiza la página.</li>
            <li>Si sigue igual, cierra el navegador y ábrelo de nuevo.</li>
            <li>Si aún no se ve, prueba en otro navegador.</li>
          </ol>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="press mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Actualizar página
          </button>
        </div>
      </div>
    </div>
  )
}
