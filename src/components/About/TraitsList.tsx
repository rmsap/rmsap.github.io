interface TraitsListProps {
  traits: string[];
}

function TraitsList({ traits }: TraitsListProps) {
  return (
    <div className="mt-16 text-center">
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {traits.map((trait) => (
          <span
            key={trait}
            className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300 shadow-md border border-gray-200 dark:border-gray-700"
          >
            {trait}
          </span>
        ))}
      </div>
    </div>
  );
}

export default TraitsList;
