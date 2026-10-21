import type { Metadata } from "next"
import { LegalDocument, type LegalSection } from "@/components/legal/legal-document"
import { LEGAL_CONTACT } from "@/lib/legal"

export const metadata: Metadata = {
  title: "Política de Privacidad · Recepción Renew",
}

const sections: LegalSection[] = [
  {
    title: "Quién es responsable",
    body: (
      <p>
        EMPLOYIA (el «Proveedor») opera la plataforma «Recepción Digital» para Renew (el «Cliente»). Esta política
        explica qué datos se tratan al usar la Plataforma y para qué. Para cualquier consulta:{" "}
        <a href={`mailto:${LEGAL_CONTACT}`} className="font-medium underline underline-offset-4">
          {LEGAL_CONTACT}
        </a>
        .
      </p>
    ),
  },
  {
    title: "Qué datos tratamos",
    body: (
      <>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="font-semibold">Datos de la cuenta:</strong> correo electrónico, nombre y la
            información necesaria para iniciar y mantener la sesión.
          </li>
          <li>
            <strong className="font-semibold">Registro de aceptación:</strong> qué documentos legales aceptó, de qué
            versión y en qué fecha y hora.
          </li>
          <li>
            <strong className="font-semibold">Datos de la operación del Cliente:</strong> conversaciones, citas y
            datos de pacientes que el Usuario consulta en el panel. En la versión de demostración, los datos que se
            muestran son de ejemplo.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Para qué los usamos",
    body: (
      <ul className="list-disc space-y-1 pl-5">
        <li>permitir el acceso seguro de las personas autorizadas;</li>
        <li>mostrar la información de la recepción digital al personal del Cliente;</li>
        <li>dejar constancia de la aceptación de los documentos legales;</li>
        <li>mantener, proteger y mejorar la Plataforma y dar soporte.</li>
      </ul>
    ),
  },
  {
    title: "Cuánto tiempo los conservamos",
    body: (
      <p>
        Los datos de la cuenta se conservan mientras la cuenta esté activa. El registro de aceptación se conserva
        como constancia mientras exista la cuenta. Los datos de la operación se conservan según lo que acuerden el
        Proveedor y el Cliente y lo que exija la ley.
      </p>
    ),
  },
  {
    title: "Con quién los compartimos",
    body: (
      <>
        <p>
          No vendemos datos ni los usamos para publicidad. Para operar la Plataforma usamos proveedores de
          infraestructura que procesan datos por encargo nuestro, como el alojamiento web y el servicio de
          autenticación y base de datos.
        </p>
        <p>También podremos comunicar datos cuando una autoridad competente lo exija conforme a la ley.</p>
      </>
    ),
  },
  {
    title: "Seguridad",
    body: (
      <p>
        Aplicamos medidas razonables para proteger los datos: acceso solo con credenciales autorizadas, conexiones
        cifradas y reglas de acceso en la base de datos para que cada persona vea únicamente lo que le corresponde.
        Ningún sistema es infalible; si detectamos un incidente que afecte sus datos, actuaremos y lo comunicaremos
        según corresponda.
      </p>
    ),
  },
  {
    title: "Sesión y almacenamiento en el navegador",
    body: (
      <p>
        La Plataforma guarda en su navegador la información mínima para mantener su sesión iniciada. No usa cookies
        de publicidad ni de seguimiento de terceros con fines comerciales.
      </p>
    ),
  },
  {
    title: "Sus derechos",
    body: (
      <p>
        Conforme a la normativa dominicana de protección de datos personales, incluida la Ley núm. 172-13, usted
        puede solicitar acceder a sus datos, rectificarlos, actualizarlos o pedir su supresión, así como oponerse a
        su tratamiento en los casos que la ley permita. Escriba a{" "}
        <a href={`mailto:${LEGAL_CONTACT}`} className="font-medium underline underline-offset-4">
          {LEGAL_CONTACT}
        </a>{" "}
        indicando su solicitud.
      </p>
    ),
  },
  {
    title: "Cambios a esta política",
    body: (
      <p>
        Podemos actualizar esta política. Cuando haya una versión nueva, se pedirá aceptarla de nuevo antes de
        entrar. La fecha de la última actualización aparece al inicio de este documento.
      </p>
    ),
  },
]

export default function PrivacidadPage() {
  return (
    <LegalDocument
      title="Política de Privacidad"
      intro="Esta política explica, en términos sencillos, qué datos se tratan en la Recepción Digital, para qué se usan y cuáles son sus derechos."
      sections={sections}
    />
  )
}
