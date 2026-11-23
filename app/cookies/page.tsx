import type { Metadata } from "next"
import { LegalDocument, type LegalSection } from "@/components/legal/legal-document"
import { LEGAL_CONTACT } from "@/lib/legal"

export const metadata: Metadata = {
  title: "Política de cookies",
  description: "Información sobre cookies y almacenamiento local en Recepción Digital de Renew.",
}

const sections: LegalSection[] = [
  {
    title: "Qué son las cookies",
    body: (
      <p>
        Las cookies son pequeños archivos que un sitio web puede guardar en el navegador para recordar información
        entre visitas. El navegador también ofrece otros espacios de almacenamiento local, como localStorage y
        sessionStorage, que cumplen funciones relacionadas pero no son cookies.
      </p>
    ),
  },
  {
    title: "Qué utiliza Recepción IA",
    body: (
      <>
        <p>
          En la implementación actual, Recepción IA no configura cookies propias de publicidad ni de seguimiento.
          Supabase Auth conserva en el almacenamiento local del navegador la sesión necesaria para mantener el acceso
          administrativo y renovarla. La aplicación también guarda localmente la preferencia de apariencia. No se
          almacena en estos espacios información de Renew ni registros de actividad.
        </p>
        <p>
          Los proveedores de infraestructura pueden tratar datos técnicos necesarios para prestar y proteger sus
          servicios, de acuerdo con sus propias políticas. La aplicación no usa esos datos para publicidad.
        </p>
      </>
    ),
  },
  {
    title: "Finalidad y duración",
    body: (
      <p>
        El almacenamiento de sesión permite autenticar al personal autorizado y mantener su sesión activa. La
        preferencia de apariencia recuerda la opción elegida en este navegador. La sesión se conserva hasta que se
        cierre, expire o se eliminen sus datos; la preferencia permanece hasta que se borre o se cambie.
      </p>
    ),
  },
  {
    title: "Cómo gestionarlos",
    body: (
      <>
        <p>
          Puede restringir o borrar cookies desde los controles de privacidad de su navegador. Si bloquea el
          almacenamiento local, algunas funciones —incluido el acceso administrativo— podrían dejar de funcionar.
          Desde Configuración también puede elegir «Eliminar cookies y datos locales»: la acción cierra la sesión y
          elimina los datos propios de Recepción IA guardados en este navegador, pero no elimina información de Renew,
          registros de actividad ni configuraciones del servidor.
        </p>
        <p>
          Si tiene preguntas sobre esta política, escriba a{" "}
          <a href={`mailto:${LEGAL_CONTACT}`} className="font-medium underline underline-offset-4">
            {LEGAL_CONTACT}
          </a>
          .
        </p>
      </>
    ),
  },
]

export default function CookiePolicyPage() {
  return (
    <LegalDocument
      title="Política de cookies"
      intro="Esta política explica cómo Recepción IA utiliza cookies y almacenamiento local en el navegador para prestar las funciones esenciales de la recepción digital."
      sections={sections}
    />
  )
}
