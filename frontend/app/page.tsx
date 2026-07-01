import Image from "next/image";
import Link from "next/link";
import type { ReactElement } from "react";
import { FadeIn } from "@/components/FadeIn";
import { AccentText } from "@/components/AccentText";
import { ContactButton } from "@/components/ContactModal";
import { getSiteContent, tidy } from "@/lib/content";
import {
  ArrowRight,
  ArrowUpRight,
  Compass,
  Diamond,
  Expansion,
  Frame,
  Globe,
  Innovation,
  Key,
  Leaf,
  Mail,
  Phone,
  Pin,
  Check,
  ScrollCue,
  Vessel,
  Vision,
  type IconProps,
} from "@/components/icons";

// Render from live CMS content on every request.
export const dynamic = "force-dynamic";

const ICONS: Record<string, (p: IconProps) => ReactElement> = {
  vision: Vision,
  expansion: Expansion,
  innovation: Innovation,
  leaf: Leaf,
  sustainable: Leaf,
  compass: Compass,
  frame: Frame,
  key: Key,
  vessel: Vessel,
  globe: Globe,
};

export default async function HomePage() {
  const c = await getSiteContent();

  const contacts = [
    { Icon: Mail, label: "Email", value: c.contact.email, href: `mailto:${c.contact.email}` },
    { Icon: Phone, label: "Hotline", value: c.contact.hotline, href: `tel:${c.contact.hotline.replace(/[^+\d]/g, "")}` },
    { Icon: Globe, label: "Website", value: c.contact.website, href: `https://${c.contact.website.replace(/^https?:\/\//, "")}` },
    { Icon: Pin, label: "Địa chỉ", value: c.contact.address, href: "" },
  ];

  return (
    <>
      {/* 01 — HERO */}
      <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-bg-base">
        {/* Optional background image — dimmed so the wordmark stays readable.
            When no image is set the section keeps its empty dark base. */}
        {c.hero.image && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={c.hero.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-bg-base/75" />
          </>
        )}
        {/* Depth: a soft emerald vignette over the deep base. */}
        <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_30%,theme(colors.bg.elev/35),transparent_70%)]" />

        <div className="relative shell flex flex-col items-center pt-28 pb-24 text-center">
          <FadeIn className="mx-auto w-full max-w-3xl">
            <h1 className="font-serif font-semibold leading-[0.95]">
              <span className="block text-hero tracking-[0.05em] text-accent">{c.hero.titleTop}</span>
              <span className="mt-1 block text-hero font-normal tracking-[0.16em] text-ink">
                {c.hero.titleBottom}
              </span>
            </h1>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-sans text-[9px] font-semibold uppercase tracking-[0.16em] text-accent sm:flex-nowrap sm:whitespace-nowrap sm:text-[10px] md:text-[11px] md:tracking-[0.2em]">
              {c.hero.keywords.map((k, i) => (
                <span key={`${k}-${i}`} className="flex items-center gap-2">
                  {i > 0 && <span className="text-accent/40">·</span>}
                  {k}
                </span>
              ))}
            </div>

            <p className="mt-8 font-sans text-base font-bold uppercase tracking-[0.3em] text-ink md:text-lg">
              {c.hero.tagline}
            </p>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-ink/75 md:text-xl">
              {tidy(c.hero.intro)}
            </p>

            <div className="mt-10 flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
              <Link href="/#about" className="group btn-ghost w-full justify-center sm:w-auto">
                {c.hero.ctaGhost}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <ContactButton className="group btn-primary w-full justify-center sm:w-auto">
                {c.hero.ctaPrimary}
                <ArrowUpRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </ContactButton>
            </div>
          </FadeIn>
        </div>

        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
          <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-muted">
            Cuộn xuống
          </span>
          <ScrollCue className="h-5 w-5 animate-bounce text-accent [animation-duration:2s]" />
        </div>
      </section>

      {/* 02 — ABOUT */}
      <section id="about" className="section-cream pb-24 md:pb-section">
        <div className="shell border-t border-cream-line pt-24 md:pt-section">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <FadeIn>
                <p className="eyebrow">{c.about.eyebrow}</p>
                <h2 className="mt-6 max-w-2xl font-serif text-display font-bold uppercase leading-[1.12] text-cream-ink">
                  <AccentText text={c.about.heading} />
                </h2>
              </FadeIn>
            </div>
            <div className="lg:col-span-5">
              <FadeIn delay={0.1}>
                <blockquote className="border-l-2 border-accent pl-6">
                  <p className="font-quote text-2xl italic leading-relaxed text-cream-ink/80 md:text-3xl">
                    “{tidy(c.about.quote)}”
                  </p>
                  <footer className="mt-5 font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-cream-muted">
                    {c.about.quoteAuthor}
                  </footer>
                </blockquote>
              </FadeIn>
            </div>
          </div>

          <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <FadeIn>
                <p className="text-lg leading-[1.9] text-cream-muted">
                  <span className="float-left mr-3 mt-1 font-serif text-7xl font-medium leading-[0.8] text-cream-ink">
                    {c.about.body1.charAt(0)}
                  </span>
                  {c.about.body1.slice(1)}
                </p>
                <p className="mt-6 text-lg leading-[1.9] text-cream-muted">{c.about.body2}</p>
              </FadeIn>
            </div>
            <div className="lg:col-span-5">
              <FadeIn delay={0.1}>
                <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-brand bg-line/40 text-ink shadow-xl shadow-cream-ink/10">
                  {c.about.stats.map((s, i) => (
                    <div key={`${s.label}-${i}`} className="bg-bg-base p-8">
                      <dt className="font-serif text-4xl font-medium text-accent md:text-5xl">{s.value}</dt>
                      <dd className="mt-2 text-sm text-ink-muted">{s.label}</dd>
                    </div>
                  ))}
                </dl>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* 03 — CORE VALUES */}
      <section id="values" className="section-cream pb-24 md:pb-section">
        <div className="shell border-t border-cream-line pt-24 md:pt-section">
          <FadeIn>
            <p className="eyebrow">{c.values.eyebrow}</p>
          </FadeIn>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {c.values.items.map((v, i) => {
              const Icon = ICONS[v.icon] ?? Diamond;
              return (
                <FadeIn as="div" key={`${v.title}-${i}`} delay={i * 0.06}>
                  <div className="group h-full rounded-brand border border-cream-line bg-cream-elev p-8 shadow-[0_1px_3px_rgba(20,30,24,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cream-ink/5 md:p-10">
                    <div className="flex items-center justify-between">
                      <Icon className="h-7 w-7 text-cream-ink" strokeWidth={1.3} />
                      <span className="font-sans text-xs font-medium tracking-[0.18em] text-cream-muted/60">{v.n}</span>
                    </div>
                    <h3 className="mt-10 font-serif text-3xl font-bold uppercase tracking-[0.04em] text-cream-ink">
                      {v.title}
                    </h3>
                    <p className="mt-2 text-cream-muted">{v.caption}</p>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* 04 — SECTORS */}
      <section id="sectors" className="bg-bg-base pb-24 md:pb-section">
        <div className="shell border-t border-line pt-24 md:pt-section">
          <FadeIn>
            <p className="eyebrow">{c.sectors.eyebrow}</p>
            <div className="mt-6">
              <h2 className="max-w-2xl font-serif text-display font-bold uppercase leading-[1.12] text-ink">{tidy(c.sectors.heading)}</h2>
            </div>
          </FadeIn>

          <div className="mt-14 grid gap-px overflow-hidden rounded-brand border border-line bg-line sm:grid-cols-2">
            {c.sectors.items.map((s, i) => (
              <FadeIn as="div" key={`${s.title}-${i}`} delay={i * 0.06} className="group bg-bg-base p-8 md:p-12">
                <span className="font-serif text-5xl font-medium text-accent">{s.n}</span>
                <h3 className="mt-6 font-sans text-base font-semibold uppercase tracking-[0.2em] text-accent">{s.title}</h3>
                <p className="mt-4 text-lg leading-relaxed text-ink-muted">{s.body}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 05 — PROJECTS */}
      <section id="projects" className="section-cream pb-24 md:pb-section">
        <div className="shell border-t border-cream-line pt-24 md:pt-section">
          <FadeIn>
            <p className="eyebrow">{c.projects.eyebrow}</p>
            <h2 className="mt-6 max-w-2xl font-serif text-display font-bold uppercase leading-[1.12] text-cream-ink">{tidy(c.projects.heading)}</h2>
          </FadeIn>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {c.projects.items.map((p, i) => (
              <FadeIn as="div" key={`${p.title}-${i}`} delay={i * 0.08}>
                <article className="group relative aspect-[3/4] overflow-hidden rounded-brand">
                  <Image
                    src={p.image}
                    alt={`${p.title} — ${p.location}`}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out-soft group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-bg-deep/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-7">
                    <p className="eyebrow">{p.eyebrow}</p>
                    <h3 className="mt-3 font-serif text-3xl font-medium uppercase tracking-[0.02em] text-ink">{p.title}</h3>
                    <p className="mt-1 font-sans text-sm text-ink/70">{tidy(p.location)}</p>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 06 — PARTNERS */}
      <section id="partners" className="section-cream pb-24 md:pb-section">
        <div className="shell border-t border-cream-line pt-24 md:pt-section">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <FadeIn>
                <p className="eyebrow">{c.partners.eyebrow}</p>
                <h2 className="mt-6 font-serif text-display font-bold uppercase leading-[1.12] text-cream-ink">
                  {tidy(c.partners.heading)}
                </h2>
                <p className="mt-6 max-w-md text-lg text-cream-muted">{tidy(c.partners.body)}</p>
              </FadeIn>
            </div>
            <div className="lg:col-span-7">
              <FadeIn delay={0.1}>
                <ul className="space-y-3.5">
                  {c.partners.items.map((p, i) => (
                    <li
                      key={`${p}-${i}`}
                      className="group flex items-center justify-between gap-4 rounded-2xl border border-cream-line bg-cream-elev px-6 py-4 shadow-[0_1px_3px_rgba(20,30,24,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-lg hover:shadow-cream-ink/5"
                    >
                      <span className="font-medium text-cream-ink">{p}</span>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-accent/40 text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-cream-elev">
                        <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </li>
                  ))}
                </ul>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* 07 — CONTACT / FOOTER */}
      <section id="contact" className="bg-bg-base">
        <div className="shell border-t border-line pt-24 md:pt-section">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-20">
            <FadeIn className="text-center lg:text-left">
              <p className="eyebrow">{c.contact.eyebrow}</p>
              <h2 className="mt-6 font-serif text-display font-bold uppercase leading-[1.12] text-ink">{tidy(c.contact.heading)}</h2>
              <p className="mx-auto mt-6 max-w-md text-lg text-ink-muted lg:mx-0">{c.contact.body}</p>
              <div className="mt-8 flex justify-center lg:justify-start">
                <ContactButton className="group btn-primary">
                  Gửi thông tin hợp tác
                  <ArrowUpRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </ContactButton>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <ul className="mx-auto max-w-sm space-y-7 sm:max-w-none lg:pt-2">
                {contacts.map((ct) => {
                  const inner = (
                    <>
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-accent/40 text-accent transition-colors group-hover:border-accent group-hover:bg-accent/10">
                        <ct.Icon className="h-5 w-5" />
                      </span>
                      <span className="text-left">
                        <span className="block font-sans text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                          {ct.label}
                        </span>
                        <span className="mt-1 block text-ink">{ct.value}</span>
                      </span>
                    </>
                  );
                  return (
                    <li key={ct.label}>
                      {ct.href ? (
                        <a href={ct.href} className="group flex items-center gap-4">
                          {inner}
                        </a>
                      ) : (
                        <div className="group flex items-center gap-4">{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </FadeIn>
          </div>
        </div>
      </section>
    </>
  );
}
