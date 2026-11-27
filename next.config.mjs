/** @type {import('next').NextConfig} */
const supabaseHost = "https://scwhujwxpdijekzxmyco.supabase.co"

// Enforced CSP. Validated first in Report-Only mode (0 violations in an authenticated
// walkthrough). To roll back to log-only, rename the header key below to
// "Content-Security-Policy-Report-Only".
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://va.vercel-scripts.com" + (process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self' blob: ${supabaseHost} wss://scwhujwxpdijekzxmyco.supabase.co https://vitals.vercel-insights.com`,
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ")

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
]

const nextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }]
  },
}

export default nextConfig
