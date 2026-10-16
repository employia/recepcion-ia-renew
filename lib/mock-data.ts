import type {
  Appointment,
  Branch,
  BranchMetrics,
  Conversation,
  Employee,
  Patient,
} from "./types"

export const BRANCHES: Branch[] = [
  { id: "alma-rosa-1-principal", name: "Alma Rosa I Principal", label: "Renew · Alma Rosa I Principal" },
  { id: "alma-rosa-1-ampliacion", name: "Alma Rosa I Ampliación", label: "Renew · Alma Rosa I Ampliación" },
  { id: "los-mameyes", name: "Los Mameyes", label: "Renew · Los Mameyes" },
  { id: "san-isidro", name: "San Isidro", label: "Renew · San Isidro" },
]

// Synthetic option that aggregates every branch into a single combined view.
export const ALL_BRANCHES_ID = "all"
export const ALL_BRANCHES_BRANCH: Branch = {
  id: ALL_BRANCHES_ID,
  name: "Todas las sucursales",
  label: "Renew · Todas las sucursales",
}

// Office layout: a tidy 2x2 grid, every employee facing the open side of the
// room (toward the isometric camera) so faces are always visible — the classic
// 2.5D look. Reading order is left→right, back→front:
//   Valentina  Carlos
//   Elena      Steven
// To move someone, change only `station` [x, z]; `rotation` is the Y angle in
// radians (0 = facing the camera side).
export const EMPLOYEES: Employee[] = [
  {
    id: "valentina",
    name: "Valentina",
    role: "Recepción",
    tagline: "La primera voz de Renew",
    summary:
      "Recibe a cada paciente apenas escribe. Responde con calidez, entiende qué necesita y lo encamina con el compañero indicado, a cualquier hora del día.",
    duties: [
      "Atiende los mensajes de WhatsApp de los pacientes",
      "Informa sobre servicios, horarios y sucursales",
      "Identifica la necesidad y la dirige al área correcta",
      "Pasa el caso a una persona del equipo cuando hace falta",
    ],
    portrait: "/avatars/valentina.webp",
    portraitFace: [0.59, 0.15],
    station: [-2.4, -1.8],
    rotation: 0,
    accent: "#33969b", // oklch(0.62 0.09 200)
    model: "/models/valentina-empleada.glb",
    status: "working",
  },
  {
    id: "carlos",
    name: "Carlos",
    role: "Agenda",
    tagline: "El que mantiene las citas en orden",
    summary:
      "Se encarga de todo lo relacionado con las citas: revisa la disponibilidad real de cada sucursal y deja cada reserva confirmada sin cruces ni confusiones.",
    duties: [
      "Consulta la disponibilidad por servicio y sucursal",
      "Agenda nuevas citas",
      "Reprograma y cancela cuando el paciente lo pide",
      "Confirma los detalles de cada cita al paciente",
    ],
    portrait: "/avatars/carlos.webp",
    portraitFace: [0.63, 0.13],
    station: [2.4, -1.8],
    rotation: 0,
    accent: "#519160", // oklch(0.6 0.1 150)
    model: "/models/carlos-empleado.glb",
    status: "working",
  },
  {
    id: "elena",
    name: "Elena",
    role: "Secretaría · Datos",
    tagline: "La memoria de cada paciente",
    summary:
      "Mantiene ordenada la información de los pacientes para que nadie tenga que repetir sus datos. Cada conversación y cada cita queda asociada a la persona correcta.",
    duties: [
      "Registra y actualiza los datos del paciente",
      "Identifica al paciente por su cédula",
      "Relaciona cada conversación y cada cita con su historial",
      "Mantiene la información lista para el equipo de Renew",
    ],
    portrait: "/avatars/elena.webp",
    portraitFace: [0.62, 0.17],
    station: [-2.4, 2.4],
    rotation: 0,
    accent: "#9d6f48", // oklch(0.58 0.08 60)
    model: "/models/elena-empleada.glb",
    status: "working",
  },
  {
    id: "steven",
    name: "Steven",
    role: "Supervisión",
    tagline: "El que vela para que nada se quede sin atender",
    summary:
      "Supervisa la atención del equipo y se asegura de que los casos que requieren criterio humano lleguen a la persona correcta de Renew.",
    duties: [
      "Supervisa la calidad de las conversaciones",
      "Detecta los casos que necesitan a una persona",
      "Avisa al equipo de Renew con el contexto del caso",
    ],
    portrait: "/avatars/steven.webp",
    portraitFace: [0.6, 0.13],
    station: [2.4, 2.4],
    rotation: 0,
    accent: "#bd6254", // oklch(0.6 0.12 30)
    model: "/models/steven-empleado.glb",
    status: "working",
  },
]

