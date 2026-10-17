"use client"

import { useEffect, useMemo, useState } from "react"
import { CalendarDays, ChevronDown, MessageSquare, Phone, SearchX, Stethoscope } from "lucide-react"
import { usePatients } from "@/lib/hooks"
import { EmptyState, Initials, SearchBox, SkeletonList, Stat, Toolbar } from "./shared"

export function PatientsModule() {
  const { data, isLoading } = usePatients()
  const [query, setQuery] = useState("")
  const [openId, setOpenId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!data) return []
    const q = query.trim().toLowerCase()
    return q
      ? data.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.service.toLowerCase().includes(q) ||
            p.phone.replace(/\s/g, "").includes(q.replace(/\s/g, "")),
        )
      : data
  }, [data, query])

  // The patient's details open right where the patient is in the list (not in a
  // fixed spot at the top). Once the expand animation has finished, make sure the
  // whole row — header plus details — is on screen, so a patient near the bottom
  // of a long list never opens out of view. `scroll-mt-*` on the row keeps it
  // clear of the sticky search bar.
  useEffect(() => {
    if (!openId) return
    const t = setTimeout(() => {
      document.getElementById(`patient-${openId}`)?.scrollIntoView({
        block: "nearest",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      })
    }, 320)
    return () => clearTimeout(t)
  }, [openId])

  return (
    <div>
      <Toolbar>
        <SearchBox value={query} onChange={setQuery} placeholder="Buscar paciente, servicio o teléfono..." />
        {data && (
          <p className="text-xs text-muted-foreground">
            <span className="font-medium tabular-nums text-foreground">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "paciente" : "pacientes"}
          </p>
        )}
      </Toolbar>

      {isLoading && !data ? (
        <SkeletonList />
      ) : filtered.length === 0 ? (
        <EmptyState icon={SearchX}>No se encontró ningún paciente.</EmptyState>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((p) => {
            const open = openId === p.id
            return (
              <div
                key={p.id}
                id={`patient-${p.id}`}
                className={`scroll-mt-32 scroll-mb-4 rounded-xl border transition-colors ${
                  open
                    ? "border-accent/40 bg-accent/5"
                    : "border-border/70 bg-card/60 hover:border-border hover:bg-card"
                }`}
              >
                <button
                  onClick={() => setOpenId(open ? null : p.id)}
                  aria-expanded={open}
                  aria-controls={`patient-${p.id}-details`}
                  className="flex w-full items-center gap-3 rounded-xl p-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Initials name={p.name} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">{p.service}</p>
                  </div>
                  <div className="shrink-0 text-right text-[11px] text-muted-foreground">
                    <span className="tabular-nums">{p.appointments}</span> citas ·{" "}
                    <span className="tabular-nums">{p.conversations}</span> conv.
                  </div>
                  <ChevronDown
                    aria-hidden
                    className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 motion-reduce:transition-none ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Details expand in place (grid-rows 0fr -> 1fr animates height) */}
                <div
                  id={`patient-${p.id}-details`}
                  role="region"
                  aria-label={`Información de ${p.name}`}
                  className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  }`}
                >
                  <div className="overflow-hidden" inert={!open}>
                    <div className="px-3.5 pb-3.5">
                      <div className="grid grid-cols-2 gap-2.5">
                        <Stat icon={<CalendarDays className="h-3.5 w-3.5" />} label="Citas" value={p.appointments} />
                        <Stat
                          icon={<MessageSquare className="h-3.5 w-3.5" />}
                          label="Conversaciones"
                          value={p.conversations}
                        />
                        <Stat icon={<Stethoscope className="h-3.5 w-3.5" />} label="Servicio" value={p.service} />
                        <Stat icon={<Phone className="h-3.5 w-3.5" />} label="Teléfono" value={p.phone} />
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">
                        Última interacción: <span className="text-foreground">{p.lastInteraction}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
