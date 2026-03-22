import { useState, useEffect } from "react";
import type { BlogPostMeta } from "../../types/blog";

interface Props {
  posts: BlogPostMeta[];
  onFilter: (filtered: BlogPostMeta[]) => void;
}

export default function BlogSearch({ posts, onFilter }: Props) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      onFilter(posts);
      return;
    }
    onFilter(
      posts.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)),
      ),
    );
  }, [query, posts, onFilter]);

  return (
    <input
      type="text"
      placeholder="Search posts..."
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      className="w-full border rounded px-4 py-2 bg-transparent
                 placeholder-gray-500 focus:outline-none focus:border-blue-500
                 transition-colors"
    />
  );
}
