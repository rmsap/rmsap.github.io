import type { ComponentType } from "react";
import type { BlogPostMeta } from "../types/blog";
import { estimateReadingTime } from "./readingTime";

interface MdxModule {
  default: ComponentType;
  frontmatter?: Record<string, unknown>;
}

// Import compiled MDX components (path relative to this file: src/utils/)
const postModules = import.meta.glob<MdxModule>("../posts/*.mdx", {
  eager: true,
});

const postRaw = import.meta.glob("../posts/*.mdx", {
  query: "?raw",
  import: "default",
  eager: true,
});

/** Get raw file content by slug; glob keys may differ between postModules and postRaw */
function getRawBySlug(slug: string): string {
  const key = Object.keys(postRaw).find(
    (k) => k.replace(/^.*\//, "").replace(".mdx", "") === slug,
  );
  if (!key) return "";
  const rawVal = postRaw[key];
  if (typeof rawVal === "string") return rawVal;
  if (rawVal && typeof rawVal === "object" && "default" in rawVal)
    return typeof rawVal.default === "string" ? rawVal.default : "";
  return "";
}

function buildMeta(
  filepath: string,
  fm: Record<string, unknown>,
): BlogPostMeta {
  const slug = filepath.replace("../posts/", "").replace(".mdx", "");
  let rawText = getRawBySlug(slug);
  if (!rawText) {
    const v = postRaw[filepath];
    rawText =
      typeof v === "string"
        ? v
        : v &&
            typeof v === "object" &&
            "default" in v &&
            typeof (v as { default: unknown }).default === "string"
          ? (v as { default: string }).default
          : "";
  }
  // Use frontmatter from compiled MDX (remark-mdx-frontmatter)
  return {
    slug,
    title: (fm.title as string)?.trim() || slug,
    date: (fm.date as string) ?? "",
    description: (fm.description as string) ?? "",
    tags: Array.isArray(fm.tags) ? (fm.tags as string[]) : [],
    readingTime: estimateReadingTime(rawText),
    thumbnail: (fm.thumbnail as string) || undefined,
  };
}

export function getAllPosts(): BlogPostMeta[] {
  return Object.entries(postModules)
    .map(([fp, mod]) => buildMeta(fp, mod.frontmatter ?? {}))
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
    meta: buildMeta(filepath, mod.frontmatter ?? {}),
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
