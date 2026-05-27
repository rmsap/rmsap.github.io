import { lazy, Suspense } from "react";
import About from "./components/About/About";
import Contact from "./components/Contact";
import Header from "./components/Header";
import NotFound from "./components/NotFound";
import Projects from "./components/Projects";
import FeaturedPosts from "./components/FeaturedPosts";
import Hero from "./components/Hero";
import Experience from "./components/Experience";
import TechnicalSkills from "./components/TechnicalSkills";
import Footer from "./components/Footer";
import LegacyHashRedirect from "./components/LegacyHashRedirect";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { AnimatePresence } from "framer-motion";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

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

function Portfolio() {
  return (
    <>
      <main>
        <Hero />
        <Projects />
        <FeaturedPosts />
        <Experience />
        <TechnicalSkills />
        <About />
      </main>
      <Contact />
    </>
  );
}

function App() {
  return (
    <HelmetProvider>
      <Helmet>
        <link
          rel="alternate"
          type="application/rss+xml"
          title="Ryan Saperstein's Blog"
          href="/rss.xml"
        />
      </Helmet>
      <BrowserRouter>
        <LegacyHashRedirect />
        <Header />
        <AnimatePresence mode="wait">
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Portfolio />} />
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
        </AnimatePresence>
        <Footer />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
