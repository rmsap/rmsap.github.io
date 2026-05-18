import type { ComponentType } from "react";
import type { BlogPostMeta } from "../types/blog";

interface MdxModule {
  default: ComponentType;
  frontmatter?: Record<string, unknown>;
  readingTime?: number;
}

// Import compiled MDX components (path relative to this file: src/utils/)
const postModules = import.meta.glob<MdxModule>("../posts/*.mdx", {
  eager: true,
});

// Force /public assets to root-relative URLs. Frontmatter often lists them as
// bare filenames; without a leading slash they resolve against the current
// route, so /blog/ ends up requesting /blog/foo.png (404).
function toRootAsset(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length === 0) return undefined;
  if (/^(https?:)?\/\//.test(value)) return value;
  return value.startsWith("/") ? value : `/${value}`;
}

function buildMeta(filepath: string, mod: MdxModule): BlogPostMeta {
  const slug = filepath.replace("../posts/", "").replace(".mdx", "");
  const fm = mod.frontmatter ?? {};
  return {
    slug,
    title: (fm.title as string)?.trim() || slug,
    date: (fm.date as string) ?? "",
    description: (fm.description as string) ?? "",
    tags: Array.isArray(fm.tags) ? (fm.tags as string[]) : [],
    readingTime: mod.readingTime ?? 1,
    thumbnail: toRootAsset(fm.thumbnail),
    ogImage: toRootAsset(fm.ogImage),
  };
}

export function getAllPosts(): BlogPostMeta[] {
  return Object.entries(postModules)
    .map(([fp, mod]) => buildMeta(fp, mod))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  getAllPosts().forEach((p) => p.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

export function getPostComponent(
  slug: string,
): { Component: ComponentType; meta: BlogPostMeta } | null {
  const entry = Object.entries(postModules).find(([fp]) =>
    fp.endsWith(`/${slug}.mdx`),
  );
  if (!entry) return null;
  const [filepath, mod] = entry;
  return {
    Component: mod.default,
    meta: buildMeta(filepath, mod),
  };
}

export function getAdjacentPosts(slug: string): {
  prev: BlogPostMeta | null;
  next: BlogPostMeta | null;
} {
  const posts = getAllPosts();
  const idx = posts.findIndex((p) => p.slug === slug);
  return {
    prev: idx < posts.length - 1 ? posts[idx + 1] : null, // older
    next: idx > 0 ? posts[idx - 1] : null, // newer
  };
}
