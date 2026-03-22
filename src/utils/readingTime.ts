const WORDS_PER_MINUTE = 225;

export function estimateReadingTime(text: string | undefined | null): number {
  const str = typeof text === "string" ? text : "";
  // Strip MDX/JSX tags and frontmatter
  const clean = str
    .replace(/---[\s\S]*?---/, "")
    .replace(/<[^>]+>/g, "")
    .replace(/import\s+.*?from\s+['"].*?['"]/g, "")
    .trim();
  const words = clean.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
