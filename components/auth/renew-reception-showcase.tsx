import Image from "next/image"
import { CalendarDays, Heart, Star, Store } from "lucide-react"

/**
 * Panel de marca del login (solo escritorio).
 *
 * Es un componente estático (sin estado ni efectos): la composición está dibujada
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

const NAVY = "#1d2a5e"
const ORANGE = "#ee6a24"
const BLUE = "#1d6fd8"
const CARD_SHADOW = "0 24px 48px -16px rgba(20,30,70,0.30), 0 3px 8px rgba(20,30,70,0.10)"

const APPOINTMENTS = [
  { label: "Agenda", date: "08/10/26", time: "7:30 AM", confirmed: true, highlight: false },
  { label: "Cita", date: "06/10/26", time: "11:30 AM", confirmed: false, highlight: true },
  { label: "Médica", date: "02/10/26", time: "4:45 PM", confirmed: false, highlight: false },
] as const

function Sparkle({ x, y, size }: { x: number; y: number; size: number }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      style={box(x, y, size, size)}
      fill={ORANGE}
    >
      <path d="M12 0C12 7 17 12 24 12C17 12 12 17 12 24C12 17 7 12 0 12C7 12 12 7 12 0Z" />
    </svg>
  )
}

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
  return (
    <section
      aria-label="La Recepción Digital de Renew en una sola pantalla"
      className="w-full select-none"
      style={{ containerType: "inline-size", aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
    >
      <div className="relative h-full w-full font-sans" style={{ color: NAVY }}>
        {/* Logotipo */}
        <Image
          src="/images/renew-logo.webp"
          alt="Renew — Centro de Terapia Física & Rehabilitación"
          width={640}
          height={426}
          style={{ ...box(58, 42, 290), height: "auto" }}
        />

        {/* WhatsApp */}
        <svg aria-hidden viewBox="0 0 70 70" style={{ ...box(445, 139, 69, 70), filter: "drop-shadow(0 8px 14px rgba(37,196,63,0.30))" }}>
          <defs>
            <linearGradient id="wa-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#5fe77b" />
              <stop offset="1" stopColor="#22bd44" />
            </linearGradient>
          </defs>
          <rect width="70" height="70" rx="17" fill="url(#wa-grad)" />
          <path
            d="M26.1 54.0A21 21 0 1 0 15.3 42.2L13 57Z"
            fill="none"
            stroke="#fff"
            strokeWidth="4.5"
            strokeLinejoin="round"
          />
          <path
            transform="translate(23 23)"
            fill="#fff"
            d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
          />
        </svg>

        {/* Destellos y corazones */}
        <Sparkle x={337} y={338} size={40} />
        <Sparkle x={324} y={329} size={17} />
        <HeartBubble cx={417} cy={416} d={86} />
        <HeartBubble cx={1080} cy={548} d={92} />

        {/* Foto de la recepción */}
        <div
          className="overflow-hidden"
          style={{ ...box(497, 228, 300, 280), borderRadius: u(24), boxShadow: CARD_SHADOW, zIndex: 1 }}
        >
          <Image
            src="/images/renew-recepcion.webp"
            alt="Recepción de Renew"
            fill
            sizes="25vw"
            className="object-cover"
            style={{ objectPosition: "50% 28%" }}
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
          style={{ ...box(735, 98, 325, 500), borderRadius: u(26), boxShadow: CARD_SHADOW, zIndex: 2, background: "#777" }}
        >
          <Image
            src="/images/renew-equipo.webp"
            alt="Equipo de recepción de Renew"
            fill
            sizes="30vw"
            className="object-cover"
            style={{ objectPosition: "50% 50%" }}
          />
          {/* barra de progreso tipo historia */}
          <div aria-hidden className="absolute" style={{ ...box(23, 22, 279, 5), borderRadius: u(3), background: "rgba(255,255,255,0.45)" }}>
            <div className="h-full" style={{ width: "45%", borderRadius: u(3), background: "#fff" }} />
          </div>
          {/* paginación */}
          <div aria-hidden className="absolute" style={{ ...box(65, 455, 142, 33), borderRadius: u(17), border: `${u(2.5)} solid rgba(255,255,255,0.9)` }} />
          <div aria-hidden className="absolute" style={{ ...box(222, 455, 33, 33), borderRadius: "50%", border: `${u(2.5)} solid rgba(255,255,255,0.9)` }} />
          <div aria-hidden className="absolute" style={{ ...box(268, 455, 33, 33), borderRadius: "50%", border: `${u(2.5)} solid rgba(255,255,255,0.9)` }} />
        </div>

        {/* Insignia 2017 */}
        <div
          aria-hidden
          className="flex items-center"
          style={{
            ...box(981, 163, 110, 44),
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
          style={{ ...box(563, 450, 239, 345), borderRadius: u(30), background: "#fff", boxShadow: CARD_SHADOW, zIndex: 4 }}
        >
          <div
            className="flex items-center justify-center text-white"
            style={{ ...box(17, 16, 33, 31), borderRadius: u(9), background: BLUE }}
          >
            <Star fill="currentColor" strokeWidth={0} style={{ width: u(18), height: u(18) }} />
          </div>

          <div
            className="overflow-hidden"
            style={{ ...box(34, 70, 171, 195), borderRadius: u(10), border: `${u(1.5)} solid #dde0e7`, background: "#fff" }}
          >
            <Image
              src="/images/renew-logo.webp"
              alt=""
              width={640}
              height={426}
              style={{ ...box(55, 7, 54), height: "auto" }}
            />
            <div style={{ ...box(6, 38, 159, 150), fontSize: u(14), lineHeight: 1 }}>
              {APPOINTMENTS.map((a, i) => (
                <div key={a.label} style={{ position: "relative", height: u(58), borderTop: i ? `${u(1.5)} solid #e4e6ec` : undefined }}>
                  <div style={{ ...box(4, 5), fontWeight: 600, color: "#1b2340" }}>{a.label}</div>
                  {a.confirmed && (
                    <div
                      className="flex items-center justify-center text-white"
                      style={{ ...box(139, 4, 15, 15), borderRadius: "50%", background: BLUE, fontSize: u(10) }}
                    >
                      ✓
                    </div>
                  )}
                  <div
                    className="flex items-center justify-between"
                    style={{
                      ...box(0, 26, 159, 24),
                      borderRadius: u(6),
                      paddingInline: u(4),
                      background: a.highlight ? "#ebedf1" : undefined,
                      fontSize: u(13),
                    }}
                  >
                    <span style={{ color: "#5d6478" }}>{a.date}</span>
                    <span className="tabular-nums" style={{ fontWeight: 600, color: "#1b2340" }}>{a.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...box(17, 283, 180, 16), borderRadius: u(8), background: "#e6e8ed" }} />
          <div style={{ ...box(17, 311, 138, 14), borderRadius: u(7), background: "#e6e8ed" }} />
        </div>

        {/* Sello ISO */}
        <Image
          src="/images/renew-iso.webp"
          alt="Empresa certificada ISO 9001-2015"
          width={420}
          height={420}
          style={{ ...box(748, 648, 194, 194), zIndex: 5, filter: "drop-shadow(0 14px 18px rgba(20,40,90,0.30))" }}
        />

        {/* Estrella azul */}
        <svg aria-hidden viewBox="0 0 60 60" style={{ ...box(1018, 690, 66, 66), zIndex: 3, overflow: "visible" }}>
          <path
            transform="rotate(-14 30 30)"
            d="M30 4l7.4 16.1 17.6 2-13 12 3.6 17.4L30 42.3 14.4 51.5 18 34.1 5 22.1l17.6-2z"
            fill={BLUE}
            stroke={BLUE}
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path d="M54 12l12-12" stroke={BLUE} strokeWidth="4" strokeLinecap="round" transform="translate(0 0)" />
        </svg>

        {/* Titular */}
        <h2
          style={{
            ...box(60, 563),
            margin: 0,
            fontSize: u(82),
            lineHeight: u(78),
            fontWeight: 700,
            letterSpacing: "-0.025em",
            whiteSpace: "nowrap",
          }}
        >
          La Recepción
          <br />
          Digital
          <br />
          <span style={{ color: "#ee6320" }}>de Renew</span>
        </h2>
        <p
          style={{
            ...box(60, 803),
            margin: 0,
            fontSize: u(58),
            lineHeight: u(60),
            fontWeight: 500,
            letterSpacing: "-0.01em",
            whiteSpace: "nowrap",
          }}
        >
          en una sola pantalla.
        </p>
      </div>
    </section>
  )
}
