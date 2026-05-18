import { useEffect, useState } from "react";

/**
 * Observes the given section ids and returns the id of the one currently in
 * view (offset from the top by `offset` px), or `null` until the
 * IntersectionObserver has fired for the first time. Pure observation — does
 * not touch the URL. Callers that want to sync the active section to the URL
 * hash should do so in a separate effect.
 *
 * The `null` initial value is deliberate: it lets consumers (and `useHashSync`)
 * distinguish "observer hasn't reported anything yet" from "user is on the
 * first section". That distinction is what prevents the initial state from
 * clobbering a deep-link hash like `/#projects` on mount (including under
 * React 19 StrictMode's double-mount), and avoids a stale highlight when the
 * observer is re-enabled (e.g. navigating back from /blog).
 *
 * `sectionIds` MUST be a stable reference across renders — if the caller
 * inlines a new array literal each render, the effect will tear down and
 * recreate the observer on every render. Define it at module scope or memoize.
 */
export const useActiveSection = (
  sectionIds: string[],
  offset = 100,
  enabled = true,
) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setActiveSection(null);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: `-${offset}px 0px -50% 0px`,
        threshold: 0,
      },
    );

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [sectionIds, offset, enabled]);

  return activeSection;
};
