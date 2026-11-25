"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { CalendarDays, Heart, Star, Store } from "lucide-react"

/**
 * Panel de marca del login (solo escritorio).
 *
 * La composición está dibujada
 * sobre un lienzo de 1200 × 896 y todo se mide en `cqw`, así que escala completo
 * con el ancho de su contenedor sin cambiar las proporciones. Siempre usa colores
 * claros porque es una pieza de marca (no cambia con el tema).
 *
 * Imágenes en /public/images (ya optimizadas en WebP; `images.unoptimized` está activo,
 * así que si se reemplazan hay que subirlas con peso y tamaño razonables).
 */

const CANVAS_W = 1200
const CANVAS_H = 896

/** Píxeles del lienzo de diseño → unidades de contenedor. */
const u = (n: number) => `${(n / CANVAS_W) * 100}cqw`

const box = (x: number, y: number, w?: number, h?: number) => ({
  position: "absolute" as const,
  left: u(x),
  top: u(y),
  ...(w !== undefined && { width: u(w) }),
  ...(h !== undefined && { height: u(h) }),
})

/**
 * MODO EDICIÓN (`?editar=1` en la URL).
 * Hay 3 piezas movibles, cada una es un solo bloque:
 *  - titular:  la frase "La Recepción Digital de Renew en una sola pantalla" + el ícono de WhatsApp
 *  - logo:     el logo de Renew (esquina superior izquierda)
 *  - conjunto: fotos del equipo, espacio Renew, sello ISO, tarjeta de agenda, insignia y corazón naranja
 * Se arrastran con el mouse, se agrandan/achican y se copian sus posiciones y tamaños.
 * Medidas en píxeles del lienzo de 1200 × 896. El titular se ancla abajo: su `y` es la distancia al borde inferior.
 */
type PieceId = "titular" | "logo" | "conjunto"
type Offset = { dx: number; dy: number; s: number }

const BASE: Record<PieceId, { label: string; x: number; y: number; w?: number; h?: number; z: number; s: number }> = {
  titular: { label: "Frase + WhatsApp", x: -18, y: 81, z: 3, s: 1.21 },
  logo: { label: "Logo Renew", x: 9, y: -40, w: 290, z: 2, s: 1.19 },
  conjunto: { label: "Conjunto de fotos", x: 506, y: 46, w: 629, h: 697, z: 1, s: 1.1 },
}
const PIECE_IDS = Object.keys(BASE) as PieceId[]
const clampScale = (n: number) => Math.min(3, Math.max(0.2, Math.round(n * 100) / 100))

const NAVY = "#1d2a5e"
const ORANGE = "#ee6a24"
const BLUE = "#1d6fd8"
const CARD_SHADOW = "0 24px 48px -16px rgba(20,30,70,0.30), 0 3px 8px rgba(20,30,70,0.10)"

const APPOINTMENTS = [
  { label: "Agenda", date: "08/10/26", time: "7:30 AM", confirmed: true, highlight: false },
  { label: "Cita", date: "06/10/26", time: "11:30 AM", confirmed: false, highlight: true },
  { label: "Médica", date: "02/10/26", time: "4:45 PM", confirmed: false, highlight: false },
] as const

function HeartBubble({ cx, cy, d }: { cx: number; cy: number; d: number }) {
  return (
    <div
      aria-hidden
      className="flex items-center justify-center rounded-full text-white"
      style={{
        ...box(cx - d / 2, cy - d / 2, d, d),
        background: ORANGE,
        boxShadow: "0 8px 18px -6px rgba(238,106,36,0.55)",
        zIndex: 8,
      }}
    >
      <Heart fill="currentColor" strokeWidth={0} style={{ width: u(d * 0.52), height: u(d * 0.52) }} />
    </div>
  )
}

