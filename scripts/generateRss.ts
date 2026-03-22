// Run with: npx tsx scripts/generateRss.ts

import { Feed } from "feed";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SITE_URL = "https://rmsap.github.io";
const AUTHOR = { name: "Ryan Saperstein", link: SITE_URL };

const feed = new Feed({
  title: "Notes to Self",
  description:
    "Thoughts on software engineering, learning in public, and everything in between.",
  id: SITE_URL,
  link: `${SITE_URL}/#/blog`,
  language: "en",
  copyright: `© ${new Date().getFullYear()} Ryan Saperstein`,
  author: AUTHOR,
});

const postsDir = path.resolve(__dirname, "../src/posts");
const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".mdx"));

const posts = files
  .map((file) => {
    const raw = fs.readFileSync(path.join(postsDir, file), "utf-8");
    const { data } = matter(raw);
    const slug = file.replace(".mdx", "");
    return { slug, ...data } as {
      slug: string;
      title: string;
      date: string;
      description: string;
      tags?: string[];
    };
  })
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

posts.forEach((p) => {
  const postUrl = `${SITE_URL}/#/blog/${p.slug}`;
  feed.addItem({
    title: p.title,
    id: postUrl,
    link: postUrl,
    description: p.description,
    date: new Date(p.date),
    author: [AUTHOR],
    category: (p.tags ?? []).map((t) => ({ name: t })),
  });
});

const outDir = path.resolve(__dirname, "../public");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "rss.xml"), feed.rss2());
fs.writeFileSync(path.join(outDir, "feed.json"), feed.json1());
console.log("✅ RSS feed generated");
