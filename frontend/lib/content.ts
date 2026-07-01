// Editable site content (the CMS document). Fetched from the API at request
// time; falls back to DEFAULT_CONTENT so the page always renders.

export type Stat = { value: string; label: string };
export type ValueItem = { n: string; title: string; caption: string; icon: string };
export type SectorItem = { n: string; title: string; body: string };
export type ProjectItem = { image: string; eyebrow: string; title: string; location: string };

export type SiteContent = {
  hero: {
    titleTop: string;
    titleBottom: string;
    keywords: string[];
    tagline: string;
    intro: string;
    image: string;
    ctaGhost: string;
    ctaPrimary: string;
  };
  about: {
    eyebrow: string;
    heading: string;
    quote: string;
    quoteAuthor: string;
    body1: string;
    body2: string;
    stats: Stat[];
  };
  values: { eyebrow: string; items: ValueItem[] };
  sectors: { eyebrow: string; heading: string; items: SectorItem[] };
  projects: { eyebrow: string; heading: string; items: ProjectItem[] };
  partners: { eyebrow: string; heading: string; body: string; items: string[] };
  contact: {
    eyebrow: string;
    heading: string;
    body: string;
    email: string;
    hotline: string;
    website: string;
    address: string;
  };
  footer: { copyright: string };
};

export const DEFAULT_CONTENT: SiteContent = {
  hero: {
    titleTop: "VENTIS",
    titleBottom: "GROUP",
    keywords: ["Vision", "Expansion", "Transformation", "Innovation", "Sustainable"],
    tagline: "Building Strategic Ecosystems",
    intro:
      "Tập đoàn đầu tư và phát triển đa ngành, tập trung vào đầu tư chiến lược, phát triển dự án, thương mại và dịch vụ — kiến tạo giá trị dài hạn cho đối tác, khách hàng và cộng đồng.",
    image: "/hero-ventis.jpg",
    ctaGhost: "Khám phá Ventis",
    ctaPrimary: "Hợp tác cùng chúng tôi",
  },
  about: {
    eyebrow: "Về Ventis",
    heading: "Nền tảng kết nối đầu tư, phát triển và vận hành.",
    quote:
      "Kiến tạo những hệ sinh thái kinh doanh hiện đại — bền vững theo thời gian, vững vàng qua mỗi chu kỳ.",
    quoteAuthor: "VENTIS GROUP · Định hướng phát triển",
    body1:
      "VENTIS GROUP được thành lập với định hướng trở thành nền tảng kết nối đầu tư, phát triển dự án và vận hành dịch vụ — góp phần xây dựng các mô hình kinh doanh hiện đại, hiệu quả và bền vững.",
    body2:
      "Chúng tôi tập trung vào các cơ hội có tiềm năng tăng trưởng dài hạn, đồng hành cùng đối tác trong việc phát triển doanh nghiệp, dự án và hệ sinh thái kinh doanh.",
    stats: [
      { value: "04", label: "Lĩnh vực chiến lược" },
      { value: "03+", label: "Dự án trọng điểm" },
      { value: "20+", label: "Năm kinh nghiệm đội ngũ" },
      { value: "100%", label: "Cam kết bền vững" },
    ],
  },
  values: {
    eyebrow: "Giá trị cốt lõi",
    items: [
      { n: "01", title: "Vision", caption: "Tầm nhìn dài hạn", icon: "vision" },
      { n: "02", title: "Expansion", caption: "Mở rộng và phát triển", icon: "expansion" },
      { n: "03", title: "Innovation", caption: "Sáng tạo và đổi mới", icon: "innovation" },
      { n: "04", title: "Sustainable", caption: "Phát triển bền vững", icon: "leaf" },
    ],
  },
  sectors: {
    eyebrow: "Lĩnh vực hoạt động",
    heading: "Bốn trụ cột định hình hệ sinh thái Ventis.",
    items: [
      { n: "01", title: "Investment", body: "Đầu tư chiến lược, M&A doanh nghiệp và phát triển các cơ hội tăng trưởng dài hạn." },
      { n: "02", title: "Development", body: "Phát triển dự án bất động sản, nghỉ dưỡng, du lịch và các mô hình kinh doanh mới." },
      { n: "03", title: "Trading", body: "Thương mại, phân phối và kết nối chuỗi giá trị sản phẩm và dịch vụ." },
      { n: "04", title: "Services", body: "Quản lý vận hành, tư vấn và cung cấp các giải pháp dịch vụ chuyên nghiệp." },
    ],
  },
  projects: {
    eyebrow: "Dự án & Cơ hội",
    heading: "Những hành trình đang được Ventis kiến tạo.",
    items: [
      { image: "/project-phuquoc.jpg", eyebrow: "Resort nghỉ dưỡng cao cấp", title: "An Yến Resort", location: "Phú Quốc" },
      { image: "/project-cantho.jpg", eyebrow: "Trải nghiệm thiên nhiên sông nước", title: "Glamping", location: "Cần Thơ" },
      { image: "/project-camau.jpg", eyebrow: "Du lịch sinh thái bền vững", title: "Eco Resort", location: "Đất Mũi — Cà Mau" },
    ],
  },
  partners: {
    eyebrow: "Đồng hành cùng đối tác",
    heading: "Hợp tác bền vững — giá trị lớn hơn cho mọi bên.",
    body: "VENTIS luôn tìm kiếm và mở rộng quan hệ hợp tác với những đối tác cùng tầm nhìn dài hạn.",
    items: [
      "Chủ đầu tư dự án",
      "Doanh nghiệp cần M&A",
      "Đối tác chiến lược",
      "Nhà cung cấp sản phẩm & dịch vụ",
      "Đơn vị phát triển bất động sản",
      "Doanh nghiệp công nghệ",
    ],
  },
  contact: {
    eyebrow: "Liên hệ",
    heading: "Cùng kiến tạo giá trị dài hạn.",
    body: "Trao đổi với đội ngũ Ventis về cơ hội đầu tư, hợp tác phát triển dự án hoặc các giải pháp dịch vụ phù hợp.",
    email: "info@ventis.vn",
    hotline: "(+84) 919 000 005",
    website: "www.ventis.vn",
    address: "65 Lê Lợi, Phường Sài Gòn, TP.HCM",
  },
  footer: { copyright: "© 2026 VENTIS GROUP · Building Strategic Ecosystems" },
};

