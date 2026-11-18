// Domain types for Renew IA.
// Read-only visualization layer. No mutations anywhere in the app.

/** Sections reachable from the App Sidebar. "office" means no dashboard is open. */
export type ModuleId = "office" | "conversations" | "escalations" | "metrics" | "account"

export type EmployeeId = "valentina" | "carlos" | "elena" | "steven"

/**
 * Presence of an employee. "attention" (terracotta) is reserved for when a
 * real signal says a person must step in; nothing sets it today.
 */
export type EmployeeStatus = "working" | "resting" | "attention"

export interface Employee {
  id: EmployeeId
  name: string
  /** Job title, e.g. "Recepcionista IA". */
  role: string
  /** Department the employee belongs to. */
  department: string
  /** One-line description shown under the name in the profile. */
  tagline: string
  /** Short paragraph presenting who the employee is. */
  summary: string
  /** Responsibilities listed in the profile. */
  duties: string[]
  /** Dashboard that is this employee's main tool, when there is one. */
  tool?: { module: Exclude<ModuleId, "office" | "account">; label: string }
  /** Static frame of the avatar shown in the profile. */
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
  // Presence state
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

/** A conversation handed off to a person. The digital reception is paused on it
 * until five minutes pass without messages from either side, then it resumes. */
export type EscalationStatus = "waiting-person" | "resumed"

export type EscalationTrigger = "explicit-request" | "complaint" | "failed-attempts"

export interface Escalation {
  id: string
  branchId: string
  branchName: string
  patientName: string
  phone: string
  /** One line: why a person is needed. */
  reason: string
  trigger: EscalationTrigger
  status: EscalationStatus
  /** Minutes since the handoff — drives the "hace 6 min" label and the ordering. */
  minutesAgo: number
  /** Clock time the team was notified by email. */
  noticeTime: string
  /** Clock time of the patient's last message. */
  lastMessageTime: string
  /** Clock time the digital reception took the conversation back (status "resumed"). */
  resumedTime?: string
  /** Two or three lines: what the patient asked and what was answered. */
  summary: string
}

export interface MetricPoint {
  label: string
  value: number
}

/**
 * Everything the MÉTRICAS dashboard can show. Every field is nullable or
 * empty: a missing value means "no data", never zero. The shape is independent
 * of any Renew internal database or program.
 */
export interface MetricsData {
  activity: {
    interactions: number | null
    queries: number | null
    conversations: number | null
    hourly: MetricPoint[]
  }
  attention: {
    avgResponseSeconds: number | null
    resolutionRate: number | null
  }
  performance: {
    attended: number | null
    escalations: number | null
    errors: number | null
  }
  queries: {
    categories: MetricPoint[]
    frequent: MetricPoint[]
    unresolved: number | null
  }
  branches: MetricPoint[]
  trends: {
    weekly: MetricPoint[]
    monthly: MetricPoint[]
  }
}
