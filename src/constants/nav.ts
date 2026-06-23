export interface NavLink {
  label: string;
  // "#section" anchors a home-page section; "/route" is a router path.
  href: string;
}

// Canonical site navigation. Header renders these directly; CommandPalette
// derives its Page/Section entries from the same list so the two can't drift.
export const NAV_LINKS: NavLink[] = [
  { label: "Home", href: "#home" },
  { label: "Projects", href: "#projects" },
  { label: "Blog", href: "/blog" },
  { label: "Experience and Skills", href: "#experience" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];
