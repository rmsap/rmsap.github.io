import { useEffect, useRef, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState("");
  const ignoreObserverUntil = useRef(0);

  // Scrape headings from the rendered prose after mount (delay so prose is painted)
  useEffect(() => {
    const t = requestAnimationFrame(() => {
      const el = document.querySelector(".prose");
      if (!el) return;
      const nodes = el.querySelectorAll("h2, h3");
      const items: TocItem[] = Array.from(nodes).map((node) => {
        if (!node.id) {
          node.id =
            node.textContent
              ?.toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "") ?? "";
        }
        return {
          id: node.id,
          text: node.textContent ?? "",
          level: node.tagName === "H2" ? 2 : 3,
        };
      });
      setHeadings(items);
    });
    return () => cancelAnimationFrame(t);
  }, []);

  // Intersection observer for scroll-spy
  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (Date.now() < ignoreObserverUntil.current) return;
        const intersecting = entries.filter((e) => e.isIntersecting);
        if (intersecting.length === 0) return;
        // Prefer the first heading in document order that's intersecting (topmost in view)
        const sorted = intersecting.sort(
          (a, b) =>
            (a.boundingClientRect?.top ?? 0) - (b.boundingClientRect?.top ?? 0),
        );
        setActiveId(sorted[0].target.id);
      },
      { rootMargin: "-80px 0px -60% 0px", threshold: 0 },
    );
    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav className="toc border-l border-gray-700 pl-4 mb-8 text-sm">
      <p className="font-semibold text-gray-300 mb-2">On this page</p>
      <ul className="space-y-1">
        {headings.map((h) => (
          <li key={h.id} style={{ paddingLeft: h.level === 3 ? "1rem" : 0 }}>
            <a
              href={`#${h.id}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(h.id);
                if (!el) return;
                setActiveId(h.id);
                ignoreObserverUntil.current = Date.now() + 1200;
                const headerOffset = 100;
                const top =
                  window.scrollY +
                  el.getBoundingClientRect().top -
                  headerOffset;
                window.scrollTo({ top, behavior: "smooth" });
              }}
              className={`block py-0.5 transition-colors cursor-pointer ${
                activeId === h.id
                  ? "text-purple-400 font-medium"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
