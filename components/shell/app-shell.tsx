"use client"

import dynamic from "next/dynamic"
import { OfficeLoading } from "@/components/office/office-view"
import { Sidebar } from "./sidebar"
import { ModulePanel } from "./module-panel"
import { EmployeePanel } from "./employee-panel"
import { TeamBar } from "./team-bar"

// The 3D office is client-only; avoid SSR of the WebGL canvas.
const OfficeView = dynamic(
  () => import("@/components/office/office-view").then((m) => m.OfficeView),
  { ssr: false, loading: () => <OfficeLoading /> },
)

export function AppShell() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-background">
      <OfficeView />

      {/* Floating UI layer */}
      <Sidebar />
      <ModulePanel />
      <EmployeePanel />

      <TeamBar />
    </main>
  )
}
