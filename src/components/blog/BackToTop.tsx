import { ArrowUp } from "lucide-react";
import { useScrollMetrics } from "../../hooks/useScrollMetrics";

// Show the button once the reader is roughly a viewport past the fold.
const SHOW_AFTER_PX = 600;

/**
 * Floating button that appears once the reader has scrolled past the fold and
 * smoothly returns them to the top. Honors prefers-reduced-motion.
 *
 * Unlike ReadingProgress, this is NOT portaled to <body>. It sits below the
 * header (z-40 < the header's z-50), so it never needs to escape PageTransition's
 * stacking context, and that context is opacity-only (no transform) — so `fixed`
 * here stays viewport-relative regardless.
 */
export default function BackToTop() {
  const { scrollY } = useScrollMetrics();
  const visible = scrollY > SHOW_AFTER_PX;

  const toTop = () => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      className={`fixed bottom-6 right-6 z-40 p-3 rounded-full bg-surface border border-rule shadow-lg text-muted hover:text-accent hover:border-accent/50 transition-all duration-300 ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      <ArrowUp size={20} />
    </button>
  );
}
