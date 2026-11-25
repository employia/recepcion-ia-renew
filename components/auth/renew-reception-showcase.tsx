"use client"

import { CalendarDays, Heart, Sparkles, Star } from "lucide-react"

const APPOINTMENTS_2026 = [
  { label: "Agenda", date: "08/10/26", time: "7:30 AM", verified: true, highlight: false },
  { label: "Cita", date: "06/10/26", time: "11:30 AM", verified: false, highlight: true },
  { label: "Médica", date: "02/10/26", time: "4:45 PM", verified: false, highlight: false },
]

/**
 * Panel izquierdo del login en escritorio. Siempre usa colores claros
 * (la pieza gráfica es de marca y no cambia con el tema).
 * Las imágenes viven en /public/images; se pueden reemplazar por las originales
 * manteniendo el mismo nombre de archivo.
 */
export function RenewReceptionShowcase() {
  return (
    <section
      aria-label="Recepción Digital de Renew"
      className="relative flex h-full w-full flex-col justify-between gap-6 overflow-hidden bg-white p-10 text-[#0b132b] xl:p-14"
      style={{
        backgroundImage:
          "radial-gradient(circle at 80% 20%, rgba(232,93,4,0.10), transparent 45%), radial-gradient(circle at 20% 85%, rgba(30,41,82,0.10), transparent 50%)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/renew-logo.jpg"
        alt="Renew — Centro de Terapia Física & Rehabilitación"
        className="h-14 w-auto self-start object-contain xl:h-16"
      />

      <div className="grid grid-cols-1 items-center gap-8 xl:grid-cols-12">
        <h2 className="space-y-0 text-4xl font-bold leading-[1.05] tracking-[-0.03em] xl:col-span-5 xl:text-5xl">
          La Recepción <span className="block">Digital</span>
          <span className="block text-[#e85d04]">de Renew</span>
          <span className="block font-semibold tracking-[-0.02em]">en una sola pantalla.</span>
        </h2>

        <div className="relative mx-auto flex h-[430px] w-full max-w-[480px] items-center justify-center xl:col-span-7">
          <Sparkles aria-hidden className="absolute left-0 top-20 h-6 w-6 text-[#e85d04]/80" />
          <div
            aria-hidden
            className="absolute left-4 top-32 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-[#e85d04] text-white shadow-sm"
          >
            <Heart className="h-5 w-5 fill-current" />
          </div>

          {/* Recepción física */}
          <div className="absolute left-0 top-2 z-10 w-40 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg xl:w-44">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/renew-recepcion.jpg" alt="Recepción de Renew" className="h-40 w-full object-cover xl:h-44" />
          </div>

          {/* Equipo */}
          <div className="absolute right-0 top-0 z-0 w-52 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl xl:w-60">
            <div className="absolute inset-x-3 top-3 z-20 h-1 rounded-full bg-white/80" />
            <div className="absolute right-3 top-7 z-20 inline-flex items-center gap-1.5 rounded-lg bg-[#1e2952] px-2.5 py-1 text-xs font-semibold text-white shadow-md">
              <CalendarDays className="h-3.5 w-3.5 text-[#f48c06]" />
              <span>2017</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/renew-equipo.jpg" alt="Equipo de Renew" className="h-[340px] w-full object-cover object-[35%_center] xl:h-[360px]" />
          </div>

          {/* Agenda */}
          <div className="absolute bottom-2 left-2 z-20 w-56 rounded-2xl border border-slate-200 bg-white/95 p-3.5 shadow-2xl backdrop-blur-md xl:w-60">
            <div className="mb-2.5 flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#1d6fd8] text-white">
                <Star className="h-3.5 w-3.5 fill-current" />
              </span>
              <span className="text-xs font-extrabold tracking-wider text-[#1e2952]">RENEW</span>
              <span className="text-[11px] font-medium text-slate-500">2026</span>
            </div>
            <div className="space-y-1.5 text-xs">
              {APPOINTMENTS_2026.map((item) => (
                <div
                  key={`${item.label}-${item.time}`}
                  className={`flex items-center justify-between rounded-lg px-2 py-1.5 ${item.highlight ? "bg-slate-100" : ""}`}
                >
                  <div>
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-[11px] text-slate-500">{item.date}</div>
                  </div>
                  <div className="flex items-center gap-1 font-semibold tabular-nums">
                    <span>{item.time}</span>
                    {item.verified && (
                      <span
                        aria-label="Confirmado"
                        className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#1d6fd8] text-[10px] text-white"
                      >
                        ✓
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sello ISO */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/iso-9001-2015.png"
            alt="Certified ISO 9001-2015 Company"
            className="absolute bottom-0 right-2 z-30 h-24 w-24 drop-shadow-xl xl:h-28 xl:w-28"
          />
        </div>
      </div>
    </section>
  )
}
