import { Archive, BarChart3, Building2, MessagesSquare, Settings, Trash2, UserRoundCheck, type LucideIcon } from "lucide-react"
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
    subtitle: "Chats de Valentina",
  },
  {
    id: "escalations",
    label: "Escalamientos",
    description: "Casos que necesitan a una persona",
    icon: UserRoundCheck,
    owner: "steven",
    subtitle: "Casos escalados a Renew",
  },
  {
    id: "metrics",
    label: "Métricas",
    description: "El rendimiento que analiza Carlos",
    icon: BarChart3,
    owner: "carlos",
    subtitle: "Cifras de la recepción",
  },
  { id: "archived", label: "Archivados", description: "Elementos guardados", icon: Archive, subtitle: "Chats y casos guardados" },
  { id: "trash", label: "Papelera", description: "Elementos eliminados", icon: Trash2, subtitle: "Pendientes de eliminar" },
]

export const SETTINGS_ITEM: NavItem = {
  id: "account",
  label: "Configuración",
  description: "Cuenta, equipo y apariencia",
  icon: Settings,
  subtitle: "Cuenta y apariencia",
}

export function navItem(id: ModuleId): NavItem {
  return id === "account" ? SETTINGS_ITEM : (NAV_ITEMS.find((n) => n.id === id) ?? NAV_ITEMS[0])
}
