import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

/** Render trusted CMS markdown to HTML for prose containers. */
export function renderMarkdown(md: string): string {
  return marked.parse(md ?? "", { async: false }) as string;
}

/** "from $6,800" style price label. */
export function priceFrom(amount: number, currency: string): string {
  const symbol = currency === "USD" ? "$" : "";
  return `${symbol}${amount.toLocaleString("en-US")}${symbol ? "" : " " + currency}`;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
