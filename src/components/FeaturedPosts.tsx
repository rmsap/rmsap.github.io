import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getAllPosts } from "../utils/blogLoader";
import type { BlogPostMeta } from "../types/blog";

const FEATURED_COUNT = 3;

function PostCard({ post }: { post: BlogPostMeta }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      className="group flex flex-col h-full rounded-xl overflow-hidden border border-rule bg-surface hover:border-accent/50 transition-all duration-300 w-full"
    >
      <div className="aspect-video w-full bg-paper shrink-0 overflow-hidden">
        {post.thumbnail ? (
          <img
            src={post.thumbnail}
            alt=""
            className="block w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-muted"
            aria-hidden
          >
            <span className="text-4xl font-light">📄</span>
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1 text-left">
        <h3 className="text-xl font-semibold text-ink group-hover:text-accent transition-colors mb-1">
          {post.title}
        </h3>
        <div className="flex items-center gap-3 text-sm text-muted">
          <time>{post.date}</time>
          <span>·</span>
          <span>{post.readingTime} min read</span>
        </div>
        <p className="mt-2 text-muted line-clamp-2">{post.description}</p>
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full border border-rule text-muted"
              >
                {tag.charAt(0).toUpperCase() + tag.slice(1)}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export default function FeaturedPosts() {
  const [activeIndex, setActiveIndex] = useState(0);
  const featuredPosts = useMemo(
    () => getAllPosts().slice(0, FEATURED_COUNT),
    [],
  );

  if (featuredPosts.length === 0) return null;

  const total = featuredPosts.length;

  function prev() {
    setActiveIndex((i) => (i - 1 + total) % total);
  }
  function next() {
    setActiveIndex((i) => (i + 1) % total);
  }

  // Compute per-card style based on offset from active index
  function getCardStyle(index: number) {
    let offset = index - activeIndex;
    // Wrap around for circular feel
    if (offset > Math.floor(total / 2)) offset -= total;
    if (offset < -Math.floor(total / 2)) offset += total;

    const isFocused = offset === 0;
    const absOffset = Math.abs(offset);

    return {
      transform: `translateX(${offset * 65}%) scale(${isFocused ? 1 : 0.85})`,
      zIndex: total - absOffset,
      opacity: isFocused ? 1 : 0.5,
      filter: isFocused ? "none" : "brightness(0.7)",
      pointerEvents: (isFocused
        ? "auto"
        : "none") as React.CSSProperties["pointerEvents"],
    };
  }

  return (
    <section
      id="featured-posts"
      className="min-h-0 scroll-mt-20 pb-20 px-4 sm:px-6 lg:px-8 text-center overflow-x-clip"
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <div className="text-center mb-12 w-full">
          <h2 className="font-display text-4xl lg:text-5xl font-medium mb-6 text-ink">
            Featured Posts
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Latest writing on software, product, and building in public
          </p>
        </div>

        <div className="relative w-full max-w-4xl flex justify-center">
          <div
            className="relative w-[85vw] sm:w-[400px] mx-auto"
            style={{ aspectRatio: "auto" }}
            role="region"
            aria-label="Featured blog posts carousel"
          >
            {featuredPosts.map((post, index) => (
              <div
                key={post.slug}
                className="absolute inset-0 transition-all duration-500 ease-in-out"
                style={getCardStyle(index)}
              >
                <PostCard post={post} />
              </div>
            ))}
            {/* Invisible spacer so the container has height */}
            <div className="invisible">
              <PostCard post={featuredPosts[0]} />
            </div>
          </div>

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 w-10 h-10 rounded-full bg-surface border border-rule shadow-lg flex items-center justify-center text-muted hover:text-accent hover:border-accent/50 transition-colors z-10"
                aria-label="Previous post"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 w-10 h-10 rounded-full bg-surface border border-rule shadow-lg flex items-center justify-center text-muted hover:text-accent hover:border-accent/50 transition-colors z-10"
                aria-label="Next post"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-accent font-medium hover:underline"
          >
            View all posts
            <ChevronRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
