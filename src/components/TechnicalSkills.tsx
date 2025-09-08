import skillsData from "../data/skills.json";

function TechnicalSkills() {
  const { skills } = skillsData;

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-3xl p-8 lg:p-12">
      <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent text-center">
        Technical Skills
      </h2>
      <div className="space-y-6">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Proficient
          </h4>
          <div className="flex flex-wrap gap-2">
            {skills.proficient.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Familiar
          </h4>
          <div className="flex flex-wrap gap-2">
            {skills.familiar.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Learning & Interested
          </h4>
          <div className="flex flex-wrap gap-2">
            {skills.interested.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TechnicalSkills;
