"use client"

import { AppProvider, useApp } from "@/lib/store"
import { LoginScreen } from "@/components/auth/login-screen"
import { AppShell } from "@/components/shell/app-shell"

function Root() {
  const { session, authLoading } = useApp()
  if (authLoading) return <div className="min-h-screen w-full bg-background" aria-busy="true" />
  if (!session) return <LoginScreen />
  return <AppShell />
}

export default function Page() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  )
}