/**
 * Keep an em/en dash bound to the word before it so a line never *starts* with
 * a dash. Replaces " — " with "<nbsp>— " (break still allowed after the dash).
 */
export function tidy(s: string): string {
  const nbsp = String.fromCharCode(0xa0);
  return s.replace(/ ([—–]) /g, `${nbsp}$1 `);
}

const BASE_URL =
  (typeof window === "undefined"
    ? process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL
    : process.env.NEXT_PUBLIC_API_URL) ?? "http://localhost:8080";

/** Shallow-merge a section so partial admin edits keep their defaults. */
function mergeSection<T>(def: T, got: unknown): T {
  if (!got || typeof got !== "object") return def;
  return { ...def, ...(got as object) } as T;
}

/** Fetch the live site content, deep-falling back to defaults per section. */
export async function getSiteContent(): Promise<SiteContent> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/content`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return DEFAULT_CONTENT;
    const json = (await res.json()) as { data?: Partial<SiteContent> };
    const d = json.data ?? {};
    return {
      hero: mergeSection(DEFAULT_CONTENT.hero, d.hero),
      about: mergeSection(DEFAULT_CONTENT.about, d.about),
      values: mergeSection(DEFAULT_CONTENT.values, d.values),
      sectors: mergeSection(DEFAULT_CONTENT.sectors, d.sectors),
      projects: mergeSection(DEFAULT_CONTENT.projects, d.projects),
      partners: mergeSection(DEFAULT_CONTENT.partners, d.partners),
      contact: mergeSection(DEFAULT_CONTENT.contact, d.contact),
      footer: mergeSection(DEFAULT_CONTENT.footer, d.footer),
    };
  } catch {
    return DEFAULT_CONTENT;
  }
}
