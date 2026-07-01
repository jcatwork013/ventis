import Image from "next/image";
import Link from "next/link";
import type { Journey } from "@/lib/types";
import { priceFrom } from "@/lib/format";
import { ArrowUpRight } from "./icons";

export function JourneyCard({ journey }: { journey: Journey }) {
  const themes = journey.theme ?? [];
  const dest = journey.destination;

  return (
    <Link href={`/journeys/${journey.slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-bg-elev">
        <Image
          src={journey.hero_image}
          alt={journey.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover grayscale transition-all duration-700 ease-out-soft group-hover:scale-[1.04] group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-base/70 via-transparent to-transparent" />
        {themes[0] && (
          <span className="absolute left-4 top-4 bg-bg-base/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-accent backdrop-blur">
            {themes[0]}
          </span>
        )}
      </div>

      <div className="mt-5">
        {dest && (
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink-muted">
            {dest.city}, {dest.country}
          </p>
        )}
        <h3 className="mt-2 flex items-start justify-between gap-3 font-serif text-2xl font-light leading-tight text-ink transition-colors group-hover:text-accent">
          <span>{journey.title}</span>
          <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
        </h3>
        <p className="mt-1 text-sm text-ink-muted">{journey.subtitle}</p>
        <p className="mt-4 font-mono text-sm text-ink">
          from {priceFrom(journey.price_from, journey.currency)}
          <span className="text-ink-muted"> · {journey.duration_days} days</span>
        </p>
      </div>
    </Link>
  );
}
