"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

export type ThemePreference = "light" | "dark" | "system"
export type ResolvedTheme = "light" | "dark"

export const THEME_STORAGE_KEY = "renew-theme"
export const THEME_COLORS: Record<ResolvedTheme, string> = { light: "#f5f5f7", dark: "#1f1e1c" }

/** Runs before first paint (see layout.tsx) so the saved theme never flashes. */
export const THEME_INIT_SCRIPT = `(function(){try{var p=localStorage.getItem("${THEME_STORAGE_KEY}")||"system";var d=p==="dark"||(p==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light"}catch(e){}})()`

interface ThemeState {
  preference: ThemePreference
  resolved: ResolvedTheme
  setPreference: (p: ThemePreference) => void
}

const ThemeContext = createContext<ThemeState | null>(null)

function systemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function apply(resolved: ResolvedTheme, animate: boolean) {
  const root = document.documentElement
  if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.classList.add("theme-transition")
    window.setTimeout(() => root.classList.remove("theme-transition"), 350)
  }
  root.classList.toggle("dark", resolved === "dark")
  root.style.colorScheme = resolved
  // The browser bar must follow the in-app choice, not only the OS setting.
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
    m.removeAttribute("media")
    m.setAttribute("content", THEME_COLORS[resolved])
  })
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("system")
  const [resolved, setResolved] = useState<ResolvedTheme>("light")

  // Sync React state with what the init script already applied.
  useEffect(() => {
    const stored = (localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null) ?? "system"
    setPreferenceState(stored)
    setResolved(stored === "system" ? systemTheme() : stored)
  }, [])

  // Follow the operating system while the preference is "system".
  useEffect(() => {
    if (preference !== "system") return
    const mq = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => {
      const next = mq.matches ? "dark" : "light"
      setResolved(next)
      apply(next, true)
    }
    mq.addEventListener("change", onChange)
    return () => mq.removeEventListener("change", onChange)
  }, [preference])

  const setPreference = useCallback((p: ThemePreference) => {
    const next = p === "system" ? systemTheme() : p
    setPreferenceState(p)
    setResolved(next)
    apply(next, true)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, p)
    } catch {
      // Storage can be blocked; the choice still applies for this session.
    }
  }, [])

  const value = useMemo(() => ({ preference, resolved, setPreference }), [preference, resolved, setPreference])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}
