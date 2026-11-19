import type { Employee, EmployeeStatus } from "@/lib/types"

export const STATUS_LABEL: Record<EmployeeStatus, string> = {
  working: "Trabajando",
  resting: "En pausa",
  attention: "Requiere atención",
}

// Green = working, neutral = paused, amber = a person must step in. Independent of the theme accent.
const STATUS_BG: Record<EmployeeStatus, string> = {
  working: "bg-success",
  resting: "bg-muted-foreground/60",
  attention: "bg-warning",
}

/** Small colored dot for an employee's presence. */
export function StatusDot({ status, className = "h-1.5 w-1.5" }: { status: EmployeeStatus; className?: string }) {
  return <span aria-hidden className={`inline-block shrink-0 rounded-full ${STATUS_BG[status]} ${className}`} />
}

/** Round close-up of an employee's face, cropped from their portrait, with an optional presence badge. */
export function Thumb({
  employee,
  size,
  badge = false,
}: {
  employee: Employee
  size: number
  badge?: boolean
}) {
  const zoom = 3.6 // portrait is shown 3.6x wider than the circle
  const imgW = size * zoom
  const imgH = imgW * 1.05
  const [fx, fy] = employee.portraitFace
  const pos = (f: number, img: number) => `${Math.min(Math.max((f * img - size / 2) / (img - size), 0), 1) * 100}%`
  return (
    <span className="relative shrink-0" style={{ width: size, height: size }}>
      <span
        aria-hidden
        className="block rounded-full border border-border bg-secondary"
        style={{
          width: size,
          height: size,
          backgroundImage: `url(${employee.portrait})`,
          backgroundSize: `${zoom * 100}%`,
          backgroundPosition: `${pos(fx, imgW)} ${pos(fy, imgH)}`,
          backgroundRepeat: "no-repeat",
        }}
      />
      {badge && (
        <StatusDot
          status={employee.status}
          className="absolute -bottom-0.5 -right-0.5 h-3 w-3 ring-2 ring-card"
        />
      )}
    </span>
  )
}
