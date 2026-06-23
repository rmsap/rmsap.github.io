export const SITE_URL = "https://ryansaperstein.com";
export const SITE_NAME = "Ryan Saperstein";
export const BLOG_TITLE = "Notes to Self";
export const BLOG_DESCRIPTION =
  "Thoughts on software engineering, learning in public, and everything in between.";

// Open Graph card dimensions — shared by the generator (scripts/generateOgImages.ts)
// and the og:image:width/height meta tags so they can't drift apart.
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/**
 * Absolute Open Graph card URL for a post. Defaults to the auto-generated
 * per-post card (scripts/generateOgImages.ts -> public/og/<slug>.png); an
 * explicit `ogImage` in frontmatter overrides it. Scrapers fetch the raw URL,
 * so this must resolve to a real committed/built file, not an optimized
 * <picture> variant.
 */
export function ogImageUrl(post: { slug: string; ogImage?: string }): string {
  const src = post.ogImage ?? `og/${post.slug}.png`;
  return `${SITE_URL}/${src.replace(/^\//, "")}`;
}
