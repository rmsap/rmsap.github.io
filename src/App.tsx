import { lazy, Suspense, useEffect } from "react";
import About from "./components/About/About";
import Contact from "./components/Contact";
import Header from "./components/Header";
import Projects from "./components/Projects";
import FeaturedPosts from "./components/FeaturedPosts";
import Hero from "./components/Hero";
import Experience from "./components/Experience";
import TechnicalSkills from "./components/TechnicalSkills";
import Footer from "./components/Footer";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { AnimatePresence } from "framer-motion";
import { HashRouter, Routes, Route } from "react-router-dom";

// Lazy-load blog so MDX/glob don’t run on home page (avoids breaking home if blog load fails)
const BlogIndex = lazy(() => import("./components/blog/BlogIndexPage"));
const BlogPostPage = lazy(() => import("./components/blog/BlogPostPage"));

/** Ensure hash has leading slash so HashRouter matches (e.g. #featured-posts → #/featured-posts) */
function HashSlashNormalizer() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.length > 1 && hash[1] !== "/") {
      window.history.replaceState(null, "", `#/${hash.slice(1)}`);
    }
  }, []);
  return null;
}

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
      <HashRouter>
        <HashSlashNormalizer />
        <Header />
        <AnimatePresence mode="wait">
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Portfolio />} />
              {/* #/featured-posts shows home and scrolls to section (no redirect so URL can update when scrolling) */}
              <Route path="/featured-posts" element={<Portfolio />} />
              {/* Section anchors (Header uses #home, #projects, etc.) become pathname with HashRouter */}
              <Route path="/home" element={<Portfolio />} />
              <Route path="/projects" element={<Portfolio />} />
              <Route path="/experience" element={<Portfolio />} />
              <Route path="/about" element={<Portfolio />} />
              <Route path="/contact" element={<Portfolio />} />
              <Route path="/blog" element={<BlogIndex />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
            </Routes>
          </Suspense>
        </AnimatePresence>
        <Footer />
      </HashRouter>
    </HelmetProvider>
  );
}

export default App;
