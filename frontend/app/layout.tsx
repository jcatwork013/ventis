import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { ContactModalProvider } from "@/components/ContactModal";
import { SiteChrome } from "@/components/SiteChrome";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ventis.vn";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

// Self-hosted, preloaded fonts (no render-blocking Google stylesheet). The
// `vietnamese` subset is essential so diacritics render in the brand font
// instead of falling back. Exposed as CSS variables consumed by Tailwind.
// Two-font system, matching the brand reference:
//   - Barlow Condensed (`--font-serif`) → tall condensed display face for every
//     heading, the hero wordmark, eyebrow numerals and stat figures.
//   - Manrope (`--font-sans`) → a rounder, highly readable grotesque for all
//     body copy, labels and nav links.
const display = Barlow_Condensed({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

// Playfair Display — high-contrast serif reserved for the italic pull-quote,
// matching the brand reference (ventis.figma.site).
const quote = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--font-quote",
  display: "swap",
});

// Bump this whenever og-ventis.jpg changes — forces Facebook/Zalo/Twitter to
// re-scrape instead of serving their cached copy of the old image.
const OG_IMAGE = "/og-ventis.jpg?v=3";
const OG_IMAGE_ABS = `${SITE_URL}${OG_IMAGE}`;

const DESCRIPTION =
  "VENTIS GROUP — Tập đoàn đầu tư và phát triển đa ngành: đầu tư chiến lược, M&A, phát triển dự án bất động sản & nghỉ dưỡng, thương mại và dịch vụ. Kiến tạo những hệ sinh thái kinh doanh hiện đại, bền vững.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VENTIS GROUP — Building Strategic Ecosystems",
    template: "%s · VENTIS GROUP",
  },
  description: DESCRIPTION,
  applicationName: "VENTIS GROUP",
  keywords: [
    "VENTIS",
    "VENTIS GROUP",
    "tập đoàn đầu tư",
    "đầu tư chiến lược",
    "M&A",
    "phát triển dự án",
    "bất động sản nghỉ dưỡng",
    "thương mại và dịch vụ",
    "hệ sinh thái kinh doanh",
    "Building Strategic Ecosystems",
  ],
  authors: [{ name: "VENTIS GROUP", url: SITE_URL }],
  creator: "VENTIS GROUP",
  publisher: "VENTIS GROUP",
  category: "business",
  alternates: {
    canonical: "/",
    languages: { "vi-VN": "/" },
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "VENTIS GROUP",
    title: "VENTIS GROUP — Building Strategic Ecosystems",
    description: DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: OG_IMAGE,
        // Absolute https URL — Facebook/LinkedIn/Zalo prefer secure_url and a
        // declared MIME type, otherwise some scrapers skip the image entirely.
        secureUrl: OG_IMAGE_ABS,
        type: "image/jpeg",
        width: 1200,
        height: 630,
        alt: "VENTIS GROUP — Building Strategic Ecosystems",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VENTIS GROUP — Building Strategic Ecosystems",
    description: DESCRIPTION,
    images: [
      { url: OG_IMAGE, alt: "VENTIS GROUP — Building Strategic Ecosystems" },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/ventis-logo-lockup.png" }],
  },
  manifest: "/manifest.webmanifest",
};

// Brand-dark theme color + responsive viewport (mobile-friendliness is a
// ranking signal; Google indexes mobile-first).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0E0E10",
  colorScheme: "dark",
};

// Organization + WebSite structured data for rich Google indexing.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "VENTIS GROUP",
      alternateName: "Ventis",
      url: SITE_URL,
      logo: `${SITE_URL}/ventis-logo-lockup.png`,
      image: `${SITE_URL}${OG_IMAGE}`,
      description: DESCRIPTION,
      slogan: "Building Strategic Ecosystems",
      email: "info@ventis.vn",
      telephone: "+84919000005",
      address: {
        "@type": "PostalAddress",
        streetAddress: "65 Lê Lợi, Phường Sài Gòn",
        addressLocality: "TP. Hồ Chí Minh",
        addressCountry: "VN",
      },
      contactPoint: {
        "@type": "ContactPoint",
        telephone: "+84919000005",
        email: "info@ventis.vn",
        contactType: "customer service",
        areaServed: "VN",
        availableLanguage: ["Vietnamese", "English"],
      },
      knowsAbout: ["Đầu tư chiến lược", "M&A", "Phát triển dự án", "Thương mại", "Dịch vụ"],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "VENTIS GROUP",
      inLanguage: "vi-VN",
      description: DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${display.variable} ${sans.variable} ${quote.variable}`} style={{ ["--font-mono" as string]: "var(--font-sans)" }}>
      <head>
        {/* Warm up the API origin early so the first content fetch is faster. */}
        {API_URL && <link rel="preconnect" href={API_URL} crossOrigin="" />}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen">
        <SmoothScroll>
          <ContactModalProvider>
            <SiteChrome>{children}</SiteChrome>
          </ContactModalProvider>
        </SmoothScroll>
      </body>
    </html>
  );
}
