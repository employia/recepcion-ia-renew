import { Loader2 } from "lucide-react"

// Lives apart from office-view so the shell can show it without pulling three.js into the first bundle.
export function OfficeLoading() {
  return (
    <div role="status" className="office-surface absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin motion-reduce:animate-none" />
        <p className="text-sm">Entrando a la oficina</p>
      </div>
    </div>
  )
}
