import { BarChart3, Building2, MessagesSquare, Settings, UserRoundCheck, type LucideIcon } from "lucide-react"
import type { EmployeeId, ModuleId } from "./types"

export interface NavItem {
  id: ModuleId
  label: string
  description: string
  icon: LucideIcon
  /** Employee whose work this section shows. */
  owner?: EmployeeId
  /** Shown under the title of the section when it is open. */
  subtitle: string
}

export const NAV_ITEMS: NavItem[] = [
  { id: "office", label: "Oficina", description: "Vista general del equipo", icon: Building2, subtitle: "" },
  {
    id: "conversations",
    label: "Conversaciones",
    description: "Lo que Valentina atiende",
    icon: MessagesSquare,
    owner: "valentina",
    subtitle: "Atendidas por Valentina · Datos de demostración",
  },
  {
    id: "escalations",
    label: "Escalamientos",
    description: "Casos que necesitan a una persona",
    icon: UserRoundCheck,
    owner: "steven",
    subtitle: "Gestionados por Steven · Datos de demostración",
  },
  {
    id: "metrics",
    label: "Métricas",
    description: "El rendimiento que analiza Carlos",
    icon: BarChart3,
    owner: "carlos",
    subtitle: "Analizadas por Carlos",
  },
]

export const SETTINGS_ITEM: NavItem = {
  id: "account",
  label: "Configuración",
  description: "Cuenta, equipo y apariencia",
  icon: Settings,
  subtitle: "Cuenta, equipo y apariencia",
}

export function navItem(id: ModuleId): NavItem {
  return id === "account" ? SETTINGS_ITEM : (NAV_ITEMS.find((n) => n.id === id) ?? NAV_ITEMS[0])
}
