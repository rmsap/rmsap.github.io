import { useEffect, useState } from "react";

export const useActiveSection = (
  sectionIds: string[],
  offset = 100,
  formatHash?: (id: string) => string,
) => {
  const [activeSection, setActiveSection] = useState(sectionIds[0]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            const hash = formatHash
              ? formatHash(entry.target.id)
              : `#${entry.target.id}`;
            window.history.replaceState(null, "", hash);
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
      .filter(Boolean) as HTMLElement[];

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, [sectionIds, offset, formatHash]);

  return activeSection;
};
