import Image from "next/image"
import { CalendarDays, Store } from "lucide-react"

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
const CARD_SHADOW = "0 24px 48px -16px rgba(20,30,70,0.30), 0 3px 8px rgba(20,30,70,0.10)"

export function RenewReceptionShowcase() {
  return (
    <section
      aria-label="La Recepción Digital de Renew en una sola pantalla"
      className="w-full select-none"
      style={{ containerType: "inline-size", aspectRatio: `${CANVAS_W} / ${CANVAS_H}` }}
    >
      <div className="relative h-full w-full font-sans" style={{ color: NAVY }}>
        {/* Logotipo (completo, con lema) */}
        <Image
          src="/images/renew-logo-full.webp"
          alt="Renew — Centro de Terapia Física & Rehabilitación. Fortaleciendo & Restaurando su Salud"
          width={640}
          height={426}
          style={{ ...box(58, 40, 290), height: "auto" }}
        />

        {/* WhatsApp */}
        <svg
          aria-hidden
          viewBox="0 0 70 70"
          style={{ ...box(681, 174, 64, 64), zIndex: 8, filter: "drop-shadow(0 10px 16px rgba(37,196,63,0.32))" }}
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

        {/* Foto de la recepción */}
        <div
          className="overflow-hidden"
          style={{ ...box(497, 228, 252, 280), borderRadius: u(24), boxShadow: CARD_SHADOW, zIndex: 1 }}
        >
          <Image
            src="/images/renew-recepcion.webp"
            alt="Recepción de Renew"
            fill
            sizes="25vw"
            className="object-cover"
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

        {/* Sello ISO */}
        <Image
          src="/images/renew-iso.webp"
          alt="Empresa certificada ISO 9001-2015"
          width={420}
          height={420}
          style={{ ...box(586, 525, 194, 194), zIndex: 5, filter: "drop-shadow(0 14px 18px rgba(20,40,90,0.30))" }}
        />

        {/* Titular: su tamaño sigue al de la pantalla (no al del lienzo), así que
            agrandar el diseño no lo agranda a él. Anclado abajo a la izquierda. */}
        <div
          style={{
            position: "absolute",
            left: u(60),
            bottom: u(98),
            fontSize: "min(3.3vw, 6.4cqw)",
            lineHeight: 1.02,
            letterSpacing: "-0.025em",
            whiteSpace: "nowrap",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1em", fontWeight: 700, lineHeight: "inherit" }}>
            La Recepción
            <br />
            Digital
            <br />
            <span style={{ color: "#ee6320" }}>de Renew</span>
          </h2>
          <p style={{ margin: "0.18em 0 0", fontSize: "0.71em", fontWeight: 500, letterSpacing: "-0.01em", lineHeight: 1.1 }}>
            en una sola pantalla.
          </p>
        </div>
      </div>
    </section>
  )
}
