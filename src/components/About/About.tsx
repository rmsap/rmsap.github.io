import {
  Cpu,
  Briefcase,
  GraduationCap,
  Rocket,
  Award,
  Users,
  Code2,
  Smartphone,
  PenLine,
  type LucideIcon,
} from "lucide-react";
import Interests from "./Interests";
import StatsCard from "./StatsCard";
import aboutData from "../../data/aboutData.json";
import Timeline from "./Timeline";
import { getAllPosts } from "../../utils/blogLoader";

export type IconName =
  | "Rocket"
  | "Cpu"
  | "GraduationCap"
  | "Briefcase"
  | "Award"
  | "Users"
  | "Code2"
  | "Smartphone"
  | "PenLine";

const iconMap: Record<IconName, LucideIcon> = {
  Rocket,
  Cpu,
  GraduationCap,
  Briefcase,
  Award,
  Users,
  Code2,
  Smartphone,
  PenLine,
};

function About() {
  const { header, profile, stats, bio, journey } = aboutData;
  // Blog-post count is derived from the posts themselves so it never goes stale.
  const postCount = getAllPosts().length;

  return (
    <section
      id="about"
      className="min-h-screen scroll-mt-10 py-10 px-4 sm:px-6 lg:px-8 text-left"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl lg:text-5xl font-medium mb-6 text-ink">
            {header.title}
          </h2>
          <p className="text-lg text-muted max-w-3xl mx-auto">
            {header.subtitle}
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start mb-20">
          {/* Left Column - Photo and Quick Stats */}
          <div className="order-2 lg:order-1 space-y-8">
            <div className="relative w-full max-w-md mx-auto lg:mx-0">
              <div className="absolute -bottom-4 -right-4 w-full h-full rounded-3xl border border-accent/40"></div>
              <img
                className="relative rounded-3xl w-full shadow-xl"
                src={profile.image}
                alt={profile.imageAlt}
                loading="lazy"
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              {stats.map((stat) => (
                <StatsCard
                  key={stat.label}
                  icon={iconMap[stat.icon as IconName]}
                  value={
                    stat.label === "Blog Posts" ? String(postCount) : stat.value
                  }
                  label={stat.label}
                  colorClass="text-accent"
                />
              ))}
            </div>
          </div>

          {/* Right Column - Bio and Journey */}
          <div className="order-1 lg:order-2 space-y-8">
            {/* Main Bio */}
            <div className="prose max-w-none">
              {bio.map((paragraph, index) => (
                <p key={index} className="text-ink leading-relaxed text-lg">
                  {paragraph}
                </p>
              ))}
            </div>
            <Timeline events={journey} />
          </div>
        </div>

        <Interests />
      </div>
    </section>
  );
}

export default About;
