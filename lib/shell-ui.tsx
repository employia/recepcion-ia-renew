"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"

// Purely visual state of the shell (is the sidebar expanded?). Kept apart from
// the app store because it never touches history, session or data.
//
// The sidebar has three modes so hover and click never fight each other:
//   closed  - collapsed rail
//   hover   - opened by hovering the isotype; closes again when the pointer leaves
//   pinned  - opened by a click (or on touch); stays until closed explicitly
type NavMode = "closed" | "hover" | "pinned"

const HOVER_LEAVE_DELAY = 140

interface ShellUiState {
  navOpen: boolean
  navPinned: boolean
  /** Explicit open (pinned) or close. Used by clicks, Escape, the backdrop and navigation. */
  setNavOpen: (open: boolean) => void
  /** Click on the isotype: pin it open, or close it if it was already pinned. */
  toggleNav: () => void
  /**
   * Pointer entered or left the isotype or the sidebar (mouse only). Only the
   * isotype may open the sidebar (`canOpen`); the sidebar itself just keeps it
   * open while the pointer is over it.
   */
  hoverNav: (inside: boolean, canOpen?: boolean) => void
}

const ShellUiContext = createContext<ShellUiState | null>(null)

export function ShellUiProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<NavMode>("closed")
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = useCallback(() => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    leaveTimer.current = null
  }, [])
  useEffect(() => clearTimer, [clearTimer])

  const setNavOpen = useCallback(
    (open: boolean) => {
      clearTimer()
      setMode(open ? "pinned" : "closed")
    },
    [clearTimer],
  )
  const toggleNav = useCallback(() => {
    clearTimer()
    setMode((m) => (m === "pinned" ? "closed" : "pinned"))
  }, [clearTimer])
  const hoverNav = useCallback(
    (inside: boolean, canOpen = true) => {
      clearTimer()
      if (inside) {
        if (canOpen) setMode((m) => (m === "closed" ? "hover" : m))
      } else {
        leaveTimer.current = setTimeout(() => setMode((m) => (m === "hover" ? "closed" : m)), HOVER_LEAVE_DELAY)
      }
    },
    [clearTimer],
  )

  const value = useMemo(
    () => ({ navOpen: mode !== "closed", navPinned: mode === "pinned", setNavOpen, toggleNav, hoverNav }),
    [mode, setNavOpen, toggleNav, hoverNav],
  )
  return <ShellUiContext.Provider value={value}>{children}</ShellUiContext.Provider>
}

export function useShellUi() {
  const ctx = useContext(ShellUiContext)
  if (!ctx) throw new Error("useShellUi must be used within ShellUiProvider")
  return ctx
}
