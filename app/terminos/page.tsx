import type { Metadata } from "next"
import { LegalDocument, type LegalSection } from "@/components/legal/legal-document"
import { LEGAL_CONTACT } from "@/lib/legal"

export const metadata: Metadata = {
  title: "Términos y Condiciones de Uso · Recepción Digital Renew",
}

const sections: LegalSection[] = [
  {
    title: "Quién ofrece el servicio",
    body: (
      <p>
        La plataforma «Recepción Digital» (la «Plataforma») es ofrecida por EMPLOYIA (el «Proveedor») a Renew (el
        «Cliente») para uso de su personal autorizado (el «Usuario»). Al entrar a la Plataforma, el Usuario declara
        que ha leído estos Términos y que los acepta.
      </p>
    ),
  },
  {
    title: "Qué es la Plataforma",
    body: (
      <p>
        Es un panel de supervisión de la recepción digital del Cliente. Permite ver las conversaciones atendidas por
        los asistentes digitales, las citas, los datos de pacientes, los casos que requieren a una persona y las
        métricas de rendimiento. Sus funciones pueden cambiar a medida que el servicio evoluciona.
      </p>
    ),
  },
  {
    title: "Acceso y cuentas",
    body: (
      <>
        <p>
          El acceso es únicamente mediante credenciales (correo y contraseña) autorizadas por el Proveedor. No existe
          registro público.
        </p>
        <p>
          Las credenciales son personales e intransferibles. El Usuario debe custodiarlas, no compartirlas y avisar
          de inmediato al Proveedor si sospecha que alguien más las conoce. Toda actividad realizada con sus
          credenciales se considera realizada por él. El Proveedor puede suspender o cerrar cualquier cuenta que se
          use de forma indebida o que ya no deba tener acceso.
        </p>
      </>
    ),
  },
  {
    title: "Uso permitido",
    body: (
      <>
        <p>El Usuario se compromete a usar la Plataforma solo para las tareas de su trabajo en el Cliente, y a no:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>consultar información de pacientes que no necesite para su función;</li>
          <li>copiar, extraer o difundir datos de forma masiva o fuera de los fines del Cliente;</li>
          <li>intentar vulnerar la seguridad de la Plataforma o acceder a cuentas o datos de otras personas;</li>
          <li>hacer ingeniería inversa, copiar o revender la Plataforma;</li>
          <li>usarla para fines ilícitos o contrarios a estos Términos.</li>
        </ul>
      </>
    ),
  },
  {
    title: "Confidencialidad de la información",
    body: (
      <p>
        La información de pacientes y de la operación del Cliente a la que el Usuario accede a través de la
        Plataforma es confidencial. El Usuario debe tratarla con reserva, usarla solo para su función y mantener
        este deber de secreto aun cuando termine su relación con el Cliente.
      </p>
    ),
  },
  {
    title: "Asistentes digitales y sus límites",
    body: (
      <>
        <p>
          La atención que se muestra en la Plataforma la realizan asistentes digitales. Sus respuestas son
          automatizadas y pueden contener errores u omisiones.
        </p>
        <p>
          La Plataforma no ofrece diagnósticos ni consejo médico. Las decisiones clínicas y administrativas siguen
          siendo responsabilidad de las personas del Cliente, que deben revisar la información cuando sea necesario.
        </p>
      </>
    ),
  },
  {
    title: "Propiedad intelectual",
    body: (
      <p>
        La Plataforma, su diseño, su código y sus asistentes pertenecen al Proveedor. El Cliente conserva la
        titularidad de sus datos y de su marca. Estos Términos no transfieren al Usuario ningún derecho sobre la
        Plataforma más allá del uso autorizado aquí descrito.
      </p>
    ),
  },
  {
    title: "Disponibilidad y versión de demostración",
    body: (
      <p>
        El Proveedor procura que la Plataforma esté disponible, pero no garantiza un servicio ininterrumpido ni libre
        de errores, y puede realizar mantenimientos o cambios sin previo aviso. La versión actual es una
        demostración: puede mostrar datos de ejemplo y sus funciones pueden modificarse o retirarse.
      </p>
    ),
  },
  {
    title: "Limitación de responsabilidad",
    body: (
      <p>
        En la medida permitida por la ley, el Proveedor no responde por daños indirectos ni por decisiones tomadas
        con base únicamente en la información mostrada por la Plataforma, ni por interrupciones fuera de su control
        razonable. Esto no limita responsabilidades que la ley no permita limitar.
      </p>
    ),
  },
  {
    title: "Cambios a estos Términos",
    body: (
      <p>
        El Proveedor puede actualizar estos Términos. Cuando haya una versión nueva, se pedirá al Usuario que la
        acepte de nuevo para seguir entrando. Mientras la versión no cambie, no se solicitará una nueva aceptación en
        cada inicio de sesión.
      </p>
    ),
  },
  {
    title: "Ley aplicable y contacto",
    body: (
      <p>
        Estos Términos se rigen por las leyes de la República Dominicana. Para cualquier consulta, escriba a{" "}
        <a href={`mailto:${LEGAL_CONTACT}`} className="font-medium underline underline-offset-4">
          {LEGAL_CONTACT}
        </a>
        .
      </p>
    ),
  },
]

export default function TerminosPage() {
  return (
    <LegalDocument
      title="Términos y Condiciones de Uso"
      intro="Estas reglas explican cómo se puede usar la Recepción Digital. Léalas con calma: para entrar a la oficina es necesario aceptarlas."
      sections={sections}
    />
  )
}
