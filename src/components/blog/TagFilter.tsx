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
            ? "border-accent bg-accent text-paper"
            : "border-rule text-muted hover:border-accent/40"
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
              ? "border-accent bg-accent text-paper"
              : "border-rule text-muted hover:border-accent/40"
          }`}
        >
          {tag.charAt(0).toUpperCase() + tag.slice(1)}
        </button>
      ))}
    </div>
  );
}
