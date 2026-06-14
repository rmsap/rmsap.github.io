import { BookOpen, ChefHat, Music, Film } from "lucide-react";
import interestsData from "../../data/interests.json";

const iconMap = {
  BookOpen: BookOpen,
  ChefHat: ChefHat,
  Music: Music,
  Film: Film,
};

function Interests() {
  return (
    <div className="bg-surface rounded-3xl p-8 lg:p-12 border border-rule">
      <h3 className="font-display text-2xl font-medium text-center mb-10 text-ink">
        Beyond the Code
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {interestsData.map((interest, index) => {
          const IconComponent = iconMap[interest.icon as keyof typeof iconMap];
          return (
            <div
              key={index}
              className="bg-paper rounded-xl p-6 border border-rule hover:border-accent/40 transition-colors"
            >
              <IconComponent className="w-8 h-8 text-accent mb-3" />
              <h4 className="font-semibold text-ink mb-2">
                {interest.category}
              </h4>
              <ul className="space-y-1">
                {interest.items.map((item, i) => (
                  <li key={i} className="text-sm text-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Interests;
