import React, { useState, useEffect } from "react";
import { Menu, X, Github, Linkedin, Mail } from "lucide-react";
import { useActiveSection } from "../hooks/useActiveSection";

interface NavLink {
  label: string;
  href: string;
  isActive?: boolean;
}

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks: NavLink[] = [
    { label: "Home", href: "#home" },
    { label: "Projects", href: "#projects" },
    { label: "Experience and Skills", href: "#experience" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  const sectionIds = navLinks.map((link) => link.href.substring(1));
  const activeSection = useActiveSection(sectionIds, 80); // 80px offset for header

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    console.log(href);
    e.preventDefault();
    const elementId = href.substring(1);
    setIsMobileMenuOpen(false);

    const element = document.getElementById(elementId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 dark:bg-[#242424]/95 backdrop-blur-md shadow-lg dark:shadow-gray-900/50"
            : "bg-white/80 dark:bg-[#242424]/80 backdrop-blur-sm"
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
                <span className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent hover:from-purple-700 hover:to-blue-700 dark:hover:from-purple-300 dark:hover:to-blue-300 transition-all duration-300">
                  Ryan Saperstein
                </span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 group-hover:w-full transition-all duration-300"></span>
              </a>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative py-2 text-sm font-medium transition-colors duration-300 hover:text-purple-600 group ${
                    activeSection === link.href.substring(1)
                      ? "text-purple-600"
                      : "text-[#646cff]"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 transform origin-left transition-transform duration-300 ${
                      activeSection === link.href.substring(1)
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
                  className="p-2 text-gray-600 hover:text-purple-600 transition-colors duration-300 hover:-translate-y-0.5 transform"
                  aria-label="GitHub"
                >
                  <Github size={20} />
                </a>
                <a
                  href="http://www.linkedin.com/in/ryansaperstein"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-600 hover:text-purple-600 transition-colors duration-300 hover:-translate-y-0.5 transform"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={20} />
                </a>
              </div>
              <a
                href="mailto:rmsaperstein@gmail.com"
                className="relative px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-full overflow-hidden group hover:shadow-lg transform transition-all duration-300 hover:-translate-y-0.5"
              >
                <span className="relative z-10">Get in Touch</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-700 hover:text-purple-600 hover:bg-gray-100 transition-colors duration-300"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden absolute top-full left-0 right-0 bg-white/95 dark:bg-[#242424]/95 backdrop-blur-md shadow-xl transition-all duration-300 transform ${
            isMobileMenuOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-full pointer-events-none"
          }`}
        >
          <nav className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`block px-4 py-3 text-base font-medium rounded-lg transition-all duration-300 ${
                  activeSection === link.href.substring(1)
                    ? "bg-gradient-to-r from-purple-50 to-blue-50 text-purple-600"
                    : "text-gray-700 hover:bg-gray-50 hover:text-purple-600"
                }`}
              >
                {link.label}
              </a>
            ))}

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <a
                  href="https://github.com/rmsap"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-600 hover:text-purple-600 transition-colors duration-300"
                  aria-label="GitHub"
                >
                  <Github size={24} />
                </a>
                <a
                  href="http://www.linkedin.com/in/ryansaperstein"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-600 hover:text-purple-600 transition-colors duration-300"
                  aria-label="LinkedIn"
                >
                  <Linkedin size={24} />
                </a>
                <a
                  href="mailto:rmsaperstein@gmail.com"
                  className="p-2 text-gray-600 hover:text-purple-600 transition-colors duration-300"
                  aria-label="Email"
                >
                  <Mail size={24} />
                </a>
              </div>
              <a
                href="mailto:rmsaperstein@gmail.com"
                className="block w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-full hover:shadow-lg transform transition-all duration-300 text-center"
              >
                Get in Touch
              </a>
            </div>
          </nav>
        </div>
      </header>

      {/* Side Navigation Progress Indicator - NEW */}
      <div className="fixed left-4 top-1/2 -translate-y-1/2 z-40 hidden lg:block">
        <nav className="flex flex-col gap-3 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full shadow-lg">
          {navLinks.map((link) => {
            const isActive = activeSection === link.href.substring(1);
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="group relative flex items-center"
                aria-label={link.label}
              >
                <span
                  className={`block transition-all duration-300 rounded-full ${
                    isActive
                      ? "w-8 h-2 bg-gradient-to-r from-purple-600 to-blue-600"
                      : "w-2 h-2 bg-gray-400 hover:bg-gray-600 hover:scale-125"
                  }`}
                />
                {/* Tooltip on hover */}
                <span
                  className={`absolute left-12 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap pointer-events-none transition-opacity duration-200 ${
                    isActive ? "opacity-0" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {link.label}
                </span>
              </a>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Header;
