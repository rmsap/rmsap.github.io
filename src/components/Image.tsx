import type { ComponentPropsWithoutRef } from "react";
import { preload } from "react-dom";
import { getImage } from "../utils/imageManifest";

interface ImageProps extends Omit<
  ComponentPropsWithoutRef<"img">,
  "src" | "srcSet" | "width" | "height"
> {
  /** Manifest key — the master's filename without extension (e.g. "graduation"). */
  name: string;
  alt: string;
  /** Maps viewport to rendered width so the browser picks the right variant. */
  sizes?: string;
  /** The page's LCP image: eager-load at high fetch priority and emit a preload. */
  priority?: boolean;
  /**
   * Load immediately but at the browser's default priority — for off-screen
   * images worth prefetching (e.g. a carousel's neighbor slides) that must NOT
   * compete with the real LCP image for the high-priority fetch slot. Ignored
   * when `priority` is set.
   */
  eager?: boolean;
  /** Path to use when `name` isn't optimized yet (e.g. a legacy /public image). */
  fallbackSrc?: string;
}

function srcSet(dict: Record<string, string>, widths: number[]): string {
  // Skip any width missing from the dict so a hand-edited manifest can't emit
  // "undefined 400w" into the srcset.
  return widths
    .filter((w) => dict[w])
    .map((w) => `${dict[w]} ${w}w`)
    .join(", ");
}

/**
 * Responsive <picture> for an optimized image. Serves AVIF (smallest) with a
 * WebP fallback, sized per viewport via srcset/sizes, lazy by default. Falls
 * back to a plain <img> if the name isn't in the manifest (e.g. before the
 * optimizer has run for it).
 */
export default function Image({
  name,
  alt,
  sizes = "(max-width: 768px) 100vw, 768px",
  priority = false,
  eager = false,
  className,
  fallbackSrc,
  ...rest
}: ImageProps) {
  const entry = getImage(name);

  const loadingProps = priority
    ? ({ loading: "eager", fetchPriority: "high" } as const)
    : eager
      ? ({ loading: "eager" } as const)
      : ({ loading: "lazy" } as const);

  if (!entry) {
    // `|| `, not `??`: an empty fallbackSrc (e.g. a markdown image with no src)
    // should fall through to /name rather than render src="" (which browsers
    // resolve to the current page URL and re-fetch the document).
    const src = fallbackSrc || (name ? `/${name}` : "");
    // With neither a fallback nor a name there's nothing to point at; rendering
    // src="" (or "/") would re-fetch the current document, so render nothing.
    if (!src) return null;
    return (
      <img
        src={src}
        {...rest}
        alt={alt}
        decoding="async"
        className={className}
        {...loadingProps}
      />
    );
  }

  // Default <img src> for browsers that pick neither <source>. Prefer the
  // largest width, but tolerate a hand-edited manifest missing that exact key by
  // falling back to the largest width actually present in the webp dict.
  const defaultSrc =
    entry.webp[Math.max(...entry.widths)] ??
    entry.widths
      .filter((w) => entry.webp[w])
      .map((w) => entry.webp[w])
      .at(-1);

  // One expression, used by both the preload below and the AVIF <source> — so
  // the preload's imageSrcSet can't drift from what the <picture> actually
  // selects (a mismatch silently costs a second fetch instead of reusing the
  // preloaded resource).
  const avifSrcSet = srcSet(entry.avif, entry.widths);

  // React 19 auto-preloads a standalone <img src>, but NOT an <img> nested in
  // <picture> — so a priority (above-the-fold LCP) responsive image is
  // discovered only when the parser reaches the element, too late to win the
  // LCP. Emit an explicit preload matching the AVIF <source> the browser will
  // pick. React dedupes by href, so this is safe to run on every render: during
  // SSR the link is hoisted into <head> (prerender.ts lifts it there) and on the
  // client React floats it to the head too, so the fetch starts on initial
  // parse. `defaultSrc` (webp) is only the href fallback for the rare browser
  // without imageSrcSet support; AVIF-capable browsers match imageSrcSet instead
  // (and double-fetch if they somehow can't decode AVIF — an acceptably rare
  // cost for serving AVIF at all).
  if (priority && defaultSrc) {
    preload(defaultSrc, {
      as: "image",
      imageSrcSet: avifSrcSet,
      imageSizes: sizes,
      fetchPriority: "high",
    });
  }

  return (
    // display:contents keeps <picture> out of layout so the inner <img>'s
    // className (object-cover, w-full, etc.) controls sizing directly.
    <picture style={{ display: "contents" }}>
      <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />
      <source
        type="image/webp"
        srcSet={srcSet(entry.webp, entry.widths)}
        sizes={sizes}
      />
      <img
        src={defaultSrc}
        {...rest}
        width={entry.width}
        height={entry.height}
        alt={alt}
        decoding="async"
        className={className}
        {...loadingProps}
      />
    </picture>
  );
}
