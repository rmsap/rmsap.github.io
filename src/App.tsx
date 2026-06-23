import { lazy, Suspense, useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import NotFound from "./components/NotFound";
import Footer from "./components/Footer";
import LegacyHashRedirect from "./components/LegacyHashRedirect";
import Home from "./home";
import { HelmetProvider } from "react-helmet-async";
import { Routes, Route, Navigate } from "react-router-dom";
import { isScrollLocked } from "./utils/scrollLock";

// Legacy path-style URLs from the previous HashRouter layout. Kept as redirects
// so old bookmarks/links keep working after the move to BrowserRouter.
const LEGACY_SECTION_PATHS = [
  "home",
  "projects",
  "experience",
  "about",
  "contact",
  "featured-posts",
];

// Lazy-load blog so MDX/glob don’t run on home page (avoids breaking home if blog load fails)
const BlogIndex = lazy(() => import("./components/blog/BlogIndexPage"));
const BlogPostPage = lazy(() => import("./components/blog/BlogPostPage"));
// Lazy too: it pulls in blogLoader's MDX glob, which must stay out of the home
// bundle. Only loads on first open (⌘K or the Header search button).
const CommandPalette = lazy(() => import("./components/CommandPalette"));

function App() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  // Mirror state into a ref so the keydown handler can read the current value
  // without the effect re-subscribing on every open/close.
  const paletteOpenRef = useRef(paletteOpen);
  paletteOpenRef.current = paletteOpen;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Bail on Shift so we don't hijack Cmd+Shift+K (browser console).
      if (
        !(e.metaKey || e.ctrlKey) ||
        e.shiftKey ||
        e.key.toLowerCase() !== "k"
      )
        return;
      if (paletteOpenRef.current) {
        // Already open → ⌘K closes it. Focus is in the palette's own input, so
        // the typing guard below would otherwise swallow this and never toggle.
        e.preventDefault();
        setPaletteOpen(false);
        return;
      }
      // Don't hijack ⌘K while the user is typing (e.g. the comment form).
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      ) {
        return;
      }
      // Another overlay (e.g. the Projects modal) already owns the screen and
      // the scroll lock. Opening the palette behind it would steal focus and
      // muddle the shared lock, so defer to whoever's already up.
      if (isScrollLocked()) return;
      e.preventDefault();
      setPaletteOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <HelmetProvider>
      {/* The RSS <link rel="alternate"> is static in index.html (not Helmet)
          so feed discovery finds it in <head> of every prerendered page. */}
      <LegacyHashRedirect />
      <Header onOpenSearch={() => setPaletteOpen(true)} />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<BlogIndex />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          {LEGACY_SECTION_PATHS.map((id) => (
            <Route
              key={id}
              path={`/${id}`}
              element={<Navigate to={`/#${id}`} replace />}
            />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Footer />
      {paletteOpen && (
        <Suspense fallback={null}>
          <CommandPalette onClose={() => setPaletteOpen(false)} />
        </Suspense>
      )}
    </HelmetProvider>
  );
}

export default App;
