import { useState } from "react";
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
  const experiences: Experience[] = experiencesData;

  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  };

  return (
    <section
      id="experience"
      className="scroll-mt-20 px-4 sm:px-6 lg:px-8 text-left"
    >
      <div className="mb-10">
        <h2 className="font-display text-4xl lg:text-5xl font-medium mb-6 text-ink text-center">
          Professional Experience
        </h2>
        <div className="max-w-3xl mx-auto space-y-6">
          {experiences.map((exp, index) => (
            <div
              key={index}
              className="bg-surface rounded-xl p-6 border border-rule hover:border-accent/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                  {/* Logo */}
                  <div className="flex-shrink-0">
                    {exp.logo && !imageErrors.has(index) ? (
                      <img
                        src={exp.logo}
                        alt={`${exp.company} logo`}
                        className="w-12 h-12 object-contain rounded-lg bg-paper p-1"
                        loading="lazy"
                        decoding="async"
                        onError={() => handleImageError(index)}
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-accent-soft flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-accent" />
                      </div>
                    )}
                  </div>

                  {/* Company info */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-ink">{exp.company}</h4>
                    <p className="text-sm text-accent font-medium">
                      {exp.role}
                    </p>
                    {exp.location && (
                      <p className="text-xs text-muted flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {exp.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Period */}
                <span className="text-xs text-muted whitespace-nowrap ml-4">
                  {exp.period}
                </span>
              </div>

              {/* Highlights */}
              <ul className="space-y-1 ml-16 mb-3">
                {exp.highlights.map((highlight, i) => (
                  <li key={i} className="text-sm text-muted flex">
                    <span className="text-accent mr-2 mt-0.5 flex-shrink-0">
                      •
                    </span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>

              {/* Technologies */}
              {exp.technologies && exp.technologies.length > 0 && (
                <div className="ml-16 pt-3 border-t border-rule">
                  <div className="flex flex-wrap gap-1.5">
                    {exp.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 text-xs border border-rule text-muted rounded-md font-medium hover:border-accent/50 hover:text-accent transition-colors"
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
