import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useScrollMetrics } from "../../hooks/useScrollMetrics";

/**
 * Thin bar pinned to the bottom edge of the fixed header that fills as the
 * reader scrolls. `top-16 lg:top-20` matches the header's `h-16 lg:h-20` so it
 * sits flush with the header border at both breakpoints. Portaled to <body> so
 * no transformed/opacity ancestor (e.g. PageTransition's fade) can trap it in a
 * stacking context beneath the header. Client-only: renders nothing during SSR
 * and until mounted, so there's no hydration mismatch and no markup shipped at
 * 0%.
 */
export default function ReadingProgress() {
  const { progress } = useScrollMetrics();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed top-16 lg:top-20 left-0 right-0 z-[60] h-[3px] bg-transparent pointer-events-none"
      aria-hidden
    >
      <div
        className="h-full bg-accent origin-left"
        style={{ transform: `scaleX(${progress})`, width: "100%" }}
      />
    </div>,
    document.body,
  );
}
