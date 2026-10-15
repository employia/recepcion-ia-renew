"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { EmployeeId, ModuleId } from "./types"

interface Session {
  email: string
  name: string
}

interface AppState {
  // auth (mock for now)
  session: Session | null
  signIn: (email: string) => void
  signOut: () => void
  // active module panel (null = office view, no panel)
  activeModule: ModuleId | null
  openModule: (m: ModuleId) => void
  closeModule: () => void
  // employee presentation panel (opened by clicking a 3D employee)
  activeEmployee: EmployeeId | null
  openEmployee: (id: EmployeeId) => void
  closeEmployee: () => void
}

const AppContext = createContext<AppState | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [activeModule, setActiveModule] = useState<ModuleId | null>(null)
  const [activeEmployee, setActiveEmployee] = useState<EmployeeId | null>(null)

  const signIn = useCallback((email: string) => {
    const name = email.split("@")[0].replace(/[._]/g, " ")
    setSession({ email, name: name.charAt(0).toUpperCase() + name.slice(1) })
  }, [])

  const signOut = useCallback(() => {
    setSession(null)
    setActiveModule(null)
    setActiveEmployee(null)
  }, [])

  // Only one side panel at a time: opening a module closes the employee card
  // and vice versa.
  const openModule = useCallback((m: ModuleId) => {
    setActiveEmployee(null)
    setActiveModule(m === "office" ? null : m)
  }, [])

  const closeModule = useCallback(() => setActiveModule(null), [])

  const openEmployee = useCallback((id: EmployeeId) => {
    setActiveModule(null)
    setActiveEmployee(id)
  }, [])

  const closeEmployee = useCallback(() => setActiveEmployee(null), [])

  const value = useMemo<AppState>(
    () => ({
      session,
      signIn,
      signOut,
      activeModule,
      openModule,
      closeModule,
      activeEmployee,
      openEmployee,
      closeEmployee,
    }),
    [
      session,
      signIn,
      signOut,
      activeModule,
      openModule,
      closeModule,
      activeEmployee,
      openEmployee,
      closeEmployee,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useApp must be used within AppProvider")
  return ctx
}

// --- Hover state, scoped to the 3D office --------------------------------
// Split out from AppState on purpose: hoveredEmployee changes on every
// pointer-over/out while the mouse crosses an avatar (high frequency). It
// used to live in the same context as session/branch/activeModule, which
// meant every hover re-rendered 7+ unrelated components across the app
// shell (sidebar, branch selector, module panel, account, login...). Only
// EmployeeZone actually reads it, so it gets its own tiny provider mounted
// around just the office subtree — hover now only re-renders the office.
interface HoverState {
  hoveredEmployee: string | null
  setHoveredEmployee: (id: string | null) => void
}

const HoverContext = createContext<HoverState | null>(null)

export function HoverProvider({ children }: { children: ReactNode }) {
  const [hoveredEmployee, setHoveredEmployee] = useState<string | null>(null)
  const value = useMemo(() => ({ hoveredEmployee, setHoveredEmployee }), [hoveredEmployee])
  return <HoverContext.Provider value={value}>{children}</HoverContext.Provider>
}

export function useHover() {
  const ctx = useContext(HoverContext)
  if (!ctx) throw new Error("useHover must be used within HoverProvider")
  return ctx
}
