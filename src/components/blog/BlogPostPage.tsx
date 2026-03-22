import { useParams, Link } from "react-router-dom";
import { useEffect } from "react";
import { MDXProvider } from "@mdx-js/react";
import { getPostComponent, getAdjacentPosts } from "../../utils/blogLoader";
import { mdxComponents } from "./mdxComponents";
import TableOfContents from "./TableOfContents";
import ShareButtons from "./ShareButtons";
import PostReactions from "./PostReactions";
import PostNav from "./PostNav";
import PostHead from "./PostHead";
import PageTransition from "./PageTransition";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostComponent(slug) : null;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <h1 className="text-2xl mb-4">Post not found</h1>
        <Link to="/blog" className="text-purple-500 hover:underline">
          ← Back to blog
        </Link>
      </div>
    );
  }

  const { Component, meta } = post;
  const { prev, next } = getAdjacentPosts(meta.slug);

  return (
    <PageTransition>
      <PostHead post={meta} />
      <article className="max-w-4xl mx-auto py-12 px-4">
        <Link to="/blog" className="text-purple-500 hover:underline text-sm">
          ← Back to blog
        </Link>

        <header className="mt-4 mb-8">
          <h1 className="text-3xl font-bold mb-2">{meta.title}</h1>
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <time>{meta.date}</time>
            <span>·</span>
            <span>{meta.readingTime} min read</span>
          </div>
          {meta.tags.length > 0 && (
            <div className="flex gap-2 mt-2">
              {meta.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/blog?tag=${tag}`}
                  className="text-xs bg-gray-700 text-gray-200 px-2 py-1 rounded
                             hover:bg-gray-600 transition-colors"
                >
                  {tag.charAt(0).toUpperCase() + tag.slice(1)}
                </Link>
              ))}
            </div>
          )}
          <div className="mt-3">
            <ShareButtons title={meta.title} slug={meta.slug} />
          </div>
        </header>

        <div className="flex flex-col gap-10 lg:flex-row lg:gap-16">
          <main className="min-w-0 flex-1 order-2 lg:order-1">
            <div className="prose prose-invert max-w-none">
              <MDXProvider components={mdxComponents}>
                <Component />
              </MDXProvider>
            </div>

            <PostReactions postSlug={meta.slug} />

            <hr className="my-10 border-gray-700" />

            <PostNav prev={prev} next={next} />

            <section className="mt-10 rounded-xl border border-gray-700 bg-gray-800/30 p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-6">Discussion</h2>
              <CommentList postSlug={meta.slug} />
              <CommentForm postSlug={meta.slug} />
            </section>
          </main>

          <aside className="order-1 lg:order-2 w-full lg:w-52 shrink-0">
            <div className="lg:sticky lg:top-24">
              <TableOfContents />
            </div>
          </aside>
        </div>
      </article>
    </PageTransition>
  );
}
