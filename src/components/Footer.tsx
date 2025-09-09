import { SOCIAL_LINKS } from "../constants/socialLinks";

function Footer() {
  return (
    <footer className="py-8 text-center text-sm text-gray-500 border-t">
      <p>© 2025 Ryan Saperstein • Built with React & TypeScript</p>
      <p className="mt-2">
        <a
          href="/RyanSapersteinResume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-purple-600"
        >
          Resume
        </a>
        {" • "}
        <a
          href={SOCIAL_LINKS.github}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-purple-600"
        >
          GitHub
        </a>
        {" • "}
        <a
          href={SOCIAL_LINKS.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-purple-600"
        >
          LinkedIn
        </a>
      </p>
    </footer>
  );
}

export default Footer;
