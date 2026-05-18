import { useCallback, useEffect, useRef } from "react";

// 50ms × 100 = ~5s. Comfortably covers slow mobile renders of lazy-loaded
// chunks (BlogIndex / BlogPostPage); raise if real-world targets miss this.
const POLL_INTERVAL_MS = 50;
const POLL_MAX_ATTEMPTS = 100;

/**
 * Returns a `scrollWhenReady(id, onSuccess?)` callback that scrolls to the
 * element with the given id, polling for up to ~5s if it isn't mounted yet.
 * Also exposes `cancelPolling` so callers can abort a pending poll when the
 * user takes a new action.
 */
export const useScrollWhenReady = (
  scrollToSection: (elementId: string) => boolean,
) => {
  const pollRef = useRef<number | null>(null);

  const cancelPolling = useCallback(() => {
    if (pollRef.current !== null) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const scrollWhenReady = useCallback(
    (elementId: string, onSuccess?: () => void) => {
      cancelPolling();
      if (scrollToSection(elementId)) {
        onSuccess?.();
        return;
      }
      let attempts = 0;
      pollRef.current = window.setInterval(() => {
        if (scrollToSection(elementId)) {
          cancelPolling();
          onSuccess?.();
        } else if (++attempts > POLL_MAX_ATTEMPTS) {
          cancelPolling();
        }
      }, POLL_INTERVAL_MS);
    },
    [scrollToSection, cancelPolling],
  );

  // cancelPolling is stable (useCallback with [] deps), so this effectively runs
  // its cleanup only on unmount.
  useEffect(() => cancelPolling, [cancelPolling]);

  return { scrollWhenReady, cancelPolling };
};
