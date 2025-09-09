import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToHash() {
  const location = useLocation();

  useEffect(() => {
    // Only run if there's a hash in the URL
    if (location.hash) {
      const id = location.hash.substring(1); // Remove the # symbol

      // Use setTimeout to ensure DOM is ready
      const scrollTimer = setTimeout(() => {
        const element = document.getElementById(id);

        if (element) {
          // Calculate position accounting for header
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }, 100); // Small delay to ensure components are mounted

      return () => clearTimeout(scrollTimer);
    } else {
      // If no hash, scroll to top
      window.scrollTo(0, 0);
    }
  }, [location]);

  return null; // This component doesn't render anything
}

export default ScrollToHash;
