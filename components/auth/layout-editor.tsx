"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react"
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode, RefObject } from "react"

/**
 * MODO EDICIÓN del login (`?editar=1` en la URL).
 * Hay 4 piezas movibles, cada una es un solo bloque:
 *  - titular:  la frase "La Recepción Digital de Renew en una sola pantalla" + el ícono de WhatsApp
 *  - logo:     el logo de Renew (esquina superior izquierda)
 *  - conjunto: fotos del equipo, espacio Renew, sello ISO, tarjeta de agenda, insignia y corazón naranja
 *  - caras:      las caras de los empleados
 *  - frase:      "tu equipo ya está trabajando"
 *  - formulario: el formulario flotante de login
 *  - linea:      la línea gris que divide el login del diseño
 * Se arrastran con el mouse, se agrandan/achican y se copian sus posiciones y tamaños.
 * Medidas en píxeles del lienzo de 1200 × 896 (el mismo del diseño de la izquierda).
 * - titular: se ancla abajo, su `y` es la distancia al borde inferior.
 * - caras / frase / formulario / línea: su lugar lo decide el layout; se reporta el desplazamiento
 *   (en píxeles de pantalla del lienzo) respecto a ese lugar original. La línea cambia de largo, no de grosor.
 */
export const CANVAS_W = 1200
export const CANVAS_H = 896

export type PieceId = "titular" | "logo" | "conjunto" | "caras" | "frase" | "formulario" | "linea"
type Offset = { dx: number; dy: number; s: number }

export const BASE: Record<PieceId, { label: string; x: number; y: number; w?: number; h?: number; z: number; s: number }> = {
  titular: { label: "Frase + WhatsApp", x: -18, y: 81, z: 3, s: 1.21 },
  logo: { label: "Logo Renew", x: 9, y: -40, w: 290, z: 2, s: 1.19 },
  conjunto: { label: "Conjunto de fotos", x: 506, y: 46, w: 629, h: 697, z: 1, s: 1.1 },
  caras: { label: "Caras del equipo", x: 0, y: 0, z: 4, s: 1 },
  frase: { label: "Frase «tu equipo ya está trabajando»", x: 0, y: 0, z: 4, s: 1 },
  formulario: { label: "Formulario de login", x: 0, y: 0, z: 5, s: 1 },
  linea: { label: "Línea gris divisoria", x: 0, y: 0, z: 0, s: 1 },
}
const PIECE_IDS = Object.keys(BASE) as PieceId[]
const clampScale = (n: number) => Math.min(3, Math.max(0.2, Math.round(n * 100) / 100))
const initial = (id: PieceId): Offset => ({ dx: 0, dy: 0, s: BASE[id].s })

/** Píxeles del lienzo → unidades de contenedor (dentro del diseño de la izquierda). */
const u = (n: number) => `${(n / CANVAS_W) * 100}cqw`
/** Píxeles del lienzo → largo basado en el ancho del diseño (fuera de él, p. ej. el login). */
const art = (n: number) => `calc(var(--art-w) * ${n / CANVAS_W})`
/** Igual, pero dentro del bloque de login, que se agranda solo con la ventana (--login-k): se compensa para que el arrastre siga al mouse. */
const artK = (n: number) => `calc(var(--art-w) * ${n / CANVAS_W} / var(--login-k, 1))`

function styleFor(id: PieceId, o: Offset, z: number | undefined, editing: boolean, selected: boolean): CSSProperties {
  const b = BASE[id]
  let pos: CSSProperties
  let transform: string | undefined
  let origin = "top left"

  if (id === "titular") {
    pos = { position: "absolute", left: u(b.x + o.dx), bottom: u(b.y - o.dy) }
    origin = "bottom left"
    if (o.s !== 1) transform = `scale(${o.s})`
  } else if (id === "linea") {
    // La posición (absolute, borde izquierdo de la columna) la da el layout; aquí solo se desplaza y cambia de largo.
    pos = {}
    origin = "center"
    if (o.dx || o.dy || o.s !== 1) transform = `translate(${art(o.dx)}, ${art(o.dy)}) scaleY(${o.s})`
  } else if (id === "caras" || id === "frase" || id === "formulario") {
    pos = { position: "relative" }
    origin = "center"
    if (o.dx || o.dy || o.s !== 1) transform = `translate(${artK(o.dx)}, ${artK(o.dy)}) scale(${o.s})`
  } else {
    pos = {
      position: "absolute",
      left: u(b.x + o.dx),
      top: u(b.y + o.dy),
      ...(b.w !== undefined && { width: u(b.w) }),
      ...(b.h !== undefined && { height: u(b.h) }),
    }
    if (o.s !== 1) transform = `scale(${o.s})`
  }

  return {
    ...pos,
    zIndex: z ?? b.z,
    transformOrigin: origin,
    ...(transform && { transform }),
    ...(editing && {
      cursor: "grab",
      touchAction: "none",
      outline: selected ? "2px solid #ee6320" : "1px dashed rgba(238,99,32,0.6)",
      outlineOffset: "2px",
    }),
  }
}

type Ctx = {
  editing: boolean
  at: (id: PieceId) => CSSProperties
  /** Se asigna al diseño de la izquierda: de su ancho sale la escala de arrastre. */
  artRef: RefObject<HTMLElement | null>
  /** Se esparcen en el contenedor que abarca todas las piezas (el <main> del login). */
  dragHandlers: {
    onPointerDown?: (e: ReactPointerEvent<HTMLElement>) => void
    onPointerMove?: (e: ReactPointerEvent<HTMLElement>) => void
    onPointerUp?: () => void
    onPointerCancel?: () => void
  }
}

