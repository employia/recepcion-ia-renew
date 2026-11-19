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

/** "default" always resolves to the light theme; it never follows the operating system. */
export type ThemePreference = "default" | "light" | "dark"
export type ResolvedTheme = "light" | "dark"

export const THEME_STORAGE_KEY = "renew-theme"
export const THEME_COLORS: Record<ResolvedTheme, string> = { light: "#f5f5f7", dark: "#1f1e1c" }

/** Runs before first paint (see layout.tsx) so the saved theme never flashes. */
export const THEME_INIT_SCRIPT = `(function(){try{var d=localStorage.getItem("${THEME_STORAGE_KEY}")==="dark";var r=document.documentElement;r.classList.toggle("dark",d);r.style.colorScheme=d?"dark":"light";var c=d?"${THEME_COLORS.dark}":"${THEME_COLORS.light}";document.querySelectorAll('meta[name="theme-color"]').forEach(function(m){m.removeAttribute("media");m.setAttribute("content",c)})}catch(e){}})()`

interface ThemeState {
  preference: ThemePreference
  resolved: ResolvedTheme
  setPreference: (p: ThemePreference) => void
}

const ThemeContext = createContext<ThemeState | null>(null)

function resolve(p: ThemePreference): ResolvedTheme {
  return p === "dark" ? "dark" : "light"
}

/** Stored values from before "default" existed (such as "system") fall back to the default. */
function parseStored(value: string | null): ThemePreference {
  return value === "light" || value === "dark" ? value : "default"
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
  const [preference, setPreferenceState] = useState<ThemePreference>("default")
  const [resolved, setResolved] = useState<ResolvedTheme>("light")

  // Sync React state with what the init script already applied.
  useEffect(() => {
    let stored: string | null = null
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY)
    } catch {
      // Storage can be blocked; fall back to the default theme.
    }
    const p = parseStored(stored)
    setPreferenceState(p)
    setResolved(resolve(p))
  }, [])

  const setPreference = useCallback((p: ThemePreference) => {
    const next = resolve(p)
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
