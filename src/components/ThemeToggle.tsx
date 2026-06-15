import { Sun, Moon } from "lucide-react";

type Theme = "light" | "dark";

// The inline script in index.html resolves and applies data-theme before first
// paint. The two icons below are shown/hidden purely via CSS keyed on that
// attribute (Tailwind's `dark:` variant follows data-theme — see index.css), so
// the correct icon is right on first paint with no post-hydration flip. The
// click handler reads the live attribute, so no React state is needed and there
// is nothing for hydration to mismatch.
export default function ThemeToggle() {
  const toggle = () => {
    const current = (document.documentElement.dataset.theme as Theme) ?? "dark";
    const next: Theme = current === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* localStorage can throw in private mode — the toggle still works for the session */
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta)
      meta.setAttribute("content", next === "light" ? "#f2f5f9" : "#0f141c");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      title="Toggle color theme"
      className="p-2 text-muted hover:text-accent transition-colors duration-200"
    >
      {/* Shown in dark mode — offers a switch to light. */}
      <Sun size={20} className="hidden dark:block" />
      {/* Shown in light mode — offers a switch to dark. */}
      <Moon size={20} className="block dark:hidden" />
    </button>
  );
}
