import { SOCIAL_LINKS } from "../constants/socialLinks";

function Footer() {
  return (
    <footer className="py-8 text-center text-sm text-muted border-t border-rule">
      <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-md border border-rule font-display text-base text-accent">
        RS
      </div>
      <p>© 2026 Ryan Saperstein • Built with React & TypeScript</p>
      <p className="mt-2">
        <a
          href={SOCIAL_LINKS.github}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-accent transition-colors"
        >
          GitHub
        </a>
        {" • "}
        <a
          href={SOCIAL_LINKS.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-accent transition-colors"
        >
          LinkedIn
        </a>
      </p>
    </footer>
  );
}

export default Footer;
