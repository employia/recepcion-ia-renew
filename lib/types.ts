// Domain types for Recepción Digital · Renew
// Read-only visualization layer. No mutations anywhere in the app.

export type ModuleId =
  | "office"
  | "conversations"
  | "agenda"
  | "patients"
  | "metrics"
  | "account"

export type EmployeeId = "valentina" | "carlos" | "elena" | "steven"

// Simulated presence state for each employee.
export type EmployeeStatus = "working" | "resting"

export interface Employee {
  id: EmployeeId
  name: string
  role: string
  /** One-line description shown under the name in the presentation panel. */
  tagline: string
  /** Short paragraph presenting who the employee is. */
  summary: string
  /** "What they do" bullets in the presentation panel. */
  duties: string[]
  /** Static frame of the avatar shown in the presentation panel. */
  portrait: string
  /** Where the face sits in the portrait, as [x, y] fractions — used to crop round thumbnails. */
  portraitFace: [number, number]
  // Position of the workstation in the 3D office (x, z on the floor plane)
  station: [number, number]
  // Rotation of the person/desk in radians around Y
  rotation: number
  accent: string
  // URL of the fused GLB model (person + chair + desk as one piece)
  model: string
  // Simulated presence state
  status: EmployeeStatus
}

export interface Branch {
  id: string
  name: string
  label: string
}

export type ConversationStatus =
  | "attending" // Valentina atendiendo
  | "resolved" // Conversación resuelta
  | "waiting-human" // Esperando humano

export interface Conversation {
  id: string
  branchId: string
  patientName: string
  messages: number
  status: ConversationStatus
  time: string
  intent: string
}

export interface Appointment {
  id: string
  branchId: string
  patientName: string
  branchLabel: string
  service: string
  date: string
  time: string
}

export interface Patient {
  id: string
  branchId: string
  name: string
  appointments: number
  conversations: number
  lastInteraction: string
  service: string
  phone: string
}

export interface MetricPoint {
  label: string
  value: number
}

export interface BranchMetrics {
  operation: {
    conversationsAttended: number
    messagesProcessed: number
    avgResponseSeconds: number
    conversationsResolved: number
    trend: MetricPoint[]
  }
  agenda: {
    created: number
    canceled: number
    rescheduled: number
    noShows: number
    trend: MetricPoint[]
  }
  business: {
    conversionRate: number
    newClients: number
    topServices: MetricPoint[]
  }
}
