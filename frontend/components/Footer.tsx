import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-bg-base text-ink">
      <div className="shell mt-16 flex flex-col items-center gap-4 border-t border-line py-10 text-center">
        <Logo className="h-8" variant="silver" />
        <p className="font-sans text-[11px] uppercase tracking-[0.22em] text-ink-muted">
          © 2026 VENTIS GROUP · Building Strategic Ecosystems
        </p>
      </div>
    </footer>
  );
}
