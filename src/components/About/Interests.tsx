import { BookOpen, ChefHat, Music, Film } from "lucide-react";
import interestsData from "../../data/interests.json";

// Map icon names to actual components
const iconMap = {
  BookOpen: BookOpen,
  ChefHat: ChefHat,
  Music: Music,
  Film: Film,
};

function Interests() {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 rounded-3xl p-8 lg:p-12 border border-purple-100 dark:border-purple-800">
      <h3 className="text-2xl font-bold text-center mb-10 text-gray-900 dark:text-gray-100">
        Beyond the Code
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {interestsData.map((interest, index) => {
          const IconComponent = iconMap[interest.icon as keyof typeof iconMap];
          return (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <IconComponent className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {interest.category}
              </h4>
              <ul className="space-y-1">
                {interest.items.map((item, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
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
