"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { THEMES } from "@/lib/types";
import type { Destination } from "@/lib/types";

export function JourneyFilters({ destinations }: { destinations: Destination[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const activeTheme = params.get("theme") ?? "";
  const activeDest = params.get("destination") ?? "";

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.push(`/journeys?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-col gap-8 border-y border-line py-8">
      <div>
        <p className="eyebrow mb-4">Theme</p>
        <div className="flex flex-wrap gap-2">
          <Chip active={activeTheme === ""} onClick={() => update("theme", "")}>All</Chip>
          {THEMES.map((t) => (
            <Chip key={t} active={activeTheme === t} onClick={() => update("theme", t)}>
              {t}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="eyebrow mb-4">Destination</p>
        <div className="flex flex-wrap gap-2">
          <Chip active={activeDest === ""} onClick={() => update("destination", "")}>All</Chip>
          {destinations.map((d) => (
            <Chip key={d.slug} active={activeDest === d.slug} onClick={() => update("destination", d.slug)}>
              {d.name}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`border px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] transition-colors ${
        active
          ? "border-accent bg-accent text-bg-base"
          : "border-line text-ink-muted hover:border-accent hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
