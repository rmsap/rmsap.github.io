import type {
  ComponentProps,
  CSSProperties,
  MouseEventHandler,
  ReactEventHandler,
} from "react";
import Image from "./Image";
import Video from "./Video";
import { getVideo } from "../utils/videoManifest";

/**
 * Explicit prop surface rather than `ComponentProps<typeof Image>`: this is a
 * dispatcher, so callers should only pass props that one branch or the other
 * actually honors. The shared props below forward to both; the trailing
 * image-only / video-only groups are ignored by the other branch by design.
 */
interface MediaProps {
  /** Manifest key — resolved against the video manifest first, then the image one. */
  name: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  /** Suppress native drag (e.g. carousel slides handle their own drag). */
  draggable?: ComponentProps<"img">["draggable"];
  /** The LCP element: eager-load at high priority (e.g. a hero clip or the visible carousel slide). */
  priority?: boolean;
  /**
   * Eager-load at the browser's default priority — for off-screen media worth
   * prefetching (e.g. a carousel's neighbor slides) that shouldn't outrank the
   * real LCP. For a clip this is the same as `priority` (preload the file, not
   * just metadata); for an image it skips the high-priority preload.
   */
  eager?: boolean;
  /**
   * Typed for the <img>|<video> union so neither branch needs a cast when
   * forwarding. Handlers here only touch `currentTarget` (e.g. to hide the
   * element on error), which <img> and <video> share structurally.
   */
  onError?: ReactEventHandler<HTMLImageElement | HTMLVideoElement>;
  onClick?: MouseEventHandler<HTMLImageElement | HTMLVideoElement>;

  // Image-only — ignored when the key resolves to a video.
  /** Maps viewport to rendered width so the browser picks the right variant. */
  sizes?: string;
  /** Path to use when `name` isn't optimized yet (e.g. a legacy /public image). */
  fallbackSrc?: string;

  // Video-only — ignored when the key resolves to an image.
  /** Whether a video should be playing (e.g. the active carousel slide / hovered card). */
  active?: boolean;
  /** Whether a reduced-motion video may expose controls (false for a card that
   * delegates its click to the modal). */
  allowControls?: boolean;
}

/**
 * Renders a manifest reference as either an optimized <Video> (if the key is in
 * the video manifest) or an optimized <Image>. Lets call sites pass a mixed list
 * of stills and clips (e.g. a project's `images` array) without branching.
 */
export default function Media({
  active = true,
  allowControls,
  sizes,
  fallbackSrc,
  ...shared
}: MediaProps) {
  // Look the entry up once and hand it to <Video> so the component doesn't have
  // to re-resolve it (and can treat it as always-present).
  const video = getVideo(shared.name);
  if (video) {
    const {
      name,
      alt,
      className,
      style,
      priority,
      eager,
      draggable,
      onError,
      onClick,
    } = shared;
    return (
      <Video
        // Key on the source so a name change forces a fresh <video>: swapping
        // <source> children alone doesn't reload a <video> without an explicit
        // .load(), which would leave the old clip playing.
        key={name}
        entry={video}
        name={name}
        alt={alt}
        className={className}
        style={style}
        active={active}
        allowControls={allowControls}
        // A clip has no high-priority preload to dilute, so eager-prefetching a
        // neighbor slide just means preload="auto" — same as priority for Video.
        priority={priority || eager}
        // Carousel passes draggable={false} so slides handle their own drag;
        // honor it on the <video> too rather than dropping it.
        draggable={draggable}
        onError={onError}
        onClick={onClick}
      />
    );
  }
  // `eager` (and `priority`) ride along in `shared` to <Image>; only the video
  // branch above pulls `eager` out explicitly to fold it into `priority`.
  return <Image {...shared} sizes={sizes} fallbackSrc={fallbackSrc} />;
}
