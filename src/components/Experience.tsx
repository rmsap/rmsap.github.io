import { useState, useEffect, useRef } from "react";
import { Building2, MapPin } from "lucide-react";
import experiencesData from "../data/experiences.json";

interface Experience {
  company: string;
  role: string;
  period: string;
  logo?: string;
  highlights: string[];
  location?: string;
  technologies?: string[];
}

function Experience() {
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const experiences: Experience[] = experiencesData;

  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  };

  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(
              entry.target.getAttribute("data-index") || "0"
            );
            setVisibleCards((prev) => new Set(prev).add(index));
          }
        });
      },
      {
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: "0px 0px -50px 0px", // Trigger slightly before fully in view
      }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="experience"
      className="scroll-mt-20 px-4 sm:px-6 lg:px-8 text-left"
    >
      <div className="mb-10">
        <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent text-center">
          Professional Experience
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {experiences.map((exp, index) => (
            <div
              key={index}
              ref={(el) => {
                cardRefs.current[index] = el;
              }}
              data-index={index}
              className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-700 transform ${
                visibleCards.has(index)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{
                transitionDelay: `${(index % 2) * 150}ms`, // Stagger left/right columns
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* Logo */}
                  <div className="flex-shrink-0">
                    {exp.logo && !imageErrors.has(index) ? (
                      <img
                        src={exp.logo}
                        alt={`${exp.company} logo`}
                        className="w-12 h-12 object-contain rounded-lg bg-gray-50 dark:bg-gray-700 p-1"
                        onError={() => handleImageError(index)}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    )}
                  </div>

                  {/* Company info */}
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">
                      {exp.company}
                    </h4>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                      {exp.role}
                    </p>
                    {exp.location && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {exp.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Period */}
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                  {exp.period}
                </span>
              </div>

              {/* Highlights */}
              <ul className="space-y-1 ml-16 mb-3">
                {exp.highlights.map((highlight, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-600 dark:text-gray-400 flex"
                  >
                    <span className="text-purple-600 dark:text-purple-400 mr-2 mt-0.5 flex-shrink-0">
                      •
                    </span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>

              {/* Technologies */}
              {exp.technologies && exp.technologies.length > 0 && (
                <div className="ml-16 pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex flex-wrap gap-1.5">
                    {exp.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md font-medium hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Experience;
