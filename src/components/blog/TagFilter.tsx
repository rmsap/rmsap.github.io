interface Props {
  tags: string[];
  active: string | null;
  onSelect: (tag: string | null) => void;
}

export default function TagFilter({ tags, active, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2 my-4">
      <button
        onClick={() => onSelect(null)}
        className={`text-xs px-3 py-1 rounded-full border transition-colors ${
          active === null
            ? "border-purple-500 bg-purple-500/15 text-purple-400"
            : "border-gray-600 text-gray-400 hover:border-gray-400"
        }`}
      >
        All
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelect(active === tag ? null : tag)}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            active === tag
              ? "border-purple-500 bg-purple-500/15 text-purple-400"
              : "border-gray-600 text-gray-400 hover:border-gray-400"
          }`}
        >
          {tag.charAt(0).toUpperCase() + tag.slice(1)}
        </button>
      ))}
    </div>
  );
}
