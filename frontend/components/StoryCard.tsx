import Image from "next/image";
import Link from "next/link";
import type { Story } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { ArrowUpRight } from "./icons";

export function StoryCard({ story }: { story: Story }) {
  return (
    <Link href={`/stories/${story.slug}`} className="group block">
      <div className="relative aspect-[3/2] overflow-hidden bg-bg-elev">
        <Image
          src={story.cover_image}
          alt={story.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover grayscale transition-all duration-700 ease-out-soft group-hover:scale-[1.04] group-hover:grayscale-0"
        />
      </div>
      <div className="mt-5">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink-muted">
          {story.author}
          {story.published_at && ` · ${formatDate(story.published_at)}`}
        </p>
        <h3 className="mt-2 flex items-start justify-between gap-3 font-serif text-xl font-light leading-snug text-ink transition-colors group-hover:text-accent">
          <span>{story.title}</span>
          <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-ink-muted">{story.excerpt}</p>
      </div>
    </Link>
  );
}
