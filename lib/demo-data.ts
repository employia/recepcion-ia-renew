// Demonstration data for the Conversaciones and Escalamientos dashboards.
// It exists only so those dashboards can be reviewed before a real source is
// connected; the interface labels it as such. MÉTRICAS does not use it: it
// never shows figures that do not come from a real source.

import { BRANCHES } from "./employees"
import type { Conversation, Escalation } from "./types"

export const ALL_BRANCHES_ID = "all"

const CONTACT_NAMES = [
  "María Rodríguez",
  "Juan Pérez",
  "Laura Gómez",
  "Carlos Martínez",
  "Ana Fernández",
  "Pedro Sánchez",
  "Lucía Ramírez",
  "Diego Torres",
  "Sofía Herrera",
  "Miguel Castillo",
  "Valeria Núñez",
  "Andrés Díaz",
]

// Only topics the reception handles today: information, locations, services,
// reviews and handoffs. No scheduling and no patient records.
const INTENTS = [
  "Horarios de atención",
  "Ubicación de la sucursal",
  "Información sobre un servicio",
  "Hablar con una persona",
  "Enlace de Google Maps",
  "Información sobre tratamientos",
]

function seeded(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return function next() {
    h = (h * 1103515245 + 12345) & 0x7fffffff
    return h / 0x7fffffff
  }
}

function pick<T>(arr: T[], r: number) {
  return arr[Math.floor(r * arr.length) % arr.length]
}

function timeString(hour: number, minute: number) {
  const period = hour >= 12 ? "PM" : "AM"
  const h12 = hour % 12 === 0 ? 12 : hour % 12
  return `${h12}:${minute.toString().padStart(2, "0")} ${period}`
}

export function getConversations(branchId: string): Conversation[] {
  const rand = seeded(branchId + "conv")
  const statuses: Conversation["status"][] = ["attending", "resolved", "waiting-human", "attending", "resolved"]
  const count = 6 + Math.floor(rand() * 4)
  return Array.from({ length: count }).map((_, i) => ({
    id: `${branchId}-conv-${i}`,
    branchId,
    patientName: pick(CONTACT_NAMES, rand()),
    messages: 4 + Math.floor(rand() * 18),
    status: pick(statuses, rand()),
    time: timeString(9 + Math.floor(rand() * 4), Math.floor(rand() * 60)),
    intent: pick(INTENTS, rand()),
  }))
}

export function getAllConversations(): Conversation[] {
  return BRANCHES.flatMap((b) => getConversations(b.id))
}

// Fixed (not random) so the demo tells a coherent story: two conversations are
// waiting for a person right now, four were resumed.
const ALL_ESCALATIONS: Escalation[] = [
  {
    id: "esc-1",
    branchId: "alma-rosa-1-principal",
    branchName: "Alma Rosa I Principal",
    patientName: "María Rodríguez",
    phone: "+1 809 555 0142",
    reason: "Pidió hablar con un encargado",
    trigger: "explicit-request",
    status: "waiting-person",
    minutesAgo: 6,
    noticeTime: "10:42 AM",
    lastMessageTime: "10:42 AM",
    summary:
      "Quería hablar de un tratamiento con una persona del equipo. Valentina le confirmó que ya se avisó a Renew.",
  },
  {
    id: "esc-2",
    branchId: "los-mameyes",
    branchName: "Los Mameyes",
    patientName: "Juan Pérez",
    phone: "+1 809 555 0187",
    reason: "Queja por demora en la atención",
    trigger: "complaint",
    status: "waiting-person",
    minutesAgo: 31,
    noticeTime: "10:17 AM",
    lastMessageTime: "10:20 AM",
    summary:
      "Esperó más de veinte minutos en su última visita y pidió una explicación. Valentina le pidió disculpas y avisó al equipo para que lo contacten.",
  },
  {
    id: "esc-3",
    branchId: "san-isidro",
    branchName: "San Isidro",
    patientName: "Laura Gómez",
    phone: "+1 809 555 0113",
    reason: "No se entendió su consulta",
    trigger: "failed-attempts",
    status: "resumed",
    minutesAgo: 130,
    noticeTime: "8:38 AM",
    lastMessageTime: "8:51 AM",
    resumedTime: "8:56 AM",
    summary:
      "Dos intentos seguidos sin dar con la información que buscaba. Una persona de la sucursal la atendió directamente.",
  },
  {
    id: "esc-4",
    branchId: "alma-rosa-1-ampliacion",
    branchName: "Alma Rosa I Ampliación",
    patientName: "Pedro Sánchez",
    phone: "+1 809 555 0164",
    reason: "Consulta sobre la cobertura de su seguro",
    trigger: "explicit-request",
    status: "resumed",
    minutesAgo: 185,
    noticeTime: "7:44 AM",
    lastMessageTime: "7:58 AM",
    resumedTime: "8:03 AM",
    summary:
      "Quería saber qué parte de sus sesiones cubre su plan. El equipo le respondió directamente y Valentina retomó la conversación.",
  },
  {
    id: "esc-5",
    branchId: "alma-rosa-1-principal",
    branchName: "Alma Rosa I Principal",
    patientName: "Ana Fernández",
    phone: "+1 809 555 0129",
    reason: "Desacuerdo con el precio de una sesión",
    trigger: "complaint",
    status: "resumed",
    minutesAgo: 260,
    noticeTime: "6:31 AM",
    lastMessageTime: "6:49 AM",
    resumedTime: "6:54 AM",
    summary:
      "Dijo que le informaron un precio distinto al cobrado. Una persona revisó el caso y se lo aclaró directamente.",
  },
  {
    id: "esc-6",
    branchId: "los-mameyes",
    branchName: "Los Mameyes",
    patientName: "Diego Torres",
    phone: "+1 809 555 0176",
    reason: "No se entendió lo que pedía",
    trigger: "failed-attempts",
    status: "resumed",
    minutesAgo: 340,
    noticeTime: "5:12 AM",
    lastMessageTime: "5:20 AM",
    resumedTime: "5:25 AM",
    summary:
      "Preguntaba por un servicio con un nombre poco habitual y Valentina no logró identificarlo. Una persona le respondió.",
  },
]

export function getEscalations(): Escalation[] {
  return [...ALL_ESCALATIONS].sort((a, b) => a.minutesAgo - b.minutesAgo)
}
