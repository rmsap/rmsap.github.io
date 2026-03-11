import About from "./components/About/About";
import Contact from "./components/Contact";
import Header from "./components/Header";
import Projects from "./components/Projects";
import Hero from "./components/Hero";
import Experience from "./components/Experience";
import TechnicalSkills from "./components/TechnicalSkills";
import Footer from "./components/Footer";
import BlogIndex from "./components/blog/BlogIndexPage";
import BlogPostPage from "./components/blog/BlogPostPage";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { AnimatePresence } from "framer-motion";
import { HashRouter, Routes, Route } from "react-router-dom";

function Portfolio() {
  return (
    <>
      <main>
        <Hero />
        <Projects />
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
        <Header />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Portfolio />} />
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
          </Routes>
        </AnimatePresence>
        <Footer />
      </HashRouter>
    </HelmetProvider>
  );
}

export default App;
