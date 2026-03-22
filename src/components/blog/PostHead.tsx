import { Helmet } from "react-helmet-async";
import type { BlogPostMeta } from "../../types/blog";

const SITE_URL = "https://rmsap.github.io";
const SITE_NAME = "Ryan Saperstein";

interface Props {
  post: BlogPostMeta;
}

export default function PostHead({ post }: Props) {
  const url = `${SITE_URL}/#/blog/${post.slug}`;
  return (
    <Helmet>
      <title>
        {post.title} — {SITE_NAME}
      </title>
      <meta name="description" content={post.description} />

      {/* Open Graph */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={post.title} />
      <meta property="og:description" content={post.description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="article:published_time" content={post.date} />
      {post.tags.map((tag) => (
        <meta property="article:tag" content={tag} key={tag} />
      ))}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={post.title} />
      <meta name="twitter:description" content={post.description} />
    </Helmet>
  );
}
