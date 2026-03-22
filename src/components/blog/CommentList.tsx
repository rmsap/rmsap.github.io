import { useEffect, useState } from "react";
import { subscribeToComments } from "../../services/comments";
import type { Comment } from "../../types/blog";

function timeAgo(date: Date): string {
  const now = Date.now();
  const seconds = Math.floor((now - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

interface Props {
  postSlug: string;
}

export default function CommentList({ postSlug }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToComments(postSlug, (c) => {
      setComments(c);
      setLoading(false);
    });
    return unsub;
  }, [postSlug]);

  if (loading)
    return <p className="text-gray-500 text-sm italic">Loading comments...</p>;
  if (comments.length === 0)
    return (
      <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
    );

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-gray-400">
        {comments.length} comment{comments.length !== 1 ? "s" : ""}
      </p>
      {comments.map((c) => (
        <div
          key={c.id}
          className="rounded-lg border border-gray-700 bg-gray-800/50 p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-purple-600/30 flex items-center justify-center text-xs font-semibold text-purple-400">
                {c.authorName.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-gray-200 text-sm">
                {c.authorName}
              </span>
            </div>
            <time className="text-xs text-gray-500">
              {timeAgo(c.createdAt)}
            </time>
          </div>
          <p className="whitespace-pre-wrap text-sm text-gray-300 leading-relaxed pl-9">
            {c.body}
          </p>
        </div>
      ))}
    </div>
  );
}
