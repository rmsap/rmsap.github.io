import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Github, Linkedin } from "lucide-react";
import { HEADER_OFFSET } from "../constants/layout";
import { useActiveSection } from "../hooks/useActiveSection";
import { useHashSync } from "../hooks/useHashSync";
import { useScrollWhenReady } from "../hooks/useScrollWhenReady";
import ThemeToggle from "./ThemeToggle";

interface NavLink {
  label: string;
  href: string;
  isActive?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "#home" },
  { label: "Projects", href: "#projects" },
  { label: "Blog", href: "/blog" },
  { label: "Experience and Skills", href: "#experience" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

// Sidebar dots replace the Blog link with a Featured Posts section anchor.
const SIDEBAR_LINKS: NavLink[] = NAV_LINKS.map((link) =>
  link.href === "/blog"
    ? { label: "Featured Posts", href: "#featured-posts" }
    : link,
);

const SECTION_IDS: string[] = [
  ...NAV_LINKS.filter((link) => link.href.startsWith("#")).map((link) =>
    link.href.substring(1),
  ),
  "featured-posts",
];

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredDot, setHoveredDot] = useState<number | null>(null);

  // Strict: only the landing page. /blog and unmatched (NotFound) paths are not "home",
  // so the sidebar dots and section observer stay dormant there.
  const isHomePage = location.pathname === "/";

  // Gate observer to home: prevents stale hash writes from leaking onto /blog
  const activeSection = useActiveSection(
    SECTION_IDS,
    HEADER_OFFSET,
    isHomePage,
  );
  useHashSync(activeSection, isHomePage);

  const displayActiveSection = isHomePage ? activeSection : null;
  const isBlogActive =
    location.pathname.startsWith("/blog") ||
    (isHomePage && activeSection === "featured-posts");

  const isLinkActive = (link: NavLink) => {
    if (link.href === "/blog") return isBlogActive;
    if (!link.href.startsWith("#")) return false;
    return displayActiveSection === link.href.substring(1);
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - HEADER_OFFSET;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      return true;
    }
    return false;
  }, []);

  const { scrollWhenReady, cancelPolling } =
    useScrollWhenReady(scrollToSection);

  // When location.state carries a scrollTo target (e.g. nav back from /blog),
  // wait for the DOM then scroll, and clear the state so refresh doesn't re-fire.
  useEffect(() => {
    const scrollTo = (location.state as { scrollTo?: string } | null)?.scrollTo;
    if (!scrollTo) return;
    scrollWhenReady(scrollTo, () => {
      void navigate(".", { replace: true, state: {} });
    });
  }, [location.state, navigate, scrollWhenReady]);

  // Direct visit with a section hash (e.g. /#featured-posts): scroll with header offset.
  // Safe to re-run on every pathname/hash change — useHashSync writes the hash via raw
  // history.replaceState, so observer-driven hash changes never flow through useLocation
  // and won't retrigger this effect.
  // Accepts the old HashRouter shape `/#/section` by stripping a leading slash inside
  // the hash, so bookmarks from the prior layout still scroll to the right section.
  useEffect(() => {
    if (location.pathname !== "/" || !location.hash) return;
    const id = location.hash.replace(/^#\/?/, "");
    if (!id) return;
    scrollWhenReady(id);
  }, [location.pathname, location.hash, scrollWhenReady]);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    cancelPolling();

    if (href.startsWith("/")) {
      void navigate(href);
      return;
    }
    const elementId = href.substring(1);
    if (location.pathname !== "/") {
      void navigate("/", { state: { scrollTo: elementId } });
    } else {
      scrollToSection(elementId);
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-paper/90 backdrop-blur-md border-b border-rule"
            : "bg-paper/70 backdrop-blur-sm border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo/Name */}
            <div className="flex-shrink-0">
              <a
                href="#home"
                className="group relative inline-block"
                onClick={(e) => handleNavClick(e, "#home")}
              >
                <span className="font-display text-2xl lg:text-3xl font-medium text-ink transition-colors duration-200">
                  Ryan Saperstein
                </span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-300"></span>
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative py-2 text-sm font-medium transition-colors duration-200 hover:text-accent group ${
                    isLinkActive(link) ? "text-accent" : "text-muted"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-accent transform origin-left transition-transform duration-300 ${
                      isLinkActive(link)
                        ? "scale-x-100"
                        : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  ></span>
                </a>
              ))}
            </nav>

            {/* Desktop CTA and Social Links */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <a
                  href="https://github.com/rmsap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted hover:text-accent transition-colors duration-200"
                  aria-label="GitHub"
                >
                  <Github size={20} />
                </a>
                <a
                  href="http://www.linkedin.com/in/ryansaperstein"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted hover:text-accent transition-colors duration-200"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
                <ThemeToggle />
              </div>
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, "#contact")}
                className="px-5 py-2.5 bg-accent text-paper font-medium rounded-md hover:opacity-90 transition-opacity duration-200"
              >
                Get in Touch
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-ink hover:text-accent hover:bg-surface transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden absolute top-full left-0 right-0 bg-paper/95 backdrop-blur-md border-b border-rule shadow-xl transition-all duration-300 transform ${
            isMobileMenuOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-full pointer-events-none"
          }`}
        >
          <nav className="px-4 py-6 space-y-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
                  isLinkActive(link)
                    ? "bg-accent-soft text-accent"
                    : "text-ink hover:bg-surface hover:text-accent"
                }`}
              >
                {link.label}
              </a>
            ))}

            <div className="pt-4 border-t border-rule">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <a
                  href="https://github.com/rmsap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted hover:text-accent transition-colors duration-200"
                  aria-label="GitHub"
                >
                  <Github size={24} />
                </a>
                <a
                  href="http://www.linkedin.com/in/ryansaperstein"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted hover:text-accent transition-colors duration-200"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={24} />
                </a>
                <ThemeToggle />
              </div>
              <a
                href="#contact"
                onClick={(e) => handleNavClick(e, "#contact")}
                className="block w-full px-6 py-3 bg-accent text-paper font-medium rounded-md hover:opacity-90 transition-opacity duration-200 text-center"
              >
                Get in Touch
              </a>
            </div>
          </nav>
        </div>
      </header>

      {isHomePage && (
        <div className="fixed left-6 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
          <nav className="flex flex-col items-center gap-4">
            {SIDEBAR_LINKS.map((link, i) => {
              const isActive =
                link.href === "#featured-posts"
                  ? displayActiveSection === "featured-posts"
                  : displayActiveSection === link.href.substring(1);
              const isHovered = hoveredDot === i;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className="relative flex items-center"
                  aria-label={link.label}
                  onMouseEnter={() => setHoveredDot(i)}
                  onMouseLeave={() => setHoveredDot(null)}
                >
                  {/* Tooltip */}
                  <span
                    className="absolute left-8 px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap pointer-events-none transition-all duration-200 bg-accent-soft text-accent border border-accent/30"
                    style={{
                      opacity: isHovered ? 1 : 0,
                      transform: isHovered
                        ? "translateX(0)"
                        : "translateX(-8px)",
                    }}
                  >
                    {link.label}
                  </span>

                  {/* Dot */}
                  <span
                    className="relative flex items-center justify-center transition-all duration-300"
                    style={{ width: 20, height: 20 }}
                  >
                    {/* Active ring */}
                    {isActive && (
                      <span
                        className="absolute rounded-full border-2 border-accent/40"
                        style={{ width: 20, height: 20 }}
                      />
                    )}
                    {/* Dot itself */}
                    <span
                      className={`rounded-full transition-all duration-300 ${
                        isActive
                          ? "bg-accent"
                          : isHovered
                            ? "bg-accent/60"
                            : "bg-accent/25"
                      }`}
                      style={{
                        width: isActive ? 10 : isHovered ? 8 : 6,
                        height: isActive ? 10 : isHovered ? 8 : 6,
                      }}
                    />
                  </span>
                </a>
              );
            })}
          </nav>
        </div>
      )}
    </>
  );
};

export default Header;