// --- Deterministic mock generators keyed per branch ---------------------------

const PATIENT_NAMES = [
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
  "Camila Reyes",
  "José Peña",
  "Isabella Cruz",
]

const SERVICES = [
  "Fisioterapia",
  "Rehabilitación",
  "Masaje terapéutico",
  "Evaluación postural",
  "Terapia deportiva",
  "Punción seca",
]

const INTENTS = [
  "Agendar cita",
  "Información sobre servicio",
  "Hablar con una persona",
  "Reprogramar cita",
  "Consultar horario",
  "Precios y cobertura",
]

function seeded(branchId: string) {
  let h = 0
  for (let i = 0; i < branchId.length; i++) h = (h * 31 + branchId.charCodeAt(i)) >>> 0
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
  const statuses: Conversation["status"][] = [
    "attending",
    "resolved",
    "waiting-human",
    "attending",
    "resolved",
  ]
  const count = 6 + Math.floor(rand() * 4)
  return Array.from({ length: count }).map((_, i) => {
    const hour = 9 + Math.floor(rand() * 4)
    const minute = Math.floor(rand() * 60)
    return {
      id: `${branchId}-conv-${i}`,
      branchId,
      patientName: pick(PATIENT_NAMES, rand()),
      messages: 4 + Math.floor(rand() * 18),
      status: pick(statuses, rand()),
      time: timeString(hour, minute),
      intent: pick(INTENTS, rand()),
    }
  })
}

export function getAppointments(branchId: string): Appointment[] {
  const rand = seeded(branchId + "appt")
  const branch = BRANCHES.find((b) => b.id === branchId)!
  const days = ["29 agosto", "30 agosto", "31 agosto", "1 septiembre", "2 septiembre"]
  const count = 7 + Math.floor(rand() * 4)
  return Array.from({ length: count }).map((_, i) => {
    const hour = 8 + Math.floor(rand() * 9)
    const minute = pick([0, 15, 30, 45], rand())
    return {
      id: `${branchId}-appt-${i}`,
      branchId,
      patientName: pick(PATIENT_NAMES, rand()),
      branchLabel: branch.name,
      service: pick(SERVICES, rand()),
      date: pick(days, rand()),
      time: timeString(hour, minute as number),
    }
  })
}

export function getPatients(branchId: string): Patient[] {
  const rand = seeded(branchId + "pat")
  return PATIENT_NAMES.map((name, i) => ({
    id: `${branchId}-pat-${i}`,
    branchId,
    name,
    appointments: 1 + Math.floor(rand() * 12),
    conversations: 2 + Math.floor(rand() * 20),
    lastInteraction: pick(["Hoy · 10:42 AM", "Hoy · 9:15 AM", "Ayer · 4:30 PM", "Ayer · 11:20 AM"], rand()),
    service: pick(SERVICES, rand()),
    phone: `+1 809 ${100 + Math.floor(rand() * 899)} ${1000 + Math.floor(rand() * 8999)}`,
  }))
}

export function getMetrics(branchId: string): BranchMetrics {
  const rand = seeded(branchId + "met")
  const hours = ["8", "9", "10", "11", "12", "13", "14", "15", "16", "17"]
  const opTrend = hours.map((label) => ({ label, value: 4 + Math.floor(rand() * 22) }))
  const agendaTrend = ["L", "M", "M", "J", "V", "S"].map((label) => ({
    label,
    value: 3 + Math.floor(rand() * 14),
  }))
  const topServices = SERVICES.slice(0, 5)
    .map((label) => ({ label, value: 8 + Math.floor(rand() * 40) }))
    .sort((a, b) => b.value - a.value)

  const conversationsAttended = opTrend.reduce((s, p) => s + p.value, 0)
  return {
    operation: {
      conversationsAttended,
      messagesProcessed: conversationsAttended * (6 + Math.floor(rand() * 6)),
      avgResponseSeconds: 8 + Math.floor(rand() * 20),
      conversationsResolved: Math.floor(conversationsAttended * (0.6 + rand() * 0.25)),
      trend: opTrend,
    },
    agenda: {
      created: agendaTrend.reduce((s, p) => s + p.value, 0),
      canceled: 2 + Math.floor(rand() * 8),
      rescheduled: 1 + Math.floor(rand() * 6),
      noShows: 1 + Math.floor(rand() * 5),
      trend: agendaTrend,
    },
    business: {
      conversionRate: 0.32 + rand() * 0.28,
      newClients: 6 + Math.floor(rand() * 20),
      topServices,
    },
  }
}
