import {
  type ComponentProps,
  type CSSProperties,
  type MouseEventHandler,
  type ReactEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import type { VideoEntry } from "../utils/videoManifest";

interface VideoProps {
  /** Manifest key — the master's filename without extension (e.g. "siglo_video"). */
  name: string;
  /** Optimized variants for this clip, resolved by <Media> from the manifest. */
  entry: VideoEntry;
  /** Accessible label (e.g. the project title); falls back to the key. */
  alt?: string;
  className?: string;
  style?: CSSProperties;
  /** Whether this video should be playing (e.g. the active carousel slide). */
  active?: boolean;
  /**
   * Whether to expose native controls under prefers-reduced-motion. A grid
   * thumbnail whose card is itself the click target (it opens a modal) passes
   * false: the clip then shows as a static poster and the click reaches the card.
   * Standalone players (modal, hero, carousel slide) keep the default so a
   * reduced-motion user can play them.
   */
  allowControls?: boolean;
  /** Eager-load the file rather than just metadata (e.g. a visible hero clip). */
  priority?: boolean;
  /** Suppress native drag (e.g. carousel slides handle their own drag). */
  draggable?: ComponentProps<"video">["draggable"];
  /** Fires if the clip fails to load (e.g. to hide the element), mirroring <img>. */
  onError?: ReactEventHandler<HTMLVideoElement>;
  /** Caller click handler (e.g. a grid card that opens a modal), merged with the
   * reduced-motion control-strip guard below. */
  onClick?: MouseEventHandler<HTMLVideoElement>;
}

/**
 * Autoplaying, muted, looping clip — the replacement for animated GIFs. Serves
 * WebM (smaller) with an MP4 fallback for Safari/iOS, shows a poster while
 * loading, and only plays when `active` and scrolled into view. Honors
 * prefers-reduced-motion by pausing and (when `allowControls`) exposing controls
 * instead of autoplaying.
 */
export default function Video({
  name,
  alt,
  entry,
  className,
  style,
  active = true,
  allowControls = true,
  priority = false,
  draggable,
  onError,
  onClick,
}: VideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  // Start `false` to match the prerendered markup (no `window` at build time);
  // the effect below reads the real media query on mount. Reading matchMedia in
  // the initializer instead would diverge from the server HTML for a
  // reduced-motion user and trip a hydration mismatch on the `controls` attr —
  // play is effect-driven (the <video> has no `autoPlay`), so there's no
  // autoplay flash to guard against here anyway.
  const [reduceMotion, setReduceMotion] = useState(false);
  // Don't autoplay a clip that's scrolled out of view — start `false` and let
  // the observer below report the real state on mount (it fires immediately for
  // the initial intersection). On browsers without IntersectionObserver we fall
  // back to `true` so the clip still plays.
  const [inView, setInView] = useState(false);
  // Set once if the clip can't load (decode error, or no <source> resolves) so
  // we can hide it via React-controlled style instead of mutating the DOM node
  // directly — a later re-render carrying a `style` prop would clobber that.
  const [failed, setFailed] = useState(false);

  // React doesn't reliably reflect the `muted` *attribute* onto the DOM
  // property, and an unmuted clip has its effect-driven play() rejected by the
  // autoplay policy (and silently swallowed below). Force the property on mount;
  // the `muted` attribute on the element stays for the prerendered markup.
  useEffect(() => {
    if (ref.current) ref.current.muted = true;
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      threshold: 0.1,
    });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  // Pause once when reduced motion turns on; from then on the user drives
  // playback via the native controls, so the autoplay effect below bails out and
  // we don't pause/rewind their clip on every inView change.
  useEffect(() => {
    if (reduceMotion) ref.current?.pause();
  }, [reduceMotion]);

  useEffect(() => {
    const v = ref.current;
    // Under reduced motion playback is entirely user-driven — see the effect
    // above — so leave the element alone here.
    if (!v || reduceMotion) return;
    if (active && inView) {
      // play() rejects if interrupted (e.g. quick slide changes) — ignore.
      void v.play().catch(() => {});
    } else if (!v.paused || v.currentTime > 0) {
      v.pause();
      // Rewind to the first frame (which matches the poster) so the clip
      // returns to its start state instead of freezing mid-play — e.g. a grid
      // card that shows the poster again after the pointer leaves. Guarded so
      // the initial inactive commit (already paused at frame 0) doesn't issue a
      // redundant seek on every mount.
      v.currentTime = 0;
    }
  }, [active, inView, reduceMotion]);

  // Show native controls only for a reduced-motion user *and* when this isn't a
  // thumbnail that delegates its click to an ancestor — see `allowControls`.
  const showControls = reduceMotion && allowControls;

  return (
    <video
      ref={ref}
      className={className}
      style={failed ? { ...style, display: "none" } : style}
      draggable={draggable}
      poster={entry.poster}
      width={entry.width}
      height={entry.height}
      muted
      loop
      playsInline
      controls={showControls}
      preload={priority ? "auto" : "metadata"}
      aria-label={alt || name}
      // When controls are shown, keep clicks on the control strip from bubbling
      // to an ancestor's onClick (e.g. a Projects grid card that opens the
      // modal). When they're hidden — normal motion, or a thumbnail passing
      // allowControls={false} — the <video> has nothing clickable, so clicks
      // pass through to that ancestor as before. Either way, run a
      // caller-supplied handler afterward.
      onClick={(e) => {
        if (showControls) e.stopPropagation();
        onClick?.(e);
      }}
      onError={(e) => {
        // Decode/MediaError after a source was selected: hide the element and
        // still run the caller's handler.
        setFailed(true);
        onError?.(e);
      }}
    >
      {/* WebM first: smaller, preferred by browsers that support it. */}
      <source src={entry.webm} type="video/webm" />
      <source
        src={entry.mp4}
        type="video/mp4"
        // A <video> fires its own `error` only for a decode/MediaError after a
        // source was selected; when *no* <source> can be loaded it stays silent
        // and the error surfaces on the trailing <source> instead. Flag failure
        // here too so a fully-broken clip collapses like a broken <img> (the
        // <video> onError above already covers the decode-error case).
        onError={() => setFailed(true)}
      />
    </video>
  );
}
