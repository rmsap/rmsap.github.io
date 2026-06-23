import { useEffect, useState } from "react";

export interface ScrollMetrics {
  // Current vertical scroll offset in px (scroller-agnostic: works whether html
  // or body is the scrolling element, unlike documentElement.scrollTop).
  scrollY: number;
  // Fraction of the page scrolled, clamped to 0..1 (0 when there's nothing to
  // scroll).
  progress: number;
}

/**
 * Subscribes to window scroll/resize and returns the current scroll offset and
 * progress fraction, recomputed at most once per frame via requestAnimationFrame.
 * Shared by the blog reading-progress bar and back-to-top button so their
 * throttling and scroll math stay in sync.
 */
export function useScrollMetrics(): ScrollMetrics {
  const [metrics, setMetrics] = useState<ScrollMetrics>({
    scrollY: 0,
    progress: 0,
  });

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const scrollY = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setMetrics({
        scrollY,
        progress: max > 0 ? Math.min(1, scrollY / max) : 0,
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return metrics;
}
