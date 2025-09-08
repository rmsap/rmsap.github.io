import {
  Cpu,
  Briefcase,
  GraduationCap,
  Rocket,
  Award,
  Users,
} from "lucide-react";
import Interests from "./Interests";
import StatsCard from "./StatsCard";
import aboutData from "../../data/aboutData.json";
import Timeline from "./Timeline";
import TraitsList from "./TraitsList";

// Map icon names to actual components
const iconMap = {
  Rocket: Rocket,
  Cpu: Cpu,
  GraduationCap: GraduationCap,
  Briefcase: Briefcase,
  Award: Award,
  Users: Users,
};

function About() {
  const { header, profile, stats, bio, journey, traits } = aboutData;

  return (
    <section
      id="about"
      className="min-h-screen scroll-mt-10 py-10 px-4 sm:px-6 lg:px-8 text-left"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
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
          <div className="order-2 lg:order-1 space-y-8">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <img
                className="relative rounded-3xl w-full max-w-md mx-auto lg:mx-0 shadow-xl"
                src={profile.image}
                alt={profile.imageAlt}
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat) => (
                <StatsCard
                  icon={iconMap[stat.icon as keyof typeof iconMap]}
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
          <div className="order-1 lg:order-2 space-y-8">
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
        <Interests />
        <TraitsList traits={traits} />
      </div>
    </section>
  );
}

export default About;
