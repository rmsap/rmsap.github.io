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
          i === current ? "w-8 bg-accent" : "w-2 bg-muted/50 hover:bg-muted"
        }`}
        aria-label={`Go to page ${i + 1}`}
      />
    ))}
  </div>
);
