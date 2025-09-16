import { useState, useEffect, useRef } from "react";
import { Star, TrendingUp, Lightbulb, Users } from "lucide-react";
import skillsData from "../data/skills.json";

interface SkillsData {
  proficient: string[];
  familiar: string[];
  interested: string[];
  soft: string[];
}

function TechnicalSkills() {
  const skills: SkillsData = skillsData;
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Scroll animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const categories = [
    {
      title: "Proficient",
      skills: skills.proficient,
      icon: Star,
      colorClasses:
        "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/40",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Familiar",
      skills: skills.familiar,
      icon: TrendingUp,
      colorClasses:
        "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/40",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Learning & Interested",
      skills: skills.interested,
      icon: Lightbulb,
      colorClasses:
        "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600",
      iconColor: "text-gray-600 dark:text-gray-400",
    },
    {
      title: "Soft Skills",
      skills: skills.soft,
      icon: Users,
      colorClasses:
        "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/40",
      iconColor: "text-green-600 dark:text-green-400",
    },
  ];

  return (
    <section id="skills" className="scroll-mt-20 px-4 sm:px-6 lg:px-8">
      <div
        ref={sectionRef}
        className={`bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-3xl p-8 lg:p-12 transition-all duration-700 transform ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h2 className="text-4xl lg:text-5xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent text-center">
          Skills & Expertise
        </h2>
        <div className="space-y-6">
          {categories.map((category, categoryIndex) => {
            const Icon = category.icon;
            return (
              <div
                key={category.title}
                className={`transition-all duration-700 transform ${
                  isVisible
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-8"
                }`}
                style={{
                  transitionDelay: isVisible
                    ? `${(categoryIndex + 1) * 150}ms`
                    : "0ms",
                }}
              >
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${category.iconColor}`} />
                  {category.title}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {category.skills.map((skill, index) => (
                    <span
                      key={skill}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 cursor-default transform hover:scale-105 ${
                        category.colorClasses
                      } ${isVisible ? "opacity-100" : "opacity-0"}`}
                      style={{
                        transitionDelay: isVisible
                          ? `${(categoryIndex + 1) * 150 + index * 30}ms`
                          : "0ms",
                      }}
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
