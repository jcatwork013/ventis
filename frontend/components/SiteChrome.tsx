"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { ScrollChrome } from "./ScrollChrome";

/** Public chrome (nav, footer, scroll bar) — hidden on /admin routes. */
export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <ScrollChrome />
      <Nav />
      <main>{children}</main>
      <Footer />
    </>
  );
}
