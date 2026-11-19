"use client"

import { MonitorOff, RefreshCw } from "lucide-react"

// Shown instead of the 3D office when the browser cannot create a WebGL
// context (hardware acceleration off, GPU blocked by the browser, driver
// problems). The rest of the shell (team bar, dashboards, navigation) is plain
// DOM and keeps working, so the reception stays usable.
export function OfficeWebglFallback() {
  return (
    <div role="alert" className="office-surface absolute inset-0 flex items-center justify-center p-6">
      <div className="max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-float">
        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <MonitorOff className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 className="text-base font-semibold text-foreground">No se pudo cargar la oficina 3D</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Tu navegador no pudo activar los gráficos (WebGL) que necesita la escena. El resto de la recepción sigue
          funcionando con normalidad.
        </p>
        <ol className="mt-4 space-y-1.5 text-left text-sm text-muted-foreground">
          <li>1. Cierra todas las ventanas del navegador y vuelve a abrirlo.</li>
          <li>
            2. Activa «Usar aceleración por hardware» en Configuración → Sistema y reinicia el navegador.
          </li>
          <li>3. Si persiste, actualiza el controlador de video o prueba en otro navegador.</li>
        </ol>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Reintentar
        </button>
      </div>
    </div>
  )
}
