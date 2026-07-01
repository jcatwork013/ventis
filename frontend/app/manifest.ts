import type { MetadataRoute } from "next";

// Web app manifest — improves mobile installability and is read by search
// engines for app metadata. Colors track the dark brand palette.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VENTIS GROUP — Building Strategic Ecosystems",
    short_name: "VENTIS",
    description:
      "VENTIS GROUP — Tập đoàn đầu tư và phát triển đa ngành: đầu tư chiến lược, M&A, phát triển dự án, thương mại và dịch vụ.",
    start_url: "/",
    display: "standalone",
    background_color: "#0E0E10",
    theme_color: "#0E0E10",
    lang: "vi-VN",
    categories: ["business", "finance"],
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any", purpose: "any" },
      { src: "/ventis-logo-lockup.png", type: "image/png", sizes: "512x512", purpose: "any" },
    ],
  };
}
