import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Figtree, Newsreader } from "next/font/google"
import { ThemeProvider, THEME_COLORS, THEME_INIT_SCRIPT } from "@/lib/theme"
import "./globals.css"

const figtree = Figtree({ subsets: ["latin"], variable: "--font-figtree", display: "swap" })
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  style: ["normal", "italic"],
})

export const metadata: Metadata = {
  title: "Recepción Digital",
  description:
    "Panel de supervisión de la Recepción Digital de Renew: una oficina digital donde trabajan Valentina, Carlos, Elena y Steven.",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-light-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
  appleWebApp: {
    title: "Renew IA",
    capable: true,
    statusBarStyle: "default",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLORS.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLORS.dark },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning className={`bg-background ${figtree.variable} ${newsreader.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="antialiased font-sans">
        <ThemeProvider>{children}</ThemeProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
