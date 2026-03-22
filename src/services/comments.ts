import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db, ensureAuth } from "../firebase";
import type { Comment } from "../types/blog";

const COMMENTS_COL = "blog_comments";
const RATE_LIMIT_MS = 30_000;
let lastCommentTime = 0;

export function checkRateLimit(): { allowed: boolean; waitSeconds: number } {
  const elapsed = Date.now() - lastCommentTime;
  if (elapsed < RATE_LIMIT_MS) {
    return {
      allowed: false,
      waitSeconds: Math.ceil((RATE_LIMIT_MS - elapsed) / 1000),
    };
  }
  return { allowed: true, waitSeconds: 0 };
}

export function subscribeToComments(
  postSlug: string,
  callback: (comments: Comment[]) => void,
): () => void {
  const q = query(
    collection(db, COMMENTS_COL),
    where("postSlug", "==", postSlug),
    where("approved", "==", true),
    orderBy("createdAt", "asc"),
  );
  return onSnapshot(q, (snapshot) => {
    const comments: Comment[] = snapshot.docs.map((d) => {
      const data = d.data() as {
        postSlug: string;
        authorName: string;
        authorUid: string;
        body: string;
        createdAt: unknown;
      };
      return {
        id: d.id,
        postSlug: data.postSlug,
        authorName: data.authorName,
        authorUid: data.authorUid,
        body: data.body,
        createdAt:
          data.createdAt instanceof Timestamp
            ? data.createdAt.toDate()
            : new Date(),
      };
    });
    callback(comments);
  });
}

export async function addComment(
  postSlug: string,
  authorName: string,
  body: string,
): Promise<void> {
  const limit = checkRateLimit();
  if (!limit.allowed) {
    throw new Error(
      `Please wait ${limit.waitSeconds}s before commenting again.`,
    );
  }
  const uid = await ensureAuth();
  await addDoc(collection(db, COMMENTS_COL), {
    postSlug,
    authorName: authorName.trim(),
    authorUid: uid,
    body: body.trim(),
    createdAt: serverTimestamp(),
    approved: false,
  });
  lastCommentTime = Date.now();
}
