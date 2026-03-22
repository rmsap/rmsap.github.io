import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, increment, onSnapshot } from "firebase/firestore";
import { db, ensureAuth } from "../../firebase";

const EMOJIS = ["👍", "🔥", "💡", "❤️", "🎉"];

interface Props {
  postSlug: string;
}

export default function PostReactions({ postSlug }: Props) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [uid, setUid] = useState<string | null>(null);

  // Get auth and load user's reactions
  useEffect(() => {
    void ensureAuth().then(setUid);
  }, []);

  // Subscribe to reaction counts
  useEffect(() => {
    const ref = doc(db, "blog_reactions", postSlug);
    return onSnapshot(ref, (snap) => {
      setCounts(
        snap.exists() ? (snap.data() as unknown as Record<string, number>) : {},
      );
    });
  }, [postSlug]);

  // Load which emojis this user already reacted with
  useEffect(() => {
    if (!uid) return;
    void getDoc(doc(db, "blog_reactions", postSlug, "users", uid)).then(
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as { emojis?: string[] };
          setUserReactions(new Set(data.emojis ?? []));
        }
      },
    );
  }, [uid, postSlug]);

  async function toggle(emoji: string) {
    if (!uid) return;
    const already = userReactions.has(emoji);
    const delta = already ? -1 : 1;

    // Compute the new set once, use for both optimistic update and persist
    const updatedSet = new Set(userReactions);
    if (already) {
      updatedSet.delete(emoji);
    } else {
      updatedSet.add(emoji);
    }

    // Optimistic update
    const prevCounts = { ...counts };
    const prevReactions = new Set(userReactions);
    setCounts((prev) => ({ ...prev, [emoji]: (prev[emoji] ?? 0) + delta }));
    setUserReactions(updatedSet);

    try {
      await setDoc(
        doc(db, "blog_reactions", postSlug),
        { [emoji]: increment(delta) },
        { merge: true },
      );
      await setDoc(doc(db, "blog_reactions", postSlug, "users", uid), {
        emojis: Array.from(updatedSet),
      });
    } catch {
      // Rollback optimistic update on failure
      setCounts(prevCounts);
      setUserReactions(prevReactions);
    }
  }

  return (
    <div className="flex items-center gap-2 my-6">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => void toggle(emoji)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full border
            text-sm transition-all
            ${
              userReactions.has(emoji)
                ? "border-blue-500 bg-blue-500/15 scale-105"
                : "border-gray-600 hover:border-gray-400"
            }`}
        >
          <span>{emoji}</span>
          {(counts[emoji] ?? 0) > 0 && (
            <span className="text-gray-300">{counts[emoji]}</span>
          )}
        </button>
      ))}
    </div>
  );
}
