// Run with: npx tsx scripts/generateOgImages.ts
//
// Generates a branded 1200x630 Open Graph card per blog post into public/og/.
// Satori renders an editorial card (Fraunces title + Inter meta, matching the
// site's type) to SVG, then sharp rasterizes it to PNG.
//
// Unlike the image/video optimizers, this IS part of `npm run build`: its only
// inputs are post frontmatter (committed) and font files (from node_modules),
// both of which Cloudflare's CI build has. It never reads the gitignored
// src/images/ masters — the cards are pure type, no photos. Output lands in
// public/og/ (gitignored) and is copied into dist/ by `vite build`.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import type { ReactNode } from "react";
import satori from "satori";
import sharp from "sharp";
import matter from "gray-matter";
import {
  SITE_NAME,
  SITE_URL,
  OG_IMAGE_WIDTH,
  OG_IMAGE_HEIGHT,
} from "../src/constants/site";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const postsDir = path.join(root, "src/posts");
const outDir = path.join(root, "public/og");
const modulesDir = path.join(root, "node_modules");

// Bare host for the footer (e.g. "ryansaperstein.com"), derived from SITE_URL
// so the card can't drift from the canonical domain.
const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");

// Light-theme tokens from src/index.css — social cards read on light surfaces.
const C = {
  paper: "#f7f4ec",
  ink: "#16202e",
  muted: "#586577",
  accent: "#2563b8",
};

function font(pkg: string, file: string): Buffer {
  return fs.readFileSync(path.join(modulesDir, pkg, "files", file));
}

// Satori needs the actual font data (woff is supported; it converts glyphs to
// paths, so the PNG step needs no fonts).
//
// These are the `latin` subsets (basic Latin + Latin-1 + common typographic
// punctuation like en/em dashes and curly quotes). Satori silently drops any
// glyph the loaded fonts can't render, so a title using a non-Latin script
// (CJK, etc.) would ship a card with missing glyphs — main() warns when it
// sees one. Swap in the full-range woff here if titles need broader coverage.
const fonts = [
  {
    name: "Inter",
    data: font("@fontsource/inter", "inter-latin-400-normal.woff"),
    weight: 400 as const,
    style: "normal" as const,
  },
  {
    name: "Inter",
    data: font("@fontsource/inter", "inter-latin-500-normal.woff"),
    weight: 500 as const,
    style: "normal" as const,
  },
  {
    name: "Fraunces",
    data: font("@fontsource/fraunces", "fraunces-latin-600-normal.woff"),
    weight: 600 as const,
    style: "normal" as const,
  },
];

// Codepoints the `latin` woff subsets actually cover (the Google Fonts "latin"
// unicode-range the fonts declare): Basic Latin + Latin-1, a few Latin extras,
// and General Punctuation U+2000–206F — which is where en/em dashes and curly
// quotes live. Checking against the real range (rather than a \p{P}/\p{S}
// script heuristic) means the typographic punctuation common in titles is
// correctly recognized as covered, while genuinely-absent glyphs (CJK, emoji,
// dingbats, …) are flagged. Keep in sync if the loaded subset changes.
const LATIN_SUBSET_RANGES: [number, number][] = [
  [0x0000, 0x00ff],
  [0x0131, 0x0131],
  [0x0152, 0x0153],
  [0x02bb, 0x02bc],
  [0x02c6, 0x02c6],
  [0x02da, 0x02da],
  [0x02dc, 0x02dc],
  [0x0304, 0x0304],
  [0x0308, 0x0308],
  [0x0329, 0x0329],
  [0x2000, 0x206f],
  [0x2074, 0x2074],
  [0x20ac, 0x20ac],
  [0x2122, 0x2122],
  [0x2191, 0x2191],
  [0x2193, 0x2193],
  [0x2212, 0x2212],
  [0x2215, 0x2215],
  [0xfeff, 0xfeff],
  [0xfffd, 0xfffd],
];

