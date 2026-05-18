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
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          404
        </h1>
        <p className="text-lg mb-6 text-gray-700 dark:text-gray-300">
          The page{" "}
          <code className="font-mono break-all">{location.pathname}</code>{" "}
          doesn’t exist.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-full hover:shadow-lg transition-all duration-300"
        >
          Back home
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
