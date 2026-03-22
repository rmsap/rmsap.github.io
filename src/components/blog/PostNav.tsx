import { Link } from "react-router-dom";
import type { BlogPostMeta } from "../../types/blog";

interface Props {
  prev: BlogPostMeta | null;
  next: BlogPostMeta | null;
}

export default function PostNav({ prev, next }: Props) {
  if (!prev && !next) return null;
  return (
    <nav className="flex justify-between items-stretch gap-4 my-10">
      {prev ? (
        <Link
          to={`/blog/${prev.slug}`}
          className="flex-1 border rounded p-4 hover:border-blue-500 transition-colors text-left"
        >
          <span className="text-xs text-gray-400">← Older</span>
          <p className="font-medium mt-1">{prev.title}</p>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
      {next ? (
        <Link
          to={`/blog/${next.slug}`}
          className="flex-1 border rounded p-4 hover:border-blue-500 transition-colors text-right"
        >
          <span className="text-xs text-gray-400">Newer →</span>
          <p className="font-medium mt-1">{next.title}</p>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
}