export function RenewReceptionShowcase() {
  const [editing, setEditing] = useState(false)
  const [off, setOff] = useState<Partial<Record<PieceId, Offset>>>({})
  const [sel, setSel] = useState<PieceId | null>(null)
  const [copied, setCopied] = useState(false)
  const [z, setZ] = useState<Partial<Record<PieceId, number>>>({})
  const zTop = useRef(10)
  const zBottom = useRef(-1)
  const drag = useRef<{ id: PieceId; sx: number; sy: number; dx: number; dy: number; scale: number } | null>(null)

  useEffect(() => {
    setEditing(new URLSearchParams(window.location.search).get("editar") === "1")
  }, [])

  const get = (id: PieceId): Offset => off[id] ?? { dx: 0, dy: 0, s: BASE[id].s }
  const front = (id: PieceId) => setZ((p) => ({ ...p, [id]: ++zTop.current }))
  const back = (id: PieceId) => setZ((p) => ({ ...p, [id]: --zBottom.current }))
  const patch = (id: PieceId, f: (o: Offset) => Offset) => setOff((p) => ({ ...p, [id]: f(p[id] ?? { dx: 0, dy: 0, s: BASE[id].s }) }))

  // Flechas: mover 1 px (Mayús = 10). + / −: tamaño 2% (Mayús = 10%).
  useEffect(() => {
    if (!editing || !sel) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.tagName === "INPUT") return
      const k = e.key.toLowerCase()
      const step = e.shiftKey ? 10 : 1
      const d: Record<string, [number, number]> = {
        arrowleft: [-step, 0],
        arrowright: [step, 0],
        arrowup: [0, -step],
        arrowdown: [0, step],
      }
      const ds = k === "+" || k === "=" ? (e.shiftKey ? 0.1 : 0.02) : k === "-" || k === "_" ? (e.shiftKey ? -0.1 : -0.02) : 0
      const m = d[k] ?? (ds ? ([0, 0] as [number, number]) : undefined)
      if (!m) return
      e.preventDefault()
      patch(sel, (o) => ({ dx: o.dx + m[0], dy: o.dy + m[1], s: clampScale(o.s + ds) }))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [editing, sel])

  /** Estilo de posición de una pieza: base + desplazamiento + tamaño (+ guías en modo edición). */
  const at = (id: PieceId) => {
    const b = BASE[id]
    const o = get(id)
    const pos =
      id === "titular"
        ? { left: u(b.x + o.dx), bottom: u(b.y - o.dy) }
        : {
            left: u(b.x + o.dx),
            top: u(b.y + o.dy),
            ...(b.w !== undefined && { width: u(b.w) }),
            ...(b.h !== undefined && { height: u(b.h) }),
          }
    return {
      position: "absolute" as const,
      ...pos,
      zIndex: z[id] ?? b.z,
      transformOrigin: id === "titular" ? "bottom left" : "top left",
      ...(o.s !== 1 && { transform: `scale(${o.s})` }),
      ...(editing && {
        cursor: "grab",
        touchAction: "none" as const,
        outline: sel === id ? "2px solid #ee6320" : "1px dashed rgba(238,99,32,0.6)",
        outlineOffset: "2px",
      }),
    }
  }

  const dragHandlers = {
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      const el = (e.target as HTMLElement).closest("[data-piece]")
      if (!el) return
      const id = el.getAttribute("data-piece") as PieceId
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      const o = get(id)
      drag.current = {
        id,
        sx: e.clientX,
        sy: e.clientY,
        dx: o.dx,
        dy: o.dy,
        scale: e.currentTarget.getBoundingClientRect().width / CANVAS_W,
      }
      setSel(id)
      front(id)
    },
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      const d = drag.current
      if (!d) return
      patch(d.id, (o) => ({
        ...o,
        dx: Math.round(d.dx + (e.clientX - d.sx) / d.scale),
        dy: Math.round(d.dy + (e.clientY - d.sy) / d.scale),
      }))
    },
    onPointerUp: () => {
      drag.current = null
    },
    onPointerCancel: () => {
      drag.current = null
    },
  }

  const describe = (id: PieceId) => {
    const b = BASE[id]
    const o = get(id)
    const x = b.x + o.dx
    const y = b.y + o.dy
    if (id === "titular") return `${id}: x=${x}, distancia al borde inferior=${b.y - o.dy}, escala=${o.s}`
    const w = Math.round((b.w ?? 0) * o.s)
    const h = b.h !== undefined ? ` × alto=${Math.round(b.h * o.s)}` : ""
    return `${id}: x=${x}, y=${y}, escala=${o.s}, tamaño final: ancho=${w}${h}`
  }

  const summary =
    PIECE_IDS.map(describe).join("\n") +
    "\norden (de atrás a frente): " +
    [...PIECE_IDS].sort((a, c) => (z[a] ?? BASE[a].z) - (z[c] ?? BASE[c].z)).join(" < ")

  const copy = async () => {
    const text = `${summary}\nlienzo: ${CANVAS_W}×${CANVAS_H} · pantalla: ${window.innerWidth}×${window.innerHeight}`
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      window.prompt("Copie las posiciones:", text)
    }
  }

  const btn = "rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-800 hover:bg-slate-100"

  return (
    <>
      <section
        aria-label="La Recepción Digital de Renew en una sola pantalla"
        className="w-full select-none"
        {...(editing ? dragHandlers : {})}
        style={{ containerType: "inline-size", aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
      >
        <div className="relative h-full w-full font-sans" style={{ color: NAVY }}>
          {/* Logotipo (completo, con lema) */}
          <Image
            src="/images/renew-logo-full.webp"
            alt="Renew — Centro de Terapia Física & Rehabilitación. Fortaleciendo & Restaurando su Salud"
            width={640}
            height={426}
            data-piece="logo"
            draggable={false}
            style={{ ...at("logo"), height: "auto" }}
          />

          {/* CONJUNTO: fotos, sello ISO, agenda, insignia y corazón (coordenadas relativas al conjunto: origen = 497, 98) */}
          <div data-piece="conjunto" style={at("conjunto")}>
            <HeartBubble cx={583} cy={450} d={92} />

            {/* Foto de la recepción (espacio Renew) */}
            <div
              className="overflow-hidden"
              style={{ ...box(0, 130, 252, 280), borderRadius: u(24), boxShadow: CARD_SHADOW, zIndex: 1 }}
            >
              <Image
                src="/images/renew-recepcion.webp"
                alt="Recepción de Renew"
                fill
                sizes="25vw"
                className="object-cover"
                draggable={false}
                style={{ objectPosition: "50% 38%" }}
              />
              <div
                aria-hidden
                className="absolute flex items-center justify-center"
                style={{
                  ...box(16, 17, 33, 33),
                  borderRadius: u(9),
                  background: "rgba(255,255,255,0.88)",
                  color: "#6b7186",
                }}
              >
                <Store strokeWidth={2} style={{ width: u(19), height: u(19) }} />
              </div>
            </div>

            {/* Foto del equipo */}
            <div
              className="overflow-hidden"
              style={{ ...box(238, 0, 325, 500), borderRadius: u(26), boxShadow: CARD_SHADOW, zIndex: 2, background: "#777" }}
            >
              <Image
                src="/images/renew-equipo.webp"
                alt="Equipo de recepción de Renew"
                fill
                sizes="30vw"
                className="object-cover"
                draggable={false}
                style={{ objectPosition: "50% 50%" }}
              />
              {/* barra de progreso tipo historia */}
              <div aria-hidden className="absolute" style={{ ...box(23, 22, 279, 5), borderRadius: u(3), background: "rgba(255,255,255,0.45)" }}>
                <div className="h-full" style={{ width: "45%", borderRadius: u(3), background: "#fff" }} />
              </div>
            </div>

            {/* Insignia 2017 */}
            <div
              aria-hidden
              className="flex items-center"
              style={{
                ...box(484, 65, 110, 44),
                borderRadius: u(12),
                background: "#2b3566",
                color: "#d5dcf3",
                gap: u(9),
                paddingLeft: u(14),
                zIndex: 6,
                boxShadow: "0 8px 16px -6px rgba(20,30,70,0.4)",
                fontSize: u(22),
                fontWeight: 500,
                lineHeight: 1,
              }}
            >
              <CalendarDays strokeWidth={2} style={{ width: u(24), height: u(24), color: "#f58a3b" }} />
              <span className="tabular-nums">2017</span>
            </div>

            {/* Tarjeta de agenda */}
            <div
              aria-hidden
              style={{ ...box(66, 352, 239, 345), borderRadius: u(30), background: "#fff", boxShadow: CARD_SHADOW, zIndex: 4 }}
            >
              <div
                className="flex items-center justify-center text-white"
                style={{ ...box(17, 16, 33, 31), borderRadius: u(9), background: BLUE }}
              >
                <Star fill="currentColor" strokeWidth={0} style={{ width: u(18), height: u(18) }} />
              </div>

              <div
                className="overflow-hidden"
                style={{ ...box(14, 56, 211, 236), borderRadius: u(12), border: `${u(1.5)} solid #dde0e7`, background: "#fff" }}
              >
                <Image
                  src="/brand/renew-symbol.svg"
                  alt=""
                  width={99}
                  height={193}
                  draggable={false}
                  style={{ ...box(93, 8, 25), height: "auto" }}
                />
                <div style={{ ...box(8, 64, 195, 168), lineHeight: 1 }}>
                  {APPOINTMENTS.map((a, i) => (
                    <div key={a.label} style={{ position: "relative", height: u(56), borderTop: i ? `${u(1.5)} solid #e4e6ec` : undefined }}>
                      <div style={{ ...box(6, 5), fontSize: u(19), fontWeight: 700, color: "#1b2340" }}>{a.label}</div>
                      {a.confirmed && (
                        <div
                          className="flex items-center justify-center text-white"
                          style={{ ...box(167, 5, 19, 19), borderRadius: "50%", background: BLUE, fontSize: u(12) }}
                        >
                          ✓
                        </div>
                      )}
                      <div
                        className="flex items-center justify-between"
                        style={{
                          ...box(0, 29, 195, 25),
                          borderRadius: u(7),
                          paddingInline: u(6),
                          background: a.highlight ? "#e9ebf0" : undefined,
                          fontSize: u(16.5),
                        }}
                      >
                        <span style={{ color: "#555d73" }}>{a.date}</span>
                        <span className="tabular-nums" style={{ fontWeight: 600, color: "#1b2340" }}>{a.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...box(17, 305, 180, 14), borderRadius: u(7), background: "#e6e8ed" }} />
              <div style={{ ...box(17, 326, 138, 12), borderRadius: u(6), background: "#e6e8ed" }} />
            </div>

            {/* Sello ISO */}
            <Image
              src="/images/renew-iso.webp"
              alt="Empresa certificada ISO 9001-2015"
              width={420}
              height={420}
              draggable={false}
              style={{ ...box(291, 437, 194, 194), zIndex: 5, filter: "drop-shadow(0 14px 18px rgba(20,40,90,0.30))" }}
            />
          </div>

          {/* TITULAR + WhatsApp (un solo bloque). Su tamaño sigue al de la pantalla (no al del lienzo).
              Anclado abajo a la izquierda. */}
          <div
            data-piece="titular"
            style={{
              ...at("titular"),
              fontSize: "min(3.3vw, 5.8cqw)",
              lineHeight: 1.02,
              letterSpacing: "-0.025em",
              whiteSpace: "nowrap",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "1em", fontWeight: 700, lineHeight: "inherit" }}>
              La Recepción
              <br />
              Digital
              <svg
                aria-hidden
                viewBox="0 0 70 70"
                style={{
                  display: "inline-block",
                  width: "0.92em",
                  height: "0.92em",
                  marginLeft: "0.3em",
                  marginBlock: "-0.2em",
                  verticalAlign: "-0.1em",
                  filter: "drop-shadow(0 8px 14px rgba(37,196,63,0.30))",
                }}
              >
                <defs>
                  <linearGradient id="wa-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#5fe77b" />
                    <stop offset="1" stopColor="#22bd44" />
                  </linearGradient>
                </defs>
                <rect width="70" height="70" rx="17" fill="url(#wa-grad)" />
                <path d="M26.1 54.0A21 21 0 1 0 15.3 42.2L13 57Z" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinejoin="round" />
                <path
                  transform="translate(23 23)"
                  fill="#fff"
                  d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                />
              </svg>
              <br />
              <span style={{ color: "#ee6320" }}>de Renew</span>
            </h2>
            <p style={{ margin: "0.18em 0 0", fontSize: "0.71em", fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1.1 }}>
              en una sola pantalla.
            </p>
          </div>
        </div>
      </section>

      {editing && (
        <div className="fixed bottom-4 right-4 z-[100] w-80 rounded-xl border border-slate-200 bg-white p-3 font-sans text-xs text-slate-800 shadow-2xl">
          <div className="mb-1 text-sm font-semibold">Modo edición</div>
          <p className="mb-2 text-slate-500">
            Arrastre una pieza para moverla; al hacer clic pasa al frente. Flechas: 1 px (Mayús = 10). + / −: tamaño 2% (Mayús = 10%).
          </p>
          <div className="mb-2 rounded-md bg-slate-50 p-2">
            {sel ? (
              <>
                <div className="font-medium">{BASE[sel].label}</div>
                <div className="tabular-nums text-slate-600">{describe(sel)}</div>
                <div className="mt-2 flex items-center gap-1">
                  <button className={btn} onClick={() => patch(sel, (o) => ({ ...o, s: clampScale(o.s - 0.05) }))}>Achicar</button>
                  <input
                    type="range"
                    min={0.2}
                    max={3}
                    step={0.01}
                    value={get(sel).s}
                    onChange={(e) => patch(sel, (o) => ({ ...o, s: clampScale(Number(e.target.value)) }))}
                    className="min-w-0 flex-1"
                    aria-label="Tamaño de la pieza"
                  />
                  <button className={btn} onClick={() => patch(sel, (o) => ({ ...o, s: clampScale(o.s + 0.05) }))}>Agrandar</button>
                </div>
                <div className="mt-2 flex gap-1">
                  <button className={btn} onClick={() => front(sel)}>Traer al frente</button>
                  <button className={btn} onClick={() => back(sel)}>Enviar al fondo</button>
                  <button className={btn} onClick={() => patch(sel, () => ({ dx: 0, dy: 0, s: BASE[sel].s }))}>Reiniciar pieza</button>
                </div>
              </>
            ) : (
              <span className="text-slate-500">Seleccione una pieza haciendo clic en ella.</span>
            )}
          </div>
          <pre className="mb-2 whitespace-pre-wrap rounded-md bg-slate-50 p-2 text-[11px] leading-snug text-slate-600">{summary}</pre>
          <div className="flex gap-1">
            <button className={`${btn} flex-1 !bg-slate-900 !text-white hover:!bg-slate-700`} onClick={copy}>
              {copied ? "¡Copiado!" : "Copiar posiciones"}
            </button>
            <button
              className={btn}
              onClick={() => {
                setOff({})
                setZ({})
              }}
            >
              Reiniciar todo
            </button>
          </div>
        </div>
      )}
    </>
  )
}
