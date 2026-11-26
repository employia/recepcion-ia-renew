import { notFound } from "next/navigation"

// Diagnostic routes must never be reachable in production.
export default function DebugLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV === "production") notFound()
  return children
}
