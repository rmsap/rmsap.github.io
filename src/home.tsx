import About from "./components/About/About";
import Contact from "./components/Contact";
import Projects from "./components/Projects";
import FeaturedPosts from "./components/FeaturedPosts";
import Hero from "./components/Hero";
import Experience from "./components/Experience";
import TechnicalSkills from "./components/TechnicalSkills";

// The home page. Header and Footer are global chrome (shared with the blog
// routes) and live in App.tsx outside <Routes>, so they are intentionally not
// rendered here — this component is only the home route's own content.
function Home() {
  return (
    // Reserve a left column on large screens so the fixed section-dot rail
    // (in Header, home page only) has its own gutter and never overlaps content.
    // The rail and the top header are position:fixed, so they sit outside this padding.
    <div className="lg:pl-16 fade-in">
      <main>
        <Hero />
        <Projects />
        <FeaturedPosts />
        <Experience />
        <TechnicalSkills />
        <About />
      </main>
      <Contact />
    </div>
  );
}

export default Home;
