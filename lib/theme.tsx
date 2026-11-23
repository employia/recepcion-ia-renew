"use client"

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"

/** New visitors start in light; an explicit "default" preference follows the operating system. */
export type ThemePreference = "default" | "light" | "dark"
export type ResolvedTheme = "light" | "dark"

export const THEME_STORAGE_KEY = "renew-theme"
export const THEME_COLORS: Record<ResolvedTheme, string> = { light: "#f5f5f7", dark: "#1f1e1c" }

const SYSTEM_DARK_QUERY = "(prefers-color-scheme: dark)"

function subscribeToSystemTheme(onChange: () => void) {
  const query = window.matchMedia(SYSTEM_DARK_QUERY)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia(SYSTEM_DARK_QUERY).matches ? "dark" : "light"
}

function useSystemTheme(): ResolvedTheme {
  return useSyncExternalStore(subscribeToSystemTheme, getSystemTheme, (): ResolvedTheme => "light")
}

interface ThemeState {
  preference: ThemePreference
  resolved: ResolvedTheme
  setPreference: (p: ThemePreference) => void
}

const ThemeContext = createContext<ThemeState | null>(null)

function resolve(p: ThemePreference, systemTheme: ResolvedTheme): ResolvedTheme {
  return p === "default" ? systemTheme : p
}

/** Older stored "system" values are still treated as the current default preference. */
function parseStored(value: string | null): ThemePreference {
  if (value === "light" || value === "dark" || value === "default") return value
  return value === "system" ? "default" : "light"
}

function apply(resolved: ResolvedTheme, preference: ThemePreference, animate: boolean) {
  const root = document.documentElement
  if (animate && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.classList.add("theme-transition")
    window.setTimeout(() => root.classList.remove("theme-transition"), 450)
  }
  root.classList.toggle("dark", resolved === "dark")
  root.dataset.theme = preference
  root.style.colorScheme = resolved
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.content = THEME_COLORS[resolved]
  })
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("light")
  const [initialized, setInitialized] = useState(false)
  const systemTheme = useSystemTheme()
  const resolved = resolve(preference, systemTheme)

  useLayoutEffect(() => {
    let stored: string | null = null
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY)
    } catch {
      // Storage can be blocked; fall back to the first-visit theme.
    }
    const initialPreference = parseStored(stored)
    const initialTheme = resolve(initialPreference, getSystemTheme())
    setPreferenceState(initialPreference)
    apply(initialTheme, initialPreference, false)
    setInitialized(true)
  }, [])

  useLayoutEffect(() => {
    if (initialized) apply(resolved, preference, false)
  }, [initialized, preference, resolved])

  const setPreference = useCallback((p: ThemePreference) => {
    const next = resolve(p, systemTheme)
    setPreferenceState(p)
    apply(next, p, true)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, p)
    } catch {
      // Storage can be blocked; the choice still applies for this session.
    }
  }, [systemTheme])

  const value = useMemo(() => ({ preference, resolved, setPreference }), [preference, resolved, setPreference])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
  return ctx
}
