import { Helmet } from "react-helmet-async";
import type { BlogPostMeta } from "../../types/blog";

const SITE_URL = "https://rmsap.github.io";
const SITE_NAME = "Ryan Saperstein";

interface Props {
  post: BlogPostMeta;
}

export default function PostHead({ post }: Props) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const imageSrc = post.ogImage ?? post.thumbnail;
  const imageUrl = imageSrc
    ? `${SITE_URL}/${imageSrc.replace(/^\//, "")}`
    : undefined;
  return (
    <Helmet>
      <title>
        {post.title} — {SITE_NAME}
      </title>
      <meta name="description" content={post.description} />
      <link rel="canonical" href={url} />

      {/* Open Graph */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE_NAME} />
      {imageUrl && <meta property="og:image" content={imageUrl} />}
      <meta property="article:published_time" content={post.date} />
      {post.tags.map((tag) => (
        <meta property="article:tag" content={tag} key={tag} />
      ))}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={post.title} />
      <meta name="twitter:description" content={post.description} />
      {imageUrl && <meta name="twitter:image" content={imageUrl} />}
    </Helmet>
  );
}
