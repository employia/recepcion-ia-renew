"use client"

/** Returns to the previous page (the office or the acceptance screen) in the same tab. */
export function BackLink() {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    let sameOrigin = false
    try {
      sameOrigin = !!document.referrer && new URL(document.referrer).origin === window.location.origin
    } catch {}
    if (sameOrigin && window.history.length > 1) {
      e.preventDefault()
      window.history.back()
    }
  }

  return (
    <a
      href="/"
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground"
    >
      <span aria-hidden>←</span> Volver a la oficina
    </a>
  )
}