// Distinct characters in `text` that fall outside the loaded font subset, so
// Satori would drop them silently.
function unsupportedGlyphs(text: string): string[] {
  const out = new Set<string>();
  for (const ch of text) {
    const cp = ch.codePointAt(0)!;
    if (!LATIN_SUBSET_RANGES.some(([lo, hi]) => cp >= lo && cp <= hi)) {
      out.add(ch);
    }
  }
  return [...out];
}

function formatDate(date: string | undefined): string {
  const d = new Date(date ?? "");
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid or missing post date: ${JSON.stringify(date)}`);
  }
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

// The title sits in a fixed-height card; step the font down for longer titles
// so a long headline wraps to a few balanced lines instead of overflowing into
// the header/footer.
function titleFontSize(title: string): number {
  const len = title.length;
  if (len <= 40) return 66;
  if (len <= 60) return 56;
  if (len <= 80) return 48;
  return 42;
}

// Satori consumes a React-like VDOM; the plain-object form avoids pulling in
// JSX/React for a build script. Containers with >1 child must set display:flex.
function card(title: string, dateStr: string): ReactNode {
  const el = {
    type: "div",
    props: {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        backgroundColor: C.paper,
        fontFamily: "Inter",
      },
      children: [
        {
          type: "div",
          props: {
            style: { display: "flex", alignItems: "center" },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    width: "18px",
                    height: "18px",
                    backgroundColor: C.accent,
                    borderRadius: "4px",
                  },
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    marginLeft: "16px",
                    fontSize: "30px",
                    fontWeight: 500,
                    color: C.ink,
                  },
                  children: SITE_NAME,
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              fontFamily: "Fraunces",
              fontWeight: 600,
              fontSize: `${titleFontSize(title)}px`,
              lineHeight: 1.1,
              letterSpacing: "-1px",
              color: C.ink,
            },
            children: title,
          },
        },
        {
          type: "div",
          props: {
            style: { display: "flex", flexDirection: "column" },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    width: "72px",
                    height: "5px",
                    backgroundColor: C.accent,
                    marginBottom: "24px",
                  },
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "26px",
                    color: C.muted,
                  },
                  children: [
                    { type: "div", props: { children: dateStr } },
                    { type: "div", props: { children: SITE_HOST } },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
  return el as unknown as ReactNode;
}

async function main() {
  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".mdx"));
  // Wipe the dir first so cards for renamed/deleted posts don't linger and get
  // deployed alongside the current set.
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  let generated = 0;
  for (const file of files) {
    const raw = fs.readFileSync(path.join(postsDir, file), "utf-8");
    const data = matter(raw).data as {
      title?: string;
      date?: string;
      ogImage?: string;
    };
    const slug = file.replace(".mdx", "");

    // Posts with an `ogImage` override never reference og/<slug>.png (see
    // ogImageUrl), so generating one would just ship an unused file.
    if (data.ogImage) {
      console.log(`↷ og: ${slug} uses ogImage override (${data.ogImage})`);
      continue;
    }
    if (!data.title) {
      throw new Error(`Missing post title in ${file}`);
    }
    // Satori drops any glyph the loaded fonts can't render, so a title with
    // characters outside the latin subset (CJK, emoji, etc.) would ship a card
    // with holes. Surface it at build time rather than shipping it.
    const missing = unsupportedGlyphs(data.title);
    if (missing.length > 0) {
      console.warn(
        `⚠ og: ${slug} title has characters outside the Latin font subset — they may render as missing glyphs: ${missing.join(" ")} (${data.title})`,
      );
    }

    const svg = await satori(card(data.title, formatDate(data.date)), {
      width: OG_IMAGE_WIDTH,
      height: OG_IMAGE_HEIGHT,
      fonts,
    });
    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(outDir, `${slug}.png`));
    console.log(`✅ og: ${slug}.png`);
    generated++;
  }
  console.log(`Generated ${generated} OG image(s) in public/og/`);
}

await main();
