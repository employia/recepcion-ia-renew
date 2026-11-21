export type FaqCategory = "Apariencia" | "Navegación" | "Oficina IA" | "Métricas y alertas" | "Cuenta y soporte"

export interface FaqItem {
  id: string
  category: FaqCategory
  question: string
  answer: string
  /** Extra words people may type that do not appear in the question or answer. */
  keywords?: string[]
}

export const FAQ_CATEGORIES: FaqCategory[] = [
  "Apariencia",
  "Navegación",
  "Oficina IA",
  "Métricas y alertas",
  "Cuenta y soporte",
]

// Every answer describes what the app does today. When a feature is not built
// yet, the answer says so instead of presenting it as available.
export const FAQ_ITEMS: FaqItem[] = [
  {
    id: "cambiar-tema",
    category: "Apariencia",
    question: "¿Cómo cambiar el tema de la Recepción Digital?",
    answer:
      "En la Oficina, el botón con el sol o la luna, a la derecha del equipo en la barra inferior, alterna entre claro y oscuro. También puedes elegir en Configuración, dentro de Apariencia. Tu elección se guarda en este navegador.",
    keywords: ["apariencia", "modo", "color", "luna", "sol"],
  },
  {
    id: "claro-oscuro-predeterminado",
    category: "Apariencia",
    question: "¿Cuál es la diferencia entre Claro, Oscuro y Predeterminado?",
    answer:
      "Claro usa fondos blancos con acento verde azulado y Oscuro usa fondos de carbón cálido con acento terracota. Predeterminado sigue la apariencia de tu sistema operativo y cambia cuando el sistema cambia.",
    keywords: ["modo", "sistema", "operativo", "apariencia"],
  },
  {
    id: "recuperar-predeterminado",
    category: "Apariencia",
    question: "¿Cómo recuperar el tema predeterminado?",
    answer:
      "Abre Configuración, ve a Apariencia y elige Predeterminado para volver a seguir la apariencia del sistema. El botón rápido de la Oficina alterna entre Claro y Oscuro.",
    keywords: ["restablecer", "volver", "tema", "apariencia"],
  },
  {
    id: "navegar-modulos",
    category: "Navegación",
    question: "¿Cómo navegar entre los diferentes módulos?",
    answer:
      "Usa el menú lateral: Oficina, Conversaciones, Escalamientos, Métricas y Configuración. En tablet y escritorio es una barra de iconos que se expande con el botón de arriba. En el teléfono se abre con el botón de menú, en la esquina superior.",
    keywords: ["menu", "lateral", "secciones", "paneles", "ir"],
  },
  {
    id: "info-empleados",
    category: "Navegación",
    question: "¿Cómo acceder a la información de los empleados IA?",
    answer:
      "Toca a un empleado en la barra inferior de la Oficina o haz clic sobre su figura en la oficina 3D. Se abre su ficha con quién es y qué hace. Dentro de un módulo, el avatar de su encargado, arriba a la derecha, abre la misma ficha.",
    keywords: ["ficha", "perfil", "valentina", "carlos", "elena", "steven"],
  },
  {
    id: "volver-panel-principal",
    category: "Navegación",
    question: "¿Cómo regresar al panel principal?",
    answer:
      "Cierra el módulo con la X de su encabezado, elige Oficina en el menú o pulsa Escape. También sirve el botón Atrás del navegador o el gesto de retroceso del teléfono: te devuelve a la Oficina.",
    keywords: ["oficina", "inicio", "atras", "cerrar", "volver"],
  },
  {
    id: "empleados-funciones",
    category: "Oficina IA",
    question: "¿Qué hace cada empleado IA?",
    answer:
      "Valentina, la recepcionista, atiende las consultas que llegan por WhatsApp. Carlos analiza el rendimiento de la recepción digital. Elena gestiona la información corporativa que usa el equipo. Steven supervisa a los demás y gestiona los escalamientos.",
    keywords: ["valentina", "carlos", "elena", "steven", "roles", "equipo"],
  },
  {
    id: "supervision",
    category: "Oficina IA",
    question: "¿Cómo funciona la supervisión de los empleados?",
    answer:
      "Steven supervisa a los empleados IA y recibe los informes de Carlos. Los casos que necesitan a una persona aparecen en Escalamientos, con el motivo, la sucursal y un resumen. Por ahora esa lista muestra datos de demostración.",
    keywords: ["steven", "supervisor", "escalamientos", "casos"],
  },
  {
    id: "estado-actividad",
    category: "Oficina IA",
    question: "¿Qué significa el estado de actividad de un empleado?",
    answer:
      "Es el punto de color junto al avatar y en su ficha. Verde es Trabajando, gris es En pausa y ámbar es Requiere atención. Tampoco depende solo del color: la ficha escribe el estado.",
    keywords: ["punto", "color", "presencia", "verde", "ambar"],
  },
  {
    id: "donde-metricas",
    category: "Métricas y alertas",
    question: "¿Dónde puedo consultar las métricas?",
    answer:
      "En Métricas, desde el menú lateral, o con el botón Abrir Métricas en la ficha de Carlos. Si todavía no hay una fuente de datos conectada, el módulo lo avisa en lugar de mostrar cifras inventadas.",
    keywords: ["dashboard", "indicadores", "carlos", "estadisticas"],
  },
  {
    id: "interpretar-indicadores",
    category: "Métricas y alertas",
    question: "¿Cómo interpretar los indicadores de rendimiento?",
    answer:
      "Actividad cuenta interacciones, consultas y conversaciones, con su ritmo por hora. Atención muestra el tiempo promedio de respuesta y la tasa de resolución. Rendimiento suma las atendidas, las escalaciones y los errores. Un guion (—) significa que ese dato aún no está disponible.",
    keywords: ["kpi", "tiempo", "respuesta", "resolucion", "tendencias", "sucursales"],
  },
  {
    id: "alertas",
    category: "Métricas y alertas",
    question: "¿Dónde puedo consultar las alertas?",
    answer:
      "Todavía no hay un módulo de alertas independiente. Lo más cercano es Escalamientos: el número ámbar sobre su icono en el menú indica cuántos casos esperan a una persona. El estado Requiere atención de un empleado también avisa cuando hace falta intervenir.",
    keywords: ["avisos", "notificaciones", "escalamientos", "pendiente"],
  },
  {
    id: "soporte-sesion",
    category: "Cuenta y soporte",
    question: "¿Cómo contacto con soporte o cierro la sesión?",
    answer:
      "Ambas opciones están en Configuración: Soporte abre un correo hacia el equipo de la recepción digital, y Cerrar sesión termina tu sesión en este dispositivo.",
    keywords: ["ayuda", "contacto", "salir", "cuenta", "correo"],
  },
]
