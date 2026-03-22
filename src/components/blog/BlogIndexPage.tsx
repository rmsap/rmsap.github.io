import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Filter, ChevronDown } from "lucide-react";
import { getAllPosts, getAllTags } from "../../utils/blogLoader";
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
  const headerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [headerVisible, setHeaderVisible] = useState(false);
  const [visibleCards, setVisibleCards] = useState<Set<string>>(
    () => new Set(),
  );

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

  // Scroll animation: header and cards float in when in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-id");
            if (id === "blog-header") {
              setHeaderVisible(true);
            } else if (id) {
              setVisibleCards((prev) => new Set(prev).add(id));
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );
    if (headerRef.current) observer.observe(headerRef.current);
    Object.values(cardRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });
    return () => observer.disconnect();
  }, [visibleCount, displayPosts.length]);

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
        <title>Blog — Ryan Saperstein</title>
        <meta
          name="description"
          content="Thoughts on software engineering, React Native, and building products."
        />
      </Helmet>
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div
          ref={headerRef}
          data-id="blog-header"
          className={`transition-all duration-700 ${
            headerVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          <h1 className="text-3xl font-bold mb-2 pb-1 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Blog
          </h1>
          <p className="text-lg text-purple-400 font-medium mb-1">
            Notes to Self
          </p>
          <p className="text-gray-400 mb-5">
            Thoughts on software engineering, learning in public, and everything
            in between
          </p>

          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-4 rounded-lg border border-gray-600 bg-gray-800/30 px-4 py-3">
              <div className="min-w-0 flex-1">
                <BlogSearch posts={allPosts} onFilter={setSearchFiltered} />
              </div>
              <div className="relative shrink-0" ref={sortDropdownRef}>
                <button
                  type="button"
                  onClick={() => setSortDropdownOpen((open) => !open)}
                  className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg border border-gray-600 text-gray-400 hover:border-gray-400 hover:text-gray-300 transition-colors"
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
                    className="absolute right-0 top-full mt-1 min-w-[140px] py-1 rounded-lg border border-gray-600 bg-[#242424] shadow-lg z-10"
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
                            ? "bg-purple-500/15 text-purple-400"
                            : "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
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
                            ? "bg-purple-500/15 text-purple-400"
                            : "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
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
          <p className="text-gray-400 mt-6">No posts found.</p>
        )}

        {displayPosts.length > 0 && (
          <p className="text-sm text-gray-400 mt-4">
            Showing {postsToShow.length} of {displayPosts.length} posts
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-6 mt-6">
          {postsToShow.map((p, index) => (
            <Link
              key={p.slug}
              ref={(el) => {
                cardRefs.current[p.slug] = el;
              }}
              data-id={p.slug}
              to={`/blog/${p.slug}`}
              className={`block w-full lg:w-[calc(50%-0.75rem)] border rounded-lg overflow-hidden h-full flex flex-col transition-all duration-700 hover:-translate-y-1 ${
                visibleCards.has(p.slug)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              } ${tagAreaHoveredSlug === p.slug ? "border-gray-600" : "hover:border-purple-500 border-gray-600"}`}
              style={{
                transitionDelay: visibleCards.has(p.slug)
                  ? `${Math.min(index * 80, 400)}ms`
                  : "0ms",
              }}
            >
              <div className="aspect-video w-full bg-gray-700/50 shrink-0 overflow-hidden">
                {p.thumbnail ? (
                  <img
                    src={p.thumbnail}
                    alt=""
                    className="block w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-gray-500"
                    aria-hidden
                  >
                    <span className="text-4xl font-light">📄</span>
                  </div>
                )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h2 className="text-xl font-semibold mb-1">{p.title}</h2>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <time>{p.date}</time>
                  <span>·</span>
                  <span>{p.readingTime} min read</span>
                </div>
                <p className="mt-2 text-gray-300 line-clamp-2">
                  {p.description}
                </p>
                {p.tags.length > 0 && (
                  <div
                    className="flex flex-wrap gap-2 mt-3 w-fit"
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
                            ? "border-purple-500 bg-purple-500/15 text-purple-400"
                            : "border-gray-600 text-gray-400 hover:border-purple-500 hover:text-purple-400"
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
              className="px-6 py-2.5 rounded-lg border border-gray-600 text-gray-200 hover:border-purple-500 hover:text-purple-400 transition-colors"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
