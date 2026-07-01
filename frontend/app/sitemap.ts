import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ventis.vn";

// Single-page site: the homepage is the only indexable URL. Section anchors are
// not separate documents, so they are intentionally omitted.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date("2026-06-02"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
