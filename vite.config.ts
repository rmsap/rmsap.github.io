import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@mdx-js/rollup';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import rehypeShiki from 'rehype-shiki';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    mdx({
      remarkPlugins: [remarkGfm, remarkFrontmatter],
      rehypePlugins: [
        [
          rehypeShiki,
          {
            themes: { light: 'github-light', dark: 'github-dark' },
          },
        ],
      ],
    }),
    react(),
    tailwindcss(),
  ],
});
