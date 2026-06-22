import { Link, useLocation } from "react-router-dom";
import { HEADER_OFFSET } from "../constants/layout";

const NotFound = () => {
  const location = useLocation();
  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ paddingTop: HEADER_OFFSET }}
    >
      <div className="text-center max-w-md">
        <h1 className="font-display text-7xl font-medium mb-4 text-ink">404</h1>
        <p className="text-lg mb-2 text-ink">This one didn’t resolve.</p>
        <p className="text-muted mb-8">
          <code className="font-mono break-all text-accent">
            {location.pathname}
          </code>{" "}
          isn’t a page I’ve written — yet.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-2.5 bg-accent text-paper font-medium rounded-md hover:opacity-90 transition-opacity"
          >
            Back home
          </Link>
          <Link
            to="/blog"
            className="inline-flex items-center px-6 py-2.5 border border-ink text-ink font-medium rounded-md hover:bg-ink hover:text-paper transition-colors"
          >
            Read the blog
          </Link>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
