import type { ComponentPropsWithoutRef } from "react";
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
  /** Above-the-fold images: eager-load with high fetch priority. */
  priority?: boolean;
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
  className,
  fallbackSrc,
  ...rest
}: ImageProps) {
  const entry = getImage(name);

  const loadingProps = priority
    ? ({ loading: "eager", fetchPriority: "high" } as const)
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

  return (
    // display:contents keeps <picture> out of layout so the inner <img>'s
    // className (object-cover, w-full, etc.) controls sizing directly.
    <picture style={{ display: "contents" }}>
      <source
        type="image/avif"
        srcSet={srcSet(entry.avif, entry.widths)}
        sizes={sizes}
      />
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
