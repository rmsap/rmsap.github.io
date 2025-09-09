import { useState, useEffect, useRef } from "react";
import {
  Cpu,
  Briefcase,
  GraduationCap,
  Rocket,
  Award,
  Users,
  type LucideIcon,
} from "lucide-react";
import Interests from "./Interests";
import StatsCard from "./StatsCard";
import aboutData from "../../data/aboutData.json";
import Timeline from "./Timeline";

export type IconName =
  | "Rocket"
  | "Cpu"
  | "GraduationCap"
  | "Briefcase"
  | "Award"
  | "Users";

const iconMap: Record<IconName, LucideIcon> = {
  Rocket,
  Cpu,
  GraduationCap,
  Briefcase,
  Award,
  Users,
};

function About() {
  const { header, profile, stats, bio, journey } = aboutData;
  const [visibleSections, setVisibleSections] = useState<Set<string>>(
    new Set()
  );
  const sectionRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-section");
            if (id) setVisibleSections((prev) => new Set(prev).add(id));
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    Object.values(sectionRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      className="min-h-screen scroll-mt-10 py-10 px-4 sm:px-6 lg:px-8 text-left"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div
          ref={(el) => {
            sectionRefs.current["header"] = el;
          }}
          data-section="header"
          className={`text-center mb-16 transition-all duration-700 ${
            visibleSections.has("header")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {header.title}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {header.subtitle}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-20">
          {/* Left Column - Photo and Quick Stats */}
          <div
            ref={(el) => {
              sectionRefs.current["profile"] = el;
            }}
            data-section="profile"
            className={`order-2 lg:order-1 space-y-8 transition-all duration-700 ${
              visibleSections.has("profile")
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-8"
            }`}
            style={{ transitionDelay: "200ms" }}
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <img
                className="relative rounded-3xl w-full max-w-md mx-auto lg:mx-0 shadow-xl"
                src={profile.image}
                alt={profile.imageAlt}
                loading="lazy"
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <StatsCard
                  key={stat.label}
                  icon={iconMap[stat.icon as IconName]}
                  value={stat.value}
                  label={stat.label}
                  colorClass={
                    stat.color === "purple"
                      ? "text-purple-600"
                      : "text-blue-600"
                  }
                />
              ))}
            </div>
          </div>

          {/* Right Column - Bio and Journey */}
          <div
            ref={(el) => {
              sectionRefs.current["bio"] = el;
            }}
            data-section="bio"
            className={`order-1 lg:order-2 space-y-8 transition-all duration-700 ${
              visibleSections.has("bio")
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8"
            }`}
            style={{ transitionDelay: "400ms" }}
          >
            {/* Main Bio */}
            <div className="prose prose-lg dark:prose-invert max-w-none">
              {bio.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg"
                >
                  {paragraph}
                </p>
              ))}
            </div>
            <Timeline events={journey} />
          </div>
        </div>

        <div
          ref={(el) => {
            sectionRefs.current["interests"] = el;
          }}
          data-section="interests"
          className={`transition-all duration-700 ${
            visibleSections.has("interests")
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <Interests />
        </div>
      </div>
    </section>
  );
}

export default About;
