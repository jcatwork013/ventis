"use client";

/**
 * A centered, floating notification. Renders fixed at the top-center of the
 * screen (never tucked into a corner) so every admin message reads the same.
 */
export function Toast({ kind = "ok", children }: { kind?: "ok" | "err"; children: React.ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-[90] flex justify-center px-4">
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-auto max-w-[90vw] rounded-full border px-5 py-2.5 text-center text-sm shadow-[0_12px_40px_-12px_rgba(0,0,0,0.7)] backdrop-blur ${
          kind === "err"
            ? "border-accent/50 bg-bg-elev/95 text-accent"
            : "border-accent-soft/50 bg-bg-elev/95 text-accent-soft"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
