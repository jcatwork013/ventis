import { Fragment } from "react";
import { tidy } from "@/lib/content";

/**
 * Renders a heading string where `[[word]]` fragments become gold italic accents.
 * e.g. "Nền tảng [[kết nối]] đầu tư." → "kết nối" styled with .accent-word.
 */
export function AccentText({ text }: { text: string }) {
  const parts = tidy(text).split(/(\[\[.*?\]\])/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("[[") && p.endsWith("]]") ? (
          <span key={i} className="accent-word">
            {p.slice(2, -2)}
          </span>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}
