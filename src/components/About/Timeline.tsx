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
      <h3 className="font-display text-xl font-medium text-ink mb-4">
        My Journey
      </h3>
      <div className="relative">
        <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-accent/30" />

        <div className="space-y-3 relative">
          {events.map((step, index) => {
            const IconComponent = iconMap[step.icon];
            return (
              <div key={index} className="flex items-start space-x-4 group">
                <div className="flex-shrink-0 relative">
                  <div className="w-10 h-10 bg-surface rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform border border-accent/40">
                    <IconComponent className="w-5 h-5 text-accent" />
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-ink">{step.title}</h4>
                  <p className="text-sm text-muted">{step.description}</p>
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
