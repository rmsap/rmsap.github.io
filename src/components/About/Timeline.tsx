import {
  Cpu,
  Briefcase,
  GraduationCap,
  Rocket,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Rocket,
  Cpu,
  GraduationCap,
  Briefcase,
};

interface Step {
  icon: string;
  title: string;
  description: string;
}

interface TimelineProps {
  events: Step[];
}

function Timeline({ events }: TimelineProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        My Journey
      </h3>
      <div className="relative">
        <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-gradient-to-b from-purple-300 to-blue-300 dark:from-purple-700 dark:to-blue-700" />

        <div className="space-y-3 relative">
          {events.map((step, index) => {
            const IconComponent = iconMap[step.icon];
            return (
              <div key={index} className="flex items-start space-x-4 group">
                <div className="flex-shrink-0 relative">
                  <div className="w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform border-2 border-purple-300 dark:border-purple-700">
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
    </div>
  );
}

export default Timeline;
