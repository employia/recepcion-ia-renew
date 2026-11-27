"use client"

import dynamic from "next/dynamic"
import { OfficeLoading } from "@/components/office/office-loading"
import { useApp } from "@/lib/store"
import { ShellUiProvider } from "@/lib/shell-ui"
import { PROFILE_WIDTH, RAIL_MIN, RAIL_WIDTH, SPLIT_MIN, dashboardWidth, useViewportWidth } from "@/lib/layout"
import { AppSidebar, MobileMenuButton } from "./app-sidebar"
import { DashboardPanel } from "./dashboard-panel"
import { EmployeePanel } from "./employee-panel"
import { HelpCenter, HelpFab } from "./help-center"
import { TeamBar } from "./team-bar"

// The 3D office is client-only; avoid SSR of the WebGL canvas.
const OfficeView = dynamic(
  () => import("@/components/office/office-view").then((m) => m.OfficeView),
  { ssr: false, loading: () => <OfficeLoading /> },
)

export function AppShell() {
  return (
    <ShellUiProvider>
      <Shell />
    </ShellUiProvider>
  )
}

function Shell() {
  const { activeModule, activeEmployee } = useApp()
  const viewport = useViewportWidth()

  const split = viewport >= SPLIT_MIN
  const rail = viewport >= RAIL_MIN ? RAIL_WIDTH : 0
  const panelWidth = dashboardWidth(viewport)
  const dashboardOpen = activeModule !== null
  const profileOpen = activeEmployee !== null

  // Free area of the office: what remains once the rail, an open dashboard and
  // an open profile (desktop only) take their share. The camera frames the room
  // inside it.
  const insetLeft = rail + (split && dashboardOpen ? panelWidth : 0)
  const insetRight = split && profileOpen ? PROFILE_WIDTH + 32 : 0
  const officeCovered = dashboardOpen && !split

  return (
    <main
      className="relative h-dvh w-full overflow-hidden bg-background"
      style={{ ["--panel-w" as string]: `${panelWidth}px` }}
    >
      <OfficeView insetLeft={insetLeft} insetRight={insetRight} paused={officeCovered} />

      <HelpCenter insetLeft={insetLeft} insetRight={insetRight}>
        <TeamBar
          insetLeft={insetLeft}
          insetRight={insetRight}
          hidden={officeCovered}
          leading={<HelpFab variant="dock" />}
        >
          {!dashboardOpen && !profileOpen ? <HelpFab variant="floating" /> : null}
        </TeamBar>
      </HelpCenter>
      {!dashboardOpen && <MobileMenuButton />}

      <DashboardPanel />
      <EmployeePanel />
      <AppSidebar />
    </main>
  )
}
