import type { MouseEvent } from "react"

export const SUPPORT_EMAIL = "employiahq@gmail.com"
export const SUPPORT_SUBJECT = "Soporte de Recepción Digital · Renew"
export const SUPPORT_MAILTO = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(SUPPORT_SUBJECT)}`

/**
 * On a phone, mailto: opens the Gmail (or mail) app. On a computer it usually
 * does nothing when no mail program is set up, so there we open Gmail's
 * compose window on the web instead.
 */
export function openSupportEmail(e: MouseEvent<HTMLAnchorElement>) {
  const isPhone = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
  if (isPhone) return // let the mailto: link work
  e.preventDefault()
  const url =
    "https://mail.google.com/mail/?view=cm&fs=1" +
    `&to=${encodeURIComponent(SUPPORT_EMAIL)}&su=${encodeURIComponent(SUPPORT_SUBJECT)}`
  window.open(url, "_blank", "noopener,noreferrer") // new tab: the office stays open
}
