import type { Branch, Employee } from "./types"

export const BRANCHES: Branch[] = [
  { id: "alma-rosa-1-principal", name: "Alma Rosa I Principal", label: "Renew · Alma Rosa I Principal" },
  { id: "alma-rosa-1-ampliacion", name: "Alma Rosa I Ampliación", label: "Renew · Alma Rosa I Ampliación" },
  { id: "los-mameyes", name: "Los Mameyes", label: "Renew · Los Mameyes" },
  { id: "san-isidro", name: "San Isidro", label: "Renew · San Isidro" },
]

// Office layout: a tidy 2x2 grid, every employee facing the open side of the
// room (toward the isometric camera) so faces are always visible. Reading
// order is left→right, back→front:
//   Valentina  Carlos
//   Elena      Steven
// To move someone, change only `station` [x, z]; `rotation` is the Y angle in
// radians (0 = facing the camera side).
export const EMPLOYEES: Employee[] = [
  {
    id: "valentina",
    name: "Valentina",
    role: "Recepcionista IA",
    department: "Recepción y Atención al Cliente",
    tagline: "La primera voz de Renew",
    summary:
      "Recibe a cada persona apenas escribe por WhatsApp. Responde con calidez, resuelve lo que puede y avisa al equipo cuando hace falta una persona.",
    duties: [
      "Atiende las consultas que llegan por WhatsApp",
      "Proporciona información sobre Renew",
      "Consulta a Elena para obtener información corporativa",
      "Informa sobre horarios, sucursales, servicios y tratamientos",
      "Solicita reseñas honestas mediante una comunicación neutral",
      "Facilita el enlace de Google Maps de Renew",
      "Identifica las consultas que requieren intervención humana",
      "Escala la conversación cuando es necesario",
    ],
    tool: { module: "conversations", label: "Ver conversaciones" },
    portrait: "/avatars/valentina.webp",
    portraitFace: [0.59, 0.15],
    station: [-2.4, -1.8],
    rotation: 0,
    accent: "#2e8b7d",
    model: "/models/valentina-empleada.glb",
    status: "working",
  },
  {
    id: "carlos",
    name: "Carlos",
    role: "Analista de Rendimiento",
    department: "Análisis y Rendimiento Operativo",
    tagline: "Convierte la actividad en decisiones",
    summary:
      "Estudia cómo trabaja la recepción digital: cuánto se atiende, qué tan rápido y dónde falla. Su herramienta principal es el dashboard de Métricas.",
    duties: [
      "Analiza el volumen de interacciones",
      "Evalúa los tiempos de respuesta",
      "Analiza las consultas atendidas y los escalamientos",
      "Identifica errores y deficiencias",
      "Detecta patrones y tendencias",
      "Compara el rendimiento entre sucursales",
      "Genera informes y recomienda mejoras",
      "Informa a Steven sobre anomalías",
    ],
    tool: { module: "metrics", label: "Abrir Métricas" },
    portrait: "/avatars/carlos.webp",
    portraitFace: [0.63, 0.13],
    station: [2.4, -1.8],
    rotation: 0,
    accent: "#2e8b7d",
    model: "/models/carlos-empleado.glb",
    status: "working",
  },
  {
    id: "elena",
    name: "Elena",
    role: "Gestora de Información Empresarial",
    department: "Información y Conocimiento Corporativo",
    tagline: "El conocimiento verificado de Renew",
    summary:
      "Es la fuente de información corporativa del equipo, sobre todo de Valentina. Su trabajo es que lo que se comunica sea correcto y esté al día. No gestiona datos de pacientes.",
    duties: [
      "Proporciona los horarios de atención",
      "Facilita direcciones y ubicaciones",
      "Proporciona información sobre servicios y tratamientos",
      "Consulta políticas y procedimientos empresariales",
      "Proporciona información corporativa",
      "Verifica que la información esté actualizada",
    ],
    portrait: "/avatars/elena.webp",
    portraitFace: [0.62, 0.17],
    station: [-2.4, 2.4],
    rotation: 0,
    accent: "#c4693d",
    model: "/models/elena-empleada.glb",
    status: "working",
  },
  {
    id: "steven",
    name: "Steven",
    role: "Supervisor IA",
    department: "Supervisión de la Oficina IA",
    tagline: "Vela para que nada se quede sin atender",
    summary:
      "Supervisa a los demás empleados IA y se asegura de que los casos que requieren criterio humano lleguen a la persona correcta de Renew.",
    duties: [
      "Supervisa a los empleados IA",
      "Gestiona los escalamientos",
      "Recibe los informes de Carlos",
      "Supervisa los problemas operativos",
      "Coordina las acciones necesarias para mantener el funcionamiento de la Oficina IA",
    ],
    tool: { module: "escalations", label: "Ver escalamientos" },
    portrait: "/avatars/steven.webp",
    portraitFace: [0.6, 0.13],
    station: [2.4, 2.4],
    rotation: 0,
    accent: "#c4693d",
    model: "/models/steven-empleado.glb",
    status: "working",
  },
]
