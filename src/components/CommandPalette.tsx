import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, FileText, Hash, FileStack } from "lucide-react";
import { getAllPosts } from "../utils/blogLoader";
import { lockScroll, unlockScroll } from "../utils/scrollLock";
import { NAV_LINKS } from "../constants/nav";

interface Props {
  onClose: () => void;
}

type Item =
  | { kind: "post"; label: string; sub?: string; slug: string }
  | { kind: "section"; label: string; id: string }
  | { kind: "page"; label: string; path: string };

// Derived from the canonical Header nav so the two can't drift. Section items
// reuse Header's `state.scrollTo` machinery (navigate to "/" with that state)
// so cross-page anchor scrolling behaves identically to clicking the nav.
const NAV_ITEMS: Item[] = NAV_LINKS.map((link) =>
  link.href.startsWith("#")
    ? { kind: "section", label: link.label, id: link.href.substring(1) }
    : { kind: "page", label: link.label, path: link.href },
);

function itemKey(it: Item): string {
  if (it.kind === "post") return `post:${it.slug}`;
  if (it.kind === "page") return `page:${it.path}`;
  return `section:${it.id}`;
}

export default function CommandPalette({ onClose }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  // Tracks what last moved the highlight so the scroll-into-view effect only
  // fires for keyboard/typing, not for hover (which would yank the list under
  // the cursor). Starts "keyboard" so a fresh query scrolls back to the top.
  const navSource = useRef<"keyboard" | "pointer">("keyboard");

  const posts = useMemo<Item[]>(
    () =>
      getAllPosts().map((p) => ({
        kind: "post",
        label: p.title,
        sub: p.description,
        slug: p.slug,
      })),
    [],
  );

  const results = useMemo<Item[]>(() => {
    const q = query.toLowerCase().trim();
    const all = [...NAV_ITEMS, ...posts];
    if (!q) return all;
    return all.filter(
      (it) =>
        it.label.toLowerCase().includes(q) ||
        (it.kind === "post" && it.sub?.toLowerCase().includes(q)),
    );
  }, [query, posts]);

  // Focus the input on open and return focus to the trigger on close.
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    return () => trigger?.focus?.();
  }, []);

  // Lock background scroll while open (shared, reference-counted lock).
  useEffect(() => {
    lockScroll();
    return unlockScroll;
  }, []);

  // Reset the highlight whenever the result set changes, scrolling the list
  // back to the top (treat a new query as keyboard-driven).
  useEffect(() => {
    navSource.current = "keyboard";
    setActive(0);
  }, [query]);

  // Keep the highlighted row in view during keyboard navigation. Skip when
  // there are no results — children[0] would be the "No results" placeholder —
  // and skip pointer-driven changes so hovering rows doesn't scroll the list.
  useEffect(() => {
    if (results.length === 0 || navSource.current === "pointer") return;
    const el = listRef.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [active, results.length]);

  const run = (it: Item) => {
    onClose();
    if (it.kind === "post") void navigate(`/blog/${it.slug}`);
    else if (it.kind === "page") void navigate(it.path);
    // Reuse Header's `state.scrollTo` machinery. Replace the entry when already
    // on "/" so we don't push a same-page history entry; otherwise push so Back
    // returns to the current page.
    else
      void navigate("/", {
        state: { scrollTo: it.id },
        replace: location.pathname === "/",
      });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      navSource.current = "keyboard";
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      navSource.current = "keyboard";
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const it = results[active];
      if (it) run(it);
    } else if (e.key === "Tab") {
      // Arrow keys drive selection. This handler sits on the dialog container,
      // so it catches Tab bubbling up from option buttons too — pull focus back
      // to the input to keep it trapped and the combobox semantics coherent.
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  const kindLabel = { post: "Post", page: "Page", section: "Section" } as const;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center p-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      onKeyDown={onKeyDown}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-xl rounded-xl border border-rule bg-paper shadow-2xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 border-b border-rule">
          <Search size={18} className="text-muted shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search posts and pages…"
            className="w-full bg-transparent py-4 text-ink placeholder-muted focus:outline-none"
            aria-label="Search posts and pages"
            role="combobox"
            aria-expanded
            aria-controls="command-palette-list"
            aria-autocomplete="list"
            aria-activedescendant={
              results[active] ? `command-palette-opt-${active}` : undefined
            }
          />
          <kbd className="hidden sm:block text-xs text-muted border border-rule rounded px-1.5 py-0.5">
            Esc
          </kbd>
        </div>
        <ul
          ref={listRef}
          id="command-palette-list"
          role="listbox"
          aria-label="Search results"
          className="max-h-80 overflow-y-auto py-2"
        >
          {results.length === 0 && (
            <li className="px-4 py-6 text-center text-muted text-sm">
              No results
            </li>
          )}
          {results.map((it, i) => (
            <li key={itemKey(it)}>
              <button
                type="button"
                id={`command-palette-opt-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseEnter={() => {
                  navSource.current = "pointer";
                  setActive(i);
                }}
                onClick={() => run(it)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                  i === active ? "bg-accent-soft" : ""
                }`}
              >
                {it.kind === "post" ? (
                  <FileText size={16} className="text-muted shrink-0" />
                ) : it.kind === "page" ? (
                  <FileStack size={16} className="text-muted shrink-0" />
                ) : (
                  <Hash size={16} className="text-muted shrink-0" />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-ink text-sm">
                    {it.label}
                  </span>
                  {it.kind === "post" && it.sub && (
                    <span className="block truncate text-muted text-xs">
                      {it.sub}
                    </span>
                  )}
                </span>
                <span className="text-[10px] uppercase tracking-wide text-muted shrink-0">
                  {kindLabel[it.kind]}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
