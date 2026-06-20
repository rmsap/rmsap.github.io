import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Filter, ChevronDown } from "lucide-react";
import { getAllPosts, getAllTags } from "../../utils/blogLoader";
import { toManifestKey } from "../../utils/imageManifest";
import { SITE_NAME, BLOG_TITLE, BLOG_DESCRIPTION } from "../../constants/site";
import Image from "../Image";
import BlogSearch from "./BlogSearch";
import TagFilter from "./TagFilter";
import PageTransition from "./PageTransition";

const POSTS_PER_PAGE = 10;
type SortOrder = "newest" | "oldest";

export default function BlogIndex() {
  const allPosts = useMemo(() => getAllPosts(), []);
  const allTags = useMemo(() => getAllTags(), []);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTag = searchParams.get("tag");
  const [searchFiltered, setSearchFiltered] = useState(allPosts);
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
  const [tagAreaHoveredSlug, setTagAreaHoveredSlug] = useState<string | null>(
    null,
  );
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(e.target as Node)
      ) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Apply tag filter on top of search filter
  const filteredPosts = useMemo(() => {
    if (!activeTag) return searchFiltered;
    return searchFiltered.filter((p) => p.tags.includes(activeTag));
  }, [searchFiltered, activeTag]);

  // Sort by date (newest first or oldest first)
  const displayPosts = useMemo(() => {
    const sorted = [...filteredPosts].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    return sortOrder === "oldest" ? sorted.reverse() : sorted;
  }, [filteredPosts, sortOrder]);

  // Reset visible count when search, tag filter, or sort order changes
  useEffect(() => {
    setVisibleCount(POSTS_PER_PAGE);
  }, [displayPosts.length, activeTag, sortOrder]);

  const postsToShow = useMemo(
    () => displayPosts.slice(0, visibleCount),
    [displayPosts, visibleCount],
  );
  const hasMore = visibleCount < displayPosts.length;
  const loadMore = useCallback(() => {
    setVisibleCount((n) => Math.min(n + POSTS_PER_PAGE, displayPosts.length));
  }, [displayPosts.length]);

  // Infinite scroll: load more when sentinel enters viewport
  useEffect(() => {
    if (!hasMore) return;
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "100px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  return (
    <PageTransition>
      <Helmet>
        <title>{`${BLOG_TITLE} — ${SITE_NAME}`}</title>
        <meta name="description" content={BLOG_DESCRIPTION} />
      </Helmet>
      <div className="max-w-5xl mx-auto pt-24 pb-12 px-4">
        <div>
          <h1 className="text-3xl font-display font-medium mb-2 pb-1 text-ink">
            Blog
          </h1>
          <p className="text-lg text-accent font-medium mb-1">{BLOG_TITLE}</p>
          <p className="text-muted mb-5">{BLOG_DESCRIPTION}</p>

          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-4 rounded-lg border border-rule bg-surface px-4 py-3">
              <div className="min-w-0 flex-1">
                <BlogSearch posts={allPosts} onFilter={setSearchFiltered} />
              </div>
              <div className="relative shrink-0" ref={sortDropdownRef}>
                <button
                  type="button"
                  onClick={() => setSortDropdownOpen((open) => !open)}
                  className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border border-rule text-muted hover:border-accent/40 hover:text-ink transition-colors"
                  aria-expanded={sortDropdownOpen}
                  aria-haspopup="listbox"
                  aria-label="Sort posts"
                >
                  <Filter size={14} />
                  <span>
                    {sortOrder === "newest" ? "Newest first" : "Oldest first"}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${sortDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {sortDropdownOpen && (
                  <ul
                    className="absolute right-0 top-full mt-1 min-w-[140px] py-1 rounded-lg border border-rule bg-surface shadow-lg z-10"
                    role="listbox"
                  >
                    <li role="option" aria-selected={sortOrder === "newest"}>
                      <button
                        type="button"
                        onClick={() => {
                          setSortOrder("newest");
                          setSortDropdownOpen(false);
                        }}
                        className={`w-full text-left text-xs px-3 py-2 flex items-center gap-2 transition-colors ${
                          sortOrder === "newest"
                            ? "bg-accent-soft text-accent"
                            : "text-muted hover:bg-paper hover:text-ink"
                        }`}
                      >
                        Newest first
                      </button>
                    </li>
                    <li role="option" aria-selected={sortOrder === "oldest"}>
                      <button
                        type="button"
                        onClick={() => {
                          setSortOrder("oldest");
                          setSortDropdownOpen(false);
                        }}
                        className={`w-full text-left text-xs px-3 py-2 flex items-center gap-2 transition-colors ${
                          sortOrder === "oldest"
                            ? "bg-accent-soft text-accent"
                            : "text-muted hover:bg-paper hover:text-ink"
                        }`}
                      >
                        Oldest first
                      </button>
                    </li>
                  </ul>
                )}
              </div>
            </div>
            <TagFilter
              tags={allTags}
              active={activeTag}
              onSelect={(tag) => {
                if (tag) {
                  setSearchParams({ tag });
                } else {
                  setSearchParams({});
                }
              }}
            />
          </div>
        </div>

        {displayPosts.length === 0 && (
          <p className="text-muted mt-6">No posts found.</p>
        )}

        {displayPosts.length > 0 && (
          <p className="text-sm text-muted mt-4">
            Showing {postsToShow.length} of {displayPosts.length} posts
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 mt-6">
          {postsToShow.map((p, index) => (
            <Link
              key={p.slug}
              to={`/blog/${p.slug}`}
              className={`flex flex-col h-full border rounded-lg overflow-hidden transition-colors ${tagAreaHoveredSlug === p.slug ? "border-rule" : "hover:border-accent border-rule"}`}
            >
              <div className="aspect-video w-full bg-surface shrink-0 overflow-hidden">
                {p.thumbnail ? (
                  <Image
                    name={toManifestKey(p.thumbnail)}
                    fallbackSrc={p.thumbnail}
                    alt=""
                    priority={index === 0}
                    sizes="(max-width: 640px) 100vw, 480px"
                    className="block w-full h-full object-cover"
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
              <div className="p-5 flex flex-col flex-1">
                <h2 className="text-xl font-display font-medium mb-1 text-ink">
                  {p.title}
                </h2>
                <div className="flex items-center gap-3 text-sm text-muted">
                  <time>{p.date}</time>
                  <span>·</span>
                  <span>{p.readingTime} min read</span>
                </div>
                <p className="mt-2 text-muted line-clamp-2">{p.description}</p>
                {p.tags.length > 0 && (
                  <div
                    className="flex flex-wrap gap-2 mt-auto pt-3 w-fit"
                    onClick={(e) => e.stopPropagation()}
                    onMouseEnter={() => setTagAreaHoveredSlug(p.slug)}
                    onMouseLeave={() => setTagAreaHoveredSlug(null)}
                  >
                    {p.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSearchParams({ tag });
                        }}
                        className={`text-xs px-3 py-1 rounded-full border transition-colors text-left ${
                          activeTag === tag
                            ? "border-accent bg-accent-soft text-accent"
                            : "border-rule text-muted hover:border-accent hover:text-accent"
                        }`}
                      >
                        {tag.charAt(0).toUpperCase() + tag.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {hasMore && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <div ref={loadMoreRef} className="h-1 w-full" aria-hidden />
            <button
              type="button"
              onClick={loadMore}
              className="px-6 py-2.5 rounded-lg border border-rule text-ink hover:border-accent hover:text-accent transition-colors"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
