// A quiet, opacity-only fade on mount via the shared `.fade-in` keyframe (see
// src/index.css). Pure CSS rather than framer-motion on purpose: a JS-driven
// `initial={{ opacity: 0 }}` bakes opacity:0 into the prerendered HTML, so blog
// pages would ship invisible until hydration. CSS animates from the rendered
// markup and is gated behind prefers-reduced-motion, so motion-sensitive
// visitors get a static, fully-visible page.
export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="fade-in">{children}</div>;
}
