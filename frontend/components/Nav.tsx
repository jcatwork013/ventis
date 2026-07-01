"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { Close, Menu } from "./icons";

const links = [
  { href: "/#about", label: "Về Ventis" },
  { href: "/#values", label: "Giá trị" },
  { href: "/#sectors", label: "Lĩnh vực" },
  { href: "/#projects", label: "Dự án" },
  { href: "/#contact", label: "Liên hệ" },
];

function NavLink({
  href,
  label,
  onClick,
  light,
}: {
  href: string;
  label: string;
  onClick?: () => void;
  light?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group relative py-1 font-sans text-[13px] font-medium uppercase tracking-[0.16em] transition-colors duration-300 md:text-sm ${
        light
          ? "text-cream-ink/70 hover:text-cream-ink"
          : "text-ink/75 hover:text-ink"
      }`}
    >
      {label}
      <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out-soft group-hover:scale-x-100" />
    </Link>
  );
}

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  // Three chrome states: transparent over the dark hero at the very top, a
  // light cream-glass bar once scrolled over the content sections, and the
  // dark sheet while the mobile menu is open (so the overlay reads as one).
  const light = scrolled && !open;

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,box-shadow,border-color] duration-500 ${
        light
          ? "border-b border-cream-line bg-cream/85 text-cream-ink shadow-[0_8px_30px_-16px_rgba(20,30,24,0.25)] backdrop-blur-md"
          : open
          ? "border-b border-line bg-bg-base/95 text-ink backdrop-blur-md"
          : "border-b border-transparent bg-transparent text-ink"
      }`}
    >
      <nav
        className={`shell flex items-center justify-between transition-all duration-500 ease-out-soft ${
          scrolled ? "h-16" : "h-20 md:h-24"
        }`}
      >
        <Link href="/" aria-label="VENTIS GROUP" onClick={() => setOpen(false)}>
          <Logo variant={light ? "dark" : "silver"} />
        </Link>

        <div className="hidden items-center gap-9 md:flex">
          {links.map((l) => (
            <NavLink key={l.href} href={l.href} label={l.label} light={light} />
          ))}
        </div>

        <button
          aria-label={open ? "Đóng menu" : "Mở menu"}
          className={`relative z-10 transition-transform duration-300 active:scale-90 md:hidden ${
            light ? "text-cream-ink" : "text-ink"
          }`}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <Close className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-line bg-bg-base/95 backdrop-blur-md md:hidden"
          >
            <div className="shell flex flex-col py-4">
              {links.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="border-b border-line/60 last:border-b-0"
                >
                  <Link
                    href={l.href}
                    className="block py-5 font-sans text-base font-semibold uppercase tracking-[0.18em] text-ink/85 transition-colors hover:text-accent"
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
