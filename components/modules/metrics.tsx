"use client"

import { BarChart3, ChartNoAxesColumn, CircleAlert, RefreshCw } from "lucide-react"
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
import { useTheme } from "@/lib/theme"
import type { MetricPoint } from "@/lib/types"
import { EmptyState, Skeleton } from "./shared"

// Recharts renders these as SVG presentation attributes, where CSS custom
// properties (var(--x)) do NOT resolve, so each theme has explicit colors that
// mirror the chart tokens in globals.css.
const PALETTE = {
  light: { accent: "#2e8b7d", chart2: "#7bb9ae", axis: "#66666c", grid: "#e3e3e8", cursor: "#efeff2" },
  dark: { accent: "#d97757", chart2: "#e8a78f", axis: "#b3aea3", grid: "#3f3d39", cursor: "#353330" },
}
type Palette = (typeof PALETTE)["light"]

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
  const { data, isLoading, error, mutate } = useMetrics()
  const C = PALETTE[useTheme().resolved]

  if (isLoading && data === undefined) return <MetricsSkeleton />

  if (error) {
    return (
      <EmptyState
        icon={CircleAlert}
        title="No se pudieron cargar las métricas"
        description="Vuelve a intentarlo en unos minutos."
        action={{ label: "Reintentar", icon: RefreshCw, onClick: () => void mutate() }}
      />
    )
  }

  if (!data) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Aún no hay métricas conectadas"
        description="Cuando se conecte una fuente de datos, aquí verás la actividad del equipo."
        action={{ label: "Actualizar", icon: RefreshCw, onClick: () => void mutate() }}
      />
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
        <TrendChart label="Semanal" points={trends.weekly} colors={C} />
        <TrendChart label="Mensual" points={trends.monthly} colors={C} />
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">
        {title}
      </h3>
      {children}
    </section>
  )
}

function Kpi({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif text-3xl font-medium tabular-nums tracking-tight">{value}</p>
    </div>
  )
}

function ChartCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}

/** Same height as a chart, so a chart without data does not collapse the card. */
function NoData() {
  return (
    <div className="flex h-[96px] flex-col items-center justify-center gap-1.5 text-xs text-muted-foreground">
      <ChartNoAxesColumn aria-hidden className="h-4 w-4 opacity-60" />
      {NO_DATA}
    </div>
  )
}

/** Mirrors the dashboard's sections (KPIs, chart cards, ranked lists) while data loads. */
function MetricsSkeleton() {
  return (
    <div aria-busy="true" className="space-y-6">
      <p role="status" className="sr-only">
        Cargando métricas…
      </p>
      {[0, 1].map((section) => (
        <div key={section} aria-hidden className="space-y-3">
          <Skeleton className="h-3.5 w-24" />
          <div className="grid grid-cols-2 gap-2.5">
            {[0, 1, 2, 3].slice(0, section === 0 ? 3 : 2).map((i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-card p-3">
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="mt-2.5 h-7 w-14" />
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-4">
            <Skeleton className="mb-3 h-2.5 w-28" />
            <Skeleton className="h-[110px] w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

function RankedList({ label, points }: { label: string; points: MetricPoint[] }) {
  const max = points.reduce((m, p) => Math.max(m, p.value), 0)
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
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
                  className="h-full rounded-full bg-brand/70"
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

function TrendChart({ label, points, colors: C }: { label: string; points: MetricPoint[]; colors: Palette }) {
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
            <Tooltip content={<MiniTooltip suffix="" />} cursor={{ fill: C.cursor }} />
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