const noRef: RefObject<HTMLElement | null> = { current: null }
const StaticCtx: Ctx = {
  editing: false,
  at: (id) => styleFor(id, initial(id), undefined, false, false),
  artRef: noRef,
  dragHandlers: {},
}
const EditorCtx = createContext<Ctx>(StaticCtx)
export const useLayoutEditor = () => useContext(EditorCtx)

export function LayoutEditorProvider({ children }: { children: ReactNode }) {
  const [editing, setEditing] = useState(false)
  const [off, setOff] = useState<Partial<Record<PieceId, Offset>>>({})
  const [sel, setSel] = useState<PieceId | null>(null)
  const [copied, setCopied] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [z, setZ] = useState<Partial<Record<PieceId, number>>>({})
  const zTop = useRef(10)
  const zBottom = useRef(-1)
  const artRef = useRef<HTMLElement | null>(null)
  const drag = useRef<{ id: PieceId; sx: number; sy: number; dx: number; dy: number; scale: number } | null>(null)

  useEffect(() => {
    setEditing(new URLSearchParams(window.location.search).get("editar") === "1")
  }, [])

  const get = (id: PieceId): Offset => off[id] ?? initial(id)
  const front = (id: PieceId) => setZ((p) => ({ ...p, [id]: ++zTop.current }))
  const back = (id: PieceId) => setZ((p) => ({ ...p, [id]: --zBottom.current }))
  const patch = (id: PieceId, f: (o: Offset) => Offset) => setOff((p) => ({ ...p, [id]: f(p[id] ?? initial(id)) }))

  // Flechas: mover 1 px (Mayús = 10). + / −: tamaño 2% (Mayús = 10%).
  useEffect(() => {
    if (!editing) return
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.tagName === "INPUT") return
      const k = e.key.toLowerCase()
      if (k === "h") return setHidden((v) => !v)
      const step = e.shiftKey ? 10 : 1
      const d: Record<string, [number, number]> = {
        arrowleft: [-step, 0],
        arrowright: [step, 0],
        arrowup: [0, -step],
        arrowdown: [0, step],
      }
      const ds = k === "+" || k === "=" ? (e.shiftKey ? 0.1 : 0.02) : k === "-" || k === "_" ? (e.shiftKey ? -0.1 : -0.02) : 0
      const m = d[k] ?? (ds ? ([0, 0] as [number, number]) : undefined)
      if (!m || !sel) return
      e.preventDefault()
      patch(sel, (o) => ({ dx: o.dx + m[0], dy: o.dy + m[1], s: clampScale(o.s + ds) }))
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [editing, sel])

  const at = (id: PieceId) => styleFor(id, get(id), z[id], editing, sel === id)

  const dragHandlers: Ctx["dragHandlers"] = editing
    ? {
        onPointerDown: (e) => {
          const el = (e.target as HTMLElement).closest("[data-piece]")
          if (!el) return
          const id = el.getAttribute("data-piece") as PieceId
          e.preventDefault()
          e.currentTarget.setPointerCapture(e.pointerId)
          const o = get(id)
          const artW = artRef.current?.getBoundingClientRect().width ?? CANVAS_W
          drag.current = { id, sx: e.clientX, sy: e.clientY, dx: o.dx, dy: o.dy, scale: artW / CANVAS_W }
          setSel(id)
          front(id)
        },
        onPointerMove: (e) => {
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
    : {}

  const describe = (id: PieceId) => {
    const b = BASE[id]
    const o = get(id)
    if (id === "titular") return `${id}: x=${b.x + o.dx}, distancia al borde inferior=${b.y - o.dy}, escala=${o.s}`
    if (id === "linea") return `${id}: desplazamiento x=${o.dx}, y=${o.dy} (desde su lugar original), largo (escala vertical)=${o.s}`
    if (id === "caras" || id === "frase" || id === "formulario")
      return `${id}: desplazamiento x=${o.dx}, y=${o.dy} (desde su lugar original), escala=${o.s}`
    const w = Math.round((b.w ?? 0) * o.s)
    const h = b.h !== undefined ? ` × alto=${Math.round(b.h * o.s)}` : ""
    return `${id}: x=${b.x + o.dx}, y=${b.y + o.dy}, escala=${o.s}, tamaño final: ancho=${w}${h}`
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
    <EditorCtx.Provider value={{ editing, at, artRef, dragHandlers }}>
      {children}
      {editing && hidden && (
        <div className="fixed bottom-3 right-3 z-[100] flex gap-1 rounded-full border border-slate-200 bg-white/90 p-1 font-sans text-xs shadow-lg backdrop-blur">
          <button className={`${btn} !rounded-full`} onClick={() => setHidden(false)}>Mostrar editor</button>
          <button className={`${btn} !rounded-full`} onClick={copy}>{copied ? "¡Copiado!" : "Copiar"}</button>
        </div>
      )}
      {editing && !hidden && (
        <div className="fixed bottom-4 right-4 z-[100] max-h-[calc(100dvh-2rem)] w-80 overflow-y-auto rounded-xl border border-slate-200 bg-white p-3 font-sans text-xs text-slate-800 shadow-2xl">
          <div className="mb-1 flex items-center justify-between">
            <div className="text-sm font-semibold">Modo edición</div>
            <button className={btn} onClick={() => setHidden(true)}>Ocultar (H)</button>
          </div>
          <p className="mb-2 text-slate-500">
            Arrastre una pieza para moverla; al hacer clic pasa al frente. Flechas: 1 px (Mayús = 10). + / −: tamaño 2% (Mayús = 10%). H: ocultar o mostrar este panel.
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
                  <button className={btn} onClick={() => patch(sel, () => initial(sel))}>Reiniciar pieza</button>
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
    </EditorCtx.Provider>
  )
}
