import type { ReactNode } from "react";

/** Numbered editorial section (01–06) with an eyebrow label. */
export function Section({
  index,
  eyebrow,
  title,
  intro,
  children,
  id,
  className = "",
}: {
  index?: string;
  eyebrow?: string;
  title?: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <section id={id} className={`py-24 md:py-section ${className}`}>
      <div className="shell">
        {(index || eyebrow) && (
          <div className="mb-8 flex items-center gap-4">
            {index && <span className="section-index">{index}</span>}
            {index && eyebrow && <span className="h-px w-8 bg-line" />}
            {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          </div>
        )}
        {title && (
          <h2 className="max-w-3xl text-display font-light tracking-tight">{title}</h2>
        )}
        {intro && <div className="mt-6 max-w-2xl text-lg text-ink-muted">{intro}</div>}
        {children && <div className="mt-12 md:mt-16">{children}</div>}
      </div>
    </section>
  );
}
