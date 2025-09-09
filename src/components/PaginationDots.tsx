interface PaginationDotsProps {
  total: number;
  current: number;
  onSelect: (index: number) => void;
  className?: string;
}

export const PaginationDots: React.FC<PaginationDotsProps> = ({
  total,
  current,
  onSelect,
  className,
}) => (
  <div className={`flex gap-2 ${className}`}>
    {Array.from({ length: total }).map((_, i) => (
      <button
        key={i}
        onClick={() => onSelect(i)}
        className={`h-2 rounded-full transition-all ${
          i === current
            ? "w-8 bg-purple-600"
            : "w-2 bg-gray-400 hover:bg-gray-500"
        }`}
        aria-label={`Go to page ${i + 1}`}
      />
    ))}
  </div>
);
