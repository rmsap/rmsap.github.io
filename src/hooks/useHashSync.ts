import { useEffect } from "react";

/**
 * Mirrors `id` into the URL hash via `history.replaceState` whenever it
 * changes. Skips when `id` is `null` (the "observer hasn't fired yet" state
 * from `useActiveSection`), which is what keeps an existing deep-link hash
 * like `/#projects` from being clobbered on initial mount.
 *
 * Also skips when the URL hash already matches the target, so re-renders
 * (and React 19 StrictMode's double-mount) don't cause redundant writes.
 *
 * Uses raw `history.replaceState` rather than `navigate`/`useNavigate` so
 * the caller's `useLocation()` doesn't re-render — that would defeat the
 * purpose of mirroring scroll position to the URL.
 */
export const useHashSync = (id: string | null, enabled: boolean) => {
  useEffect(() => {
    if (!enabled || !id) return;
    const target = `#${id}`;
    if (window.location.hash === target) return;
    window.history.replaceState(null, "", target);
  }, [id, enabled]);
};
