import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  colorClass: string;
}

function StatsCard({
  icon: IconComponent,
  value,
  label,
  colorClass,
}: StatsCardProps) {
  return (
    <div className="bg-surface rounded-xl p-4 border border-rule hover:border-accent/40 hover:-translate-y-1 transition-all duration-300">
      <IconComponent className={`w-8 h-8 ${colorClass} mb-2`} />
      <p className="font-display text-2xl font-medium text-ink">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

export default StatsCard;
