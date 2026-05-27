import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { legacyHashToPath } from "../utils/legacyHash";

/**
 * Migrates legacy HashRouter URLs (`/#/blog/slug`) to BrowserRouter paths while
 * the app is already mounted. public/spa-redirect.js covers the initial page
 * load, but it only runs once — editing just the hash on an open page fires a
 * `hashchange` without reloading, so this listener catches that case and routes
 * via `navigate` (a manual hash edit fires `hashchange` but not `popstate`, so
 * React Router wouldn't otherwise notice it). Renders nothing.
 */
export default function LegacyHashRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const migrate = () => {
      const target = legacyHashToPath(window.location.hash);
      if (target !== null) void navigate(target, { replace: true });
    };
    migrate(); // catch a legacy hash already present at mount
    window.addEventListener("hashchange", migrate);
    return () => window.removeEventListener("hashchange", migrate);
  }, [navigate]);

  return null;
}
