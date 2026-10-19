"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import type { Session as SupabaseSession } from "@supabase/supabase-js"
import { authErrorMessage, supabase, supabaseConfigured } from "./supabase"
import { LEGAL_DOCS, LEGAL_VERSION } from "./legal"
import type { EmployeeId, ModuleId } from "./types"

// --- Browser history -------------------------------------------------------
// The app is a single page, so the browser (and the Android/iOS back gesture)
// has nothing to go back to inside it: "Back" used to leave the app entirely.
// Opening a panel (module or employee card) from the office now pushes one
// history entry; switching between panels replaces it. So one "Back" always
// closes the open panel and lands on the office, and "Forward" reopens it.
const HISTORY_KEY = "renewView"

interface ViewState {
  module: ModuleId | null
  employee: EmployeeId | null
}

const EMPTY_VIEW: ViewState = { module: null, employee: null }

/** The panel recorded in the current history entry, or null on the office entry. */
function readPanelEntry(): ViewState | null {
  const s = window.history.state as Record<string, unknown> | null
  const v = s?.[HISTORY_KEY] as ViewState | undefined
  return v ?? null
}

interface Session {
  id: string
  email: string
  name: string
}

interface AppState {
  // auth (Supabase)
  session: Session | null
  /** True until the stored session (if any) has been restored on load. */
  authLoading: boolean
  /** Acceptance of the current legal documents: null while it is being checked. */
  legalAccepted: boolean | null
  /** Records the acceptance of the current legal documents. Returns an error message or null. */
  acceptLegal: () => Promise<string | null>
  /** Returns an error message in Spanish, or null on success. */
  signIn: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
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
  const [authLoading, setAuthLoading] = useState(true)
  const [legalAccepted, setLegalAccepted] = useState<boolean | null>(null)
  const [activeModule, setActiveModule] = useState<ModuleId | null>(null)
  const [activeEmployee, setActiveEmployee] = useState<EmployeeId | null>(null)

  const toSession = useCallback((s: SupabaseSession | null): Session | null => {
    if (!s?.user) return null
    const email = s.user.email ?? ""
    const meta = s.user.user_metadata as { full_name?: string } | undefined
    const fallback = email.split("@")[0].replace(/[._]/g, " ")
    const name = (meta?.full_name || fallback).trim()
    return { id: s.user.id, email, name: name.charAt(0).toUpperCase() + name.slice(1) }
  }, [])

  // Restore the stored session on load and follow sign-in / sign-out / token
  // refresh (including from another tab).
  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(toSession(data.session))
      setAuthLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(toSession(next))
      setAuthLoading(false)
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [toSession])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabaseConfigured)
      return "Este despliegue no tiene configurada la conexión con Supabase. Avise al administrador."
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error ? authErrorMessage(error) : null
  }, [])

  // Popstate handlers read the session through a ref so they never reopen a
  // panel behind the login screen.
  const sessionRef = useRef<Session | null>(null)
  useEffect(() => {
    sessionRef.current = session
  }, [session])

  // Has this person already accepted the current version of the legal
  // documents? Checked once per sign-in (keyed by user id, so token refreshes do
  // not repeat it). On any error we fail closed: the acceptance screen shows.
  const userId = session?.id ?? null
  useEffect(() => {
    if (!userId) {
      setLegalAccepted(null)
      return
    }
    let active = true
    setLegalAccepted(null)
    supabase
      .from("legal_acceptances")
      .select("document")
      .eq("user_id", userId)
      .eq("version", LEGAL_VERSION)
      .then(({ data, error }) => {
        if (!active) return
        if (error) return setLegalAccepted(false)
        const done = new Set((data ?? []).map((r) => r.document as string))
        setLegalAccepted(LEGAL_DOCS.every((d) => done.has(d)))
      })
    return () => {
      active = false
    }
  }, [userId])

  const acceptLegal = useCallback(async () => {
    const uid = sessionRef.current?.id
    if (!uid) return "Su sesión ya no es válida. Inicie sesión de nuevo."
    const rows = LEGAL_DOCS.map((document) => ({ user_id: uid, document, version: LEGAL_VERSION }))
    // Append-only record; a duplicate (already accepted) is simply ignored.
    const { error } = await supabase
      .from("legal_acceptances")
      .upsert(rows, { onConflict: "user_id,document,version", ignoreDuplicates: true })
    if (error) return "No pudimos registrar su aceptación. Intente de nuevo."
    setLegalAccepted(true)
    return null
  }, [])

  // True between calling history.back() and receiving its popstate, so a
  // double close (e.g. "Oficina" closes module + employee, or a double tap)
  // never goes back twice and leaves the app.
  const backPending = useRef(false)

  const show = useCallback((view: ViewState) => {
    setActiveModule(view.module)
    setActiveEmployee(view.employee)
  }, [])

  // Only one side panel at a time: opening a module closes the employee card
  // and vice versa. From the office a panel adds one history entry; from
  // another panel it replaces the current one.
  const goTo = useCallback(
    (view: ViewState) => {
      const entry = { ...(window.history.state ?? {}), [HISTORY_KEY]: view }
      if (readPanelEntry()) window.history.replaceState(entry, "")
      else window.history.pushState(entry, "")
      backPending.current = false
      show(view)
    },
    [show],
  )

  const closePanels = useCallback(() => {
    if (backPending.current) return
    if (readPanelEntry()) {
      backPending.current = true
      window.history.back() // popstate (below) updates the view
    } else {
      show(EMPTY_VIEW)
    }
  }, [show])

  useEffect(() => {
    function onPopState() {
      backPending.current = false
      const view = readPanelEntry()
      show(view && sessionRef.current ? view : EMPTY_VIEW)
    }
    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [show])

  const signOut = useCallback(async () => {
    // Step off the panel's history entry so the next login starts clean.
    if (readPanelEntry() && !backPending.current) {
      backPending.current = true
      window.history.back()
    }
    show(EMPTY_VIEW)
    await supabase.auth.signOut()
    setSession(null)
  }, [show])

  const openModule = useCallback(
    (m: ModuleId) => {
      if (m === "office") closePanels()
      else goTo({ module: m, employee: null })
    },
    [goTo, closePanels],
  )

  const openEmployee = useCallback(
    (id: EmployeeId) => goTo({ module: null, employee: id }),
    [goTo],
  )

  // Both close the (single) open panel.
  const closeModule = closePanels
  const closeEmployee = closePanels

  const value = useMemo<AppState>(
    () => ({
      session,
      authLoading,
      legalAccepted,
      acceptLegal,
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
      authLoading,
      legalAccepted,
      acceptLegal,
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
