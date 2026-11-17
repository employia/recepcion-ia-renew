import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Recepción Digital",
    short_name: "Renew IA",
    start_url: "/",
    display: "standalone",
    background_color: "#f2efe9",
    theme_color: "#f2efe9",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/apple-icon.png", type: "image/png", sizes: "180x180" },
    ],
  }
}
