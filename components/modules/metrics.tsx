"use client"

import { BarChart3 } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts"
import { useMetrics } from "@/lib/hooks"
import type { MetricPoint } from "@/lib/types"
import { EmptyState, SkeletonList } from "./shared"

// Recharts renders these as SVG presentation attributes, where CSS custom
// properties (var(--x)) do NOT resolve, so explicit theme colors are used.
const C = {
  accent: "oklch(0.6 0.07 215)",
  chart2: "oklch(0.62 0.09 150)",
  axis: "oklch(0.55 0.008 75)",
  grid: "oklch(0.89 0.006 85)",
}

const NO_DATA = "Sin datos"

function formatCount(n: number | null) {
  return n === null ? "—" : n.toLocaleString("es")
}

function formatSeconds(n: number | null) {
  return n === null ? "—" : `${n.toLocaleString("es")} s`
}

function formatPercent(n: number | null) {
  return n === null ? "—" : `${Math.round(n * 100)}%`
}

export function MetricsModule() {
  const { data, isLoading, error } = useMetrics()

  if (isLoading && data === undefined) return <SkeletonList rows={4} />

  if (error) {
    return (
      <EmptyState icon={BarChart3}>
        <p className="font-medium text-foreground">No se pudieron cargar las métricas</p>
        <p className="max-w-[28ch] text-balance">Vuelve a intentarlo en unos minutos.</p>
      </EmptyState>
    )
  }

  if (!data) {
    return (
      <EmptyState icon={BarChart3}>
        <p className="font-medium text-foreground">Aún no hay métricas conectadas</p>
        <p className="max-w-[30ch] text-balance">
          Cuando se conecte una fuente de datos, aquí verás la actividad del equipo.
        </p>
      </EmptyState>
    )
  }

  const { activity, attention, performance, queries, branches, trends } = data

  return (
    <div className="space-y-6">
      <Section title="Actividad">
        <div className="grid grid-cols-2 gap-2.5">
          <Kpi label="Interacciones" value={formatCount(activity.interactions)} />
          <Kpi label="Consultas" value={formatCount(activity.queries)} />
          <Kpi label="Conversaciones" value={formatCount(activity.conversations)} />
        </div>
        <ChartCard label="Interacciones por hora">
          {activity.hourly.length > 0 ? (
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={activity.hourly} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.accent} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: C.axis }}
                />
                <Tooltip content={<MiniTooltip suffix="" />} cursor={{ stroke: C.grid }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={C.accent}
                  strokeWidth={2}
                  fill="url(#activityFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <NoData />
          )}
        </ChartCard>
      </Section>

      <Section title="Atención">
        <div className="grid grid-cols-2 gap-2.5">
          <Kpi label="Tiempo prom. respuesta" value={formatSeconds(attention.avgResponseSeconds)} />
          <Kpi label="Tasa de resolución" value={formatPercent(attention.resolutionRate)} />
        </div>
      </Section>

      <Section title="Rendimiento">
        <div className="grid grid-cols-2 gap-2.5">
          <Kpi label="Atendidas" value={formatCount(performance.attended)} />
          <Kpi label="Escalaciones" value={formatCount(performance.escalations)} />
          <Kpi label="Errores" value={formatCount(performance.errors)} />
        </div>
      </Section>

      <Section title="Consultas">
        <RankedList label="Por categoría" points={queries.categories} />
        <RankedList label="Más frecuentes" points={queries.frequent} />
        <div className="grid grid-cols-2 gap-2.5">
          <Kpi label="Sin resolver" value={formatCount(queries.unresolved)} />
        </div>
      </Section>

      <Section title="Sucursales">
        <RankedList label="Actividad por sucursal" points={branches} />
      </Section>

      <Section title="Tendencias">
        <TrendChart label="Semanal" points={trends.weekly} />
        <TrendChart label="Mensual" points={trends.monthly} />
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </section>
  )
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/70 p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}

function ChartCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}

function NoData() {
  return <p className="py-6 text-center text-xs text-muted-foreground">{NO_DATA}</p>
}

function RankedList({ label, points }: { label: string; points: MetricPoint[] }) {
  const max = points.reduce((m, p) => Math.max(m, p.value), 0)
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-4">
      <p className="mb-3 text-xs font-medium text-muted-foreground">{label}</p>
      {points.length === 0 ? (
        <NoData />
      ) : (
        <ul className="space-y-2.5">
          {points.map((p) => (
            <li key={p.label}>
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="min-w-0 truncate">{p.label}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {p.value.toLocaleString("es")}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-accent/70"
                  style={{ width: `${max > 0 ? (p.value / max) * 100 : 0}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function TrendChart({ label, points }: { label: string; points: MetricPoint[] }) {
  return (
    <ChartCard label={label}>
      {points.length > 0 ? (
        <ResponsiveContainer width="100%" height={110}>
          <BarChart data={points} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: C.axis }}
            />
            <Tooltip content={<MiniTooltip suffix="" />} cursor={{ fill: "oklch(0.93 0.006 85)" }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} fill={C.chart2} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <NoData />
      )}
    </ChartCard>
  )
}

interface MiniTooltipProps {
  active?: boolean
  payload?: { value: number }[]
  label?: string
  suffix: string
}

function MiniTooltip({ active, payload, label, suffix }: MiniTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs shadow-soft">
      <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
      <div className="font-semibold tabular-nums">
        {payload[0].value}
        {suffix}
      </div>
    </div>
  )
}
