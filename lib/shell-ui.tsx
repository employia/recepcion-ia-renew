"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

// Purely visual state of the shell (is the sidebar expanded?). Kept apart from
// the app store because it never touches history, session or data.
interface ShellUiState {
  navOpen: boolean
  setNavOpen: (open: boolean) => void
}

const ShellUiContext = createContext<ShellUiState | null>(null)

export function ShellUiProvider({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false)
  const value = useMemo(() => ({ navOpen, setNavOpen }), [navOpen])
  return <ShellUiContext.Provider value={value}>{children}</ShellUiContext.Provider>
}

export function useShellUi() {
  const ctx = useContext(ShellUiContext)
  if (!ctx) throw new Error("useShellUi must be used within ShellUiProvider")
  return ctx
}
