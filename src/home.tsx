import About from "./components/About/About";
import Contact from "./components/Contact";
import Header from "./components/Header";
import Projects from "./components/Projects";
import Hero from "./components/Hero";
import Experience from "./components/Experience";
import TechnicalSkills from "./components/TechnicalSkills";

function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Projects />
      <Experience />
      <TechnicalSkills />
      <About />
      <Contact />
    </>
  );
}

export default Home;
