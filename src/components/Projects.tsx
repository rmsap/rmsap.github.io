import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
import Media from "./Media";
import { toManifestKey } from "../utils/imageManifest";
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
  // Which grid card is hovered — video cards only autoplay on hover so a grid
  // full of clips doesn't decode them all at once. Touch users (no hover) get
  // the poster and play in the modal instead.
  const [hoveredProjectId, setHoveredProjectId] = useState<string | null>(null);

  const projects: Project[] = projectsData;

  const featuredProjects = projects.filter((p) => p.featured);
  const otherProjects = projects.filter((p) => !p.featured);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(otherProjects.length / itemsPerPage);

  const nextPage = () => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const currentProjects = otherProjects.slice(
    currentIndex * itemsPerPage,
    (currentIndex + 1) * itemsPerPage,
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
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl lg:text-5xl font-medium mb-6 text-ink">
              Featured Projects
            </h2>
            <p className="text-lg text-muted max-w-2xl mx-auto">
              From award-winning hackathon projects to production applications
              serving real users
            </p>
          </div>

          {/* Featured Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {featuredProjects.map((project) => (
              <div
                key={project.id}
                className="group relative bg-surface rounded-xl overflow-hidden border border-rule hover:border-accent/40 transition-colors cursor-pointer"
                onClick={() => {
                  // Clear the hover state when opening the modal: the modal
                  // covers the card without moving the pointer, so onMouseLeave
                  // won't fire, and a stale hovered id would auto-resume the
                  // grid clip on modal close even though the user never
                  // re-hovered. The modal renders its own <Media> meanwhile.
                  setHoveredProjectId(null);
                  setSelectedProject(project);
                }}
                onMouseEnter={() => setHoveredProjectId(project.id)}
                onMouseLeave={() => setHoveredProjectId(null)}
              >
                {/* Project Image */}
                {project.images ? (
                  <div className="aspect-video bg-accent-soft overflow-hidden">
                    <Media
                      name={toManifestKey(project.images[0])}
                      fallbackSrc={project.images[0]}
                      alt={project.title}
                      // Don't keep a grid clip playing once a modal is open —
                      // the modal renders its own <Media> for the same source,
                      // so this would decode the clip twice.
                      active={
                        hoveredProjectId === project.id && !selectedProject
                      }
                      // The whole card is the click target (it opens the modal),
                      // so don't let a reduced-motion clip show controls that
                      // would swallow that click — show the poster instead and
                      // let users play it in the modal.
                      allowControls={false}
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
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
                  <div className="absolute top-4 right-4 bg-accent text-paper px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    Award Winner
                  </div>
                )}

                {/* Project Info */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold text-ink group-hover:text-accent transition-colors">
                      {project.title}
                    </h3>
                    <span className="text-xs text-muted whitespace-nowrap ml-2">
                      {project.date}
                    </span>
                  </div>

                  <p className="text-muted mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.slice(0, 3).map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 bg-accent-soft text-accent text-xs rounded-md font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 3 && (
                      <span className="px-2 py-1 border border-rule text-muted text-xs rounded-md">
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
                        className="flex items-center gap-1 text-sm text-muted hover:text-accent transition-colors"
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
                        className="flex items-center gap-1 text-sm text-muted hover:text-accent transition-colors"
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
                        className="flex items-center gap-1 text-sm text-muted hover:text-accent transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {getLinkIcon(link.icon)}
                        {link.label}
                      </a>
                    ))}
                    <span className="ml-auto text-sm text-accent font-medium">
                      View Details →
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Other Projects Section */}
          <div className="border-t border-rule pt-16">
            <h3 className="font-display text-2xl font-medium text-center mb-8 text-ink">
              Other Projects
            </h3>

            <div className="relative">
              <div className="grid md:grid-cols-3 gap-6">
                {currentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-surface border border-rule rounded-lg p-6 hover:border-accent/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-ink">
                        {project.title}
                      </h4>
                      {project.award && (
                        <Trophy className="w-4 h-4 text-accent flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <p className="text-sm text-muted mb-3 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">{project.date}</span>
                      <div className="flex gap-2">
                        {project.github && (
                          <Github className="w-4 h-4 text-muted" />
                        )}
                        {project.live && (
                          <ExternalLink className="w-4 h-4 text-muted" />
                        )}
                        {project.websites && project.websites.length > 0 && (
                          <Globe className="w-4 h-4 text-muted" />
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
                    className="p-2 rounded-full border border-rule text-muted hover:text-accent hover:border-accent/50 transition-colors"
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
                    className="p-2 rounded-full border border-rule text-muted hover:text-accent hover:border-accent/50 transition-colors"
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
      {selectedProject &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] overflow-y-auto bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedProject(null)}
          >
            <div className="flex min-h-full items-center justify-center p-4">
              <div
                className="bg-surface border border-rule rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="sticky top-0 bg-surface border-b border-rule p-6 flex items-start justify-between">
                  <div>
                    <h3 className="font-display text-2xl font-medium text-ink mb-2">
                      {selectedProject.title}
                    </h3>
                    {selectedProject.award && (
                      <div className="inline-flex items-center gap-2 bg-accent-soft text-accent px-3 py-1 rounded-full text-sm font-medium">
                        <Trophy className="w-4 h-4" />
                        {selectedProject.award}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProject(null);
                    }}
                    className="p-2 text-muted hover:text-ink hover:bg-paper rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {selectedProject.images ? (
                    <div className="aspect-video bg-accent-soft rounded-lg overflow-hidden">
                      {selectedProject.images.length > 1 ? (
                        <Carousel
                          images={selectedProject.images}
                          captions={selectedProject.captions}
                          autoplay={false}
                        />
                      ) : (
                        <Media
                          name={toManifestKey(selectedProject.images[0])}
                          fallbackSrc={selectedProject.images[0]}
                          alt={selectedProject.title}
                          priority
                          sizes="(max-width: 768px) 100vw, 768px"
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
                    <h4 className="font-semibold text-ink mb-2">Overview</h4>
                    <p className="text-muted">
                      {selectedProject.longDescription}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-ink mb-3">
                      Key Features
                    </h4>
                    <ul className="space-y-2">
                      {selectedProject.highlights.map((highlight, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                          <span className="text-muted">{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-ink mb-3">
                      Technologies Used
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 bg-accent-soft text-accent rounded-md font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4 border-t border-rule">
                    {selectedProject.github && (
                      <a
                        href={selectedProject.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-ink text-paper rounded-lg hover:opacity-90 transition-opacity"
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
                        className="flex items-center gap-2 px-4 py-2 bg-accent text-paper rounded-lg hover:opacity-90 transition-opacity"
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
                        className="flex items-center gap-2 px-4 py-2 border border-ink text-ink rounded-lg hover:bg-ink hover:text-paper transition-colors"
                      >
                        {getLinkIcon(link.icon)}
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

export default Projects;
