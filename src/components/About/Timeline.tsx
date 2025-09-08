import { Cpu, Briefcase, GraduationCap, Rocket } from "lucide-react";

const iconMap = {
  Rocket: Rocket,
  Cpu: Cpu,
  GraduationCap: GraduationCap,
  Briefcase: Briefcase,
};

function Timeline({ events }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        My Journey
      </h3>
      <div className="space-y-3">
        {events.map((step, index) => {
          const IconComponent = iconMap[step.icon];
          return (
            <div key={index} className="flex items-start space-x-4 group">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <IconComponent className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                  {step.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Timeline;
