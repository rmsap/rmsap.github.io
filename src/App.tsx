import { lazy, Suspense } from "react";
import Header from "./components/Header";
import NotFound from "./components/NotFound";
import Footer from "./components/Footer";
import LegacyHashRedirect from "./components/LegacyHashRedirect";
import Home from "./home";
import { HelmetProvider } from "react-helmet-async";
import { Routes, Route, Navigate } from "react-router-dom";

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

function App() {
  return (
    <HelmetProvider>
      {/* The RSS <link rel="alternate"> is static in index.html (not Helmet)
          so feed discovery finds it in <head> of every prerendered page. */}
      <LegacyHashRedirect />
      <Header />
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
    </HelmetProvider>
  );
}

export default App;
