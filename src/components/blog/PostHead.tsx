import { Helmet } from "react-helmet-async";
import type { BlogPostMeta } from "../../types/blog";
import { SITE_URL, SITE_NAME } from "../../constants/site";

interface Props {
  post: BlogPostMeta;
}

export default function PostHead({ post }: Props) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  // Fall back to the site-wide OG card (public/og.png, also set in index.html)
  // so posts without their own thumbnail/ogImage still share with an image.
  // NOTE: these must be real, committed files under public/ — scrapers fetch the
  // raw URL, not an optimized variant. If a thumbnail's master moves to the
  // gitignored src/images/ pipeline, keep an OG-resolution copy in public/.
  const imageSrc = post.ogImage ?? post.thumbnail ?? "og.png";
  const imageUrl = `${SITE_URL}/${imageSrc.replace(/^\//, "")}`;
  return (
    <Helmet>
      {/* Template string, not JSX interpolation — React only stringifies a
          single <title> child. */}
      <title>{`${post.title} — ${SITE_NAME}`}</title>
      <meta name="description" content={post.description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={imageUrl} />
      <meta property="article:published_time" content={post.date} />
      {post.tags.map((tag) => (
        <meta property="article:tag" content={tag} key={tag} />
      ))}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={post.title} />
      <meta name="twitter:description" content={post.description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
}
