"use client";

import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { InquiryForm } from "./InquiryForm";
import { Close } from "./icons";

type ContactModalCtx = { open: () => void; close: () => void };
const Ctx = createContext<ContactModalCtx>({ open: () => {}, close: () => {} });

/** Open/close the global "Hợp tác cùng chúng tôi" contact dialog. */
export function useContactModal() {
  return useContext(Ctx);
}

export function ContactModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  return (
    <Ctx.Provider value={{ open, close }}>
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="absolute inset-0 bg-bg-deep/80 backdrop-blur-sm" onClick={close} />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, y: 18, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.985 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="relative max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-brand border border-line bg-bg-base p-6 shadow-2xl md:p-8"
            >
              <button
                aria-label="Đóng"
                onClick={close}
                className="absolute right-4 top-4 text-ink-muted transition-colors hover:text-accent"
              >
                <Close className="h-5 w-5" />
              </button>

              <p className="eyebrow">Hợp tác cùng Ventis</p>
              <h2 className="mt-3 font-serif text-2xl font-medium text-ink">
                Cùng kiến tạo giá trị dài hạn.
              </h2>
              <p className="mt-2 max-w-md text-sm text-ink-muted">
                Để lại thông tin, đội ngũ Ventis sẽ liên hệ lại trong thời gian sớm nhất.
              </p>

              <div className="mt-6">
                <InquiryForm />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}

/** Button that opens the contact dialog (used in the hero + nav). */
export function ContactButton({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const { open } = useContactModal();
  return (
    <button type="button" onClick={open} className={className}>
      {children}
    </button>
  );
}
