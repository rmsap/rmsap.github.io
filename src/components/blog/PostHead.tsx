import { Helmet } from "react-helmet-async";
import type { BlogPostMeta } from "../../types/blog";
import {
  SITE_URL,
  SITE_NAME,
  OG_IMAGE_WIDTH,
  OG_IMAGE_HEIGHT,
  ogImageUrl,
} from "../../constants/site";

interface Props {
  post: BlogPostMeta;
}

export default function PostHead({ post }: Props) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  // Auto-generated per-post card, or an `ogImage` frontmatter override — see
  // ogImageUrl. Kept in sync with the prerendered tags (scripts/prerender.ts).
  const imageUrl = ogImageUrl(post);
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
      {/* Only the auto-generated card has known dimensions; an `ogImage`
          override can be any size, so don't assert 1200x630 for it. */}
      {!post.ogImage && (
        <meta property="og:image:width" content={String(OG_IMAGE_WIDTH)} />
      )}
      {!post.ogImage && (
        <meta property="og:image:height" content={String(OG_IMAGE_HEIGHT)} />
      )}
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
