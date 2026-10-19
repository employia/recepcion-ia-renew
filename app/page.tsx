"use client"

import { AppProvider, useApp } from "@/lib/store"
import { LoginScreen } from "@/components/auth/login-screen"
import { LegalGate } from "@/components/auth/legal-gate"
import { AppShell } from "@/components/shell/app-shell"

function Root() {
  const { session, authLoading, legalAccepted } = useApp()
  if (authLoading) return <div className="min-h-screen w-full bg-background" aria-busy="true" />
  if (!session) return <LoginScreen />
  // Checking whether the legal documents were already accepted.
  if (legalAccepted === null) return <div className="min-h-screen w-full bg-background" aria-busy="true" />
  // Acceptance of the current terms and privacy policy is required to enter.
  if (!legalAccepted) return <LegalGate />
  return <AppShell />
}

export default function Page() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  )
}
