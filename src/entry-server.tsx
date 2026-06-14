// SSR entry — built separately (`vite build --ssr src/entry-server.tsx`) and
// consumed only by scripts/prerender.ts. Never shipped to the browser.

import { StrictMode } from "react";
import { prerenderToNodeStream } from "react-dom/static";
// In react-router-dom v7, StaticRouter lives in "react-router"
// (react-router-dom/server no longer exists).
import { StaticRouter } from "react-router";
import App from "./App";
import { getAllPosts } from "./utils/blogLoader";

// prerenderToNodeStream (unlike renderToString) waits for Suspense/lazy to
// resolve, so the lazy-loaded blog routes render their real content.
export async function render(url: string): Promise<string> {
  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  );
  const chunks: Buffer[] = [];
  for await (const chunk of prelude) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf-8");
}

export function getStaticPaths(): string[] {
  return ["/", "/blog", ...getAllPosts().map((p) => `/blog/${p.slug}`)];
}

// Re-exported so the prerender script reuses the runtime frontmatter loader
// (same import.meta.glob as the live app) instead of re-parsing with gray-matter.
export { getAllPosts };
