import { useCallback, useEffect } from "react";
import { logEvent } from "firebase/analytics";
import { getAnalyticsInstance } from "../firebase";

export const useBlogAnalytics = (postId: string) => {
  useEffect(() => {
    if (!postId) return;

    const key = `viewed_${postId}`;

    if (!sessionStorage.getItem(key)) {
      logEvent(getAnalyticsInstance(), "post_view", {
        post_id: postId,
      });

      sessionStorage.setItem(key, "true");
    }
  }, [postId]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const link = (e.target as Element).closest("a");
      if (link) {
        logEvent(getAnalyticsInstance(), "click", {
          post_id: postId,
          url: link.href,
        });
      }
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [postId]);

  const trackClick = useCallback(
    (label: string, extra: Record<string, unknown> = {}) => {
      logEvent(getAnalyticsInstance(), "click", {
        post_id: postId,
        label,
        ...extra,
      });
    },
    [postId],
  );

  return { trackClick };
};
