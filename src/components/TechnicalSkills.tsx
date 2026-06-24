import {
  Code2,
  MonitorSmartphone,
  Server,
  Cloud,
  Cpu,
  type LucideIcon,
} from "lucide-react";
import skillsData from "../data/skills.json";

interface Category {
  label: string;
  icon: string;
  items: string[];
}

const iconMap: Record<string, LucideIcon> = {
  Code2,
  MonitorSmartphone,
  Server,
  Cloud,
  Cpu,
};

function TechnicalSkills() {
  const categories: Category[] = skillsData.categories;

  // Every category uses the same quiet ruled tag; the accent only shows on hover.
  const tagClass =
    "border border-rule text-muted hover:border-accent/50 hover:text-accent";

  return (
    <section id="skills" className="scroll-mt-20 px-4 sm:px-6 lg:px-8">
      <div className="bg-surface border border-rule rounded-3xl p-8 lg:p-12">
        <h2 className="font-display text-4xl lg:text-5xl font-medium mb-8 text-ink text-center">
          Skills & Expertise
        </h2>
        <div className="space-y-6">
          {categories.map((category) => {
            const Icon = iconMap[category.icon];
            return (
              <div key={category.label}>
                <h3 className="font-semibold text-ink mb-3 flex items-center gap-2">
                  {Icon && <Icon className="w-5 h-5 text-accent" />}
                  {category.label}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {category.items.map((skill) => (
                    <span
                      key={skill}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors cursor-default ${tagClass}`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default TechnicalSkills;
