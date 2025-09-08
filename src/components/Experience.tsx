import experiencesData from "../data/experiences.json";

function Experience() {
  return (
    <section
      id="experience"
      className="scroll-mt-20 px-4 sm:px-6 lg:px-8 text-left"
    >
      <div className="mb-10">
        <h2 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent text-center">
          Professional Experience
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {experiencesData.map((exp, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100">
                    {exp.company}
                  </h4>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                    {exp.role}
                  </p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                  {exp.period}
                </span>
              </div>
              <ul className="space-y-1">
                {exp.highlights.map((highlight, i) => (
                  <li
                    key={i}
                    className="text-sm text-gray-600 dark:text-gray-400 flex items-start"
                  >
                    <span className="text-purple-600 dark:text-purple-400 mr-2">
                      •
                    </span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Experience;
