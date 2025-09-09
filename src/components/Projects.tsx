import { useEffect, useState, useRef } from "react";
import {
  Github,
  ExternalLink,
  Trophy,
  ChevronLeft,
  ChevronRight,
  X,
  Globe,
  FileText,
  Play,
  Book,
} from "lucide-react";
import Carousel from "./Carousel";
import projectsData from "../data/projects.json";
import { PaginationDots } from "./PaginationDots";

interface WebLink {
  label: string;
  url: string;
  icon?: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  technologies: string[];
  images?: string[];
  captions?: (string | null)[];
  github?: string;
  live?: string;
  websites?: WebLink[];
  highlights: string[];
  date: string;
  featured?: boolean;
  award?: string;
}

function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState<Set<string>>(new Set());
  const [headerVisible, setHeaderVisible] = useState(false);
  const [otherProjectsVisible, setOtherProjectsVisible] = useState(false);

  const cardRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const headerRef = useRef<HTMLDivElement>(null);
  const otherProjectsRef = useRef<HTMLDivElement>(null);

  const projects: Project[] = projectsData;

  const featuredProjects = projects.filter((p) => p.featured);
  const otherProjects = projects.filter((p) => !p.featured);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(otherProjects.length / itemsPerPage);

  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-id");
            if (id === "header") {
              setHeaderVisible(true);
            } else if (id === "other-projects") {
              setOtherProjectsVisible(true);
            } else if (id) {
              setVisibleCards((prev) => new Set(prev).add(id));
            }
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    // Observe header
    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    // Observe other projects section
    if (otherProjectsRef.current) {
      observer.observe(otherProjectsRef.current);
    }

    // Observe cards
    Object.values(cardRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [featuredProjects.length]); // Re-run if projects change

  const nextPage = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const currentProjects = otherProjects.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage
  );

  const getLinkIcon = (icon?: string) => {
    switch (icon) {
      case "docs":
        return <FileText className="w-4 h-4" />;
      case "demo":
        return <Play className="w-4 h-4" />;
      case "api":
        return <Book className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  // Prevent scroll while project modal is open
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedProject]);

  return (
    <>
      <section
        id="projects"
        className="min-h-screen scroll-mt-20 pb-20 px-4 sm:px-6 lg:px-8 text-left"
      >
        <div className="max-w-7xl mx-auto">
          {/* Section Header with animation */}
          <div
            ref={headerRef}
            data-id="header"
            className={`text-center mb-16 transition-all duration-700 transform ${
              headerVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Featured Projects
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              From award-winning hackathon projects to production applications
              serving real users
            </p>
          </div>

          {/* Featured Projects Grid with staggered animations */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {featuredProjects.map((project, index) => (
              <div
                key={project.id}
                ref={(el) => {
                  cardRefs.current[project.id] = el;
                }}
                data-id={project.id}
                className={`group relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 cursor-pointer border border-gray-100 dark:border-gray-700 transform ${
                  visibleCards.has(project.id)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{
                  transitionDelay: visibleCards.has(project.id)
                    ? `${index * 100}ms`
                    : "0ms",
                }}
                onClick={() => setSelectedProject(project)}
              >
                {/* Project Image */}
                {project.images ? (
                  <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 overflow-hidden">
                    <img
                      src={project.images[0]}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ) : (
                  <div />
                )}

                {/* Award Badge */}
                {project.award && (
                  <div className="absolute top-4 right-4 bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    Award Winner
                  </div>
                )}

                {/* Project Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {project.title}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                      {project.date}
                    </span>
                  </div>

                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-md font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-md">
                        +{project.technologies.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Links */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {project.github && (
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Github className="w-4 h-4" />
                        Code
                      </a>
                    )}
                    {project.live && (
                      <a
                        href={project.live}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Live
                      </a>
                    )}
                    {project.websites?.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {getLinkIcon(link.icon)}
                        {link.label}
                      </a>
                    ))}
                    <span className="ml-auto text-sm text-purple-600 dark:text-purple-400 font-medium">
                      View Details →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Other Projects Section with animation */}
          <div
            ref={otherProjectsRef}
            data-id="other-projects"
            className={`border-t border-gray-200 dark:border-gray-700 pt-16 transition-all duration-700 transform ${
              otherProjectsVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h3 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
              Other Projects
            </h3>

            <div className="relative">
              <div className="grid md:grid-cols-3 gap-6">
                {currentProjects.map((project, index) => (
                  <div
                    key={project.id}
                    className={`bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-500 cursor-pointer transform ${
                      otherProjectsVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-4"
                    }`}
                    style={{
                      transitionDelay: otherProjectsVisible
                        ? `${(index + 1) * 100}ms`
                        : "0ms",
                    }}
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {project.title}
                      </h4>
                      {project.award && (
                        <Trophy className="w-4 h-4 text-yellow-500 flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-500">
                        {project.date}
                      </span>
                      <div className="flex gap-2">
                        {project.github && (
                          <Github className="w-4 h-4 text-gray-400" />
                        )}
                        {project.live && (
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        )}
                        {project.websites && project.websites.length > 0 && (
                          <Globe className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={prevPage}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <PaginationDots
                    total={totalPages}
                    current={currentIndex}
                    onSelect={setCurrentIndex}
                    className="flex gap-2"
                  />
                  <button
                    onClick={nextPage}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Project Modal (no animation needed here) */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedProject(null)}
        >
          {/* Modal content remains the same */}
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  {selectedProject.title}
                </h3>
                {selectedProject.award && (
                  <div className="inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-full text-sm font-medium">
                    <Trophy className="w-4 h-4" />
                    {selectedProject.award}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedProject(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {selectedProject.images ? (
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg overflow-hidden">
                  {selectedProject.images.length > 1 ? (
                    <Carousel
                      images={selectedProject.images}
                      captions={selectedProject.captions}
                      autoplay={false}
                    />
                  ) : (
                    <img
                      src={selectedProject.images[0]}
                      alt={selectedProject.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                </div>
              ) : (
                <div />
              )}

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Overview
                </h4>
                <p className="text-gray-600 dark:text-gray-300">
                  {selectedProject.longDescription}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Key Features
                </h4>
                <ul className="space-y-2">
                  {selectedProject.highlights.map((highlight, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">
                        {highlight}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Technologies Used
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                {selectedProject.github && (
                  <a
                    href={selectedProject.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Github className="w-5 h-5" />
                    View Code
                  </a>
                )}
                {selectedProject.live && (
                  <a
                    href={selectedProject.live}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    View Live
                  </a>
                )}
                {selectedProject.websites?.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {getLinkIcon(link.icon)}
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Projects;
