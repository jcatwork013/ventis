"use client";

import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { useLenis } from "lenis/react";
import { useEffect, useState } from "react";
import { ArrowUp } from "./icons";

/**
 * Premium scroll chrome:
 *  - a hairline gold progress bar pinned to the top of the viewport
 *  - a back-to-top control that fades in past the first screen and glides home
 */
export function ScrollChrome() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  const lenis = useLenis();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 640);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.2 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <motion.div
        style={{ scaleX }}
        className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-accent to-accent-soft"
      />

      <AnimatePresence>
        {show && (
          <motion.button
            key="to-top"
            onClick={toTop}
            aria-label="Lên đầu trang"
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            whileHover={{ y: -3 }}
            className="group fixed bottom-6 right-6 z-[60] flex h-12 w-12 items-center justify-center rounded-full border border-accent/50 bg-bg-base/80 text-accent shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] backdrop-blur-md transition-colors hover:border-accent hover:bg-accent hover:text-bg-base md:bottom-8 md:right-8"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
