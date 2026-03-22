import { useState, useEffect, useRef, type FormEvent } from "react";
import { addComment, checkRateLimit } from "../../services/comments";

interface Props {
  postSlug: string;
}

function generateChallenge(): { question: string; answer: number } {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  if (a >= b && Math.random() > 0.5) {
    return { question: `${a} − ${b}`, answer: a - b };
  }
  return { question: `${a} + ${b}`, answer: a + b };
}

const MIN_SUBMIT_TIME_MS = 3000;
const MAX_COMMENT_LENGTH = 2000;

export default function CommentForm({ postSlug }: Props) {
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [challenge, setChallenge] = useState(generateChallenge);
  const [captchaInput, setCaptchaInput] = useState("");
  const mountTime = useRef(Date.now());

  useEffect(() => {
    mountTime.current = Date.now();
  }, [postSlug]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (honeypot) {
      setBody("");
      setSuccess(true);
      return;
    }
    if (Date.now() - mountTime.current < MIN_SUBMIT_TIME_MS) {
      setError("That was a bit fast — please take a moment before posting.");
      return;
    }
    if (parseInt(captchaInput, 10) !== challenge.answer) {
      setError("Incorrect answer. Please try again.");
      setChallenge(generateChallenge());
      setCaptchaInput("");
      return;
    }
    const limit = checkRateLimit();
    if (!limit.allowed) {
      setError(`Please wait ${limit.waitSeconds}s before commenting again.`);
      return;
    }
    const trimmedBody = body.trim().slice(0, MAX_COMMENT_LENGTH);
    if (!name.trim() || !trimmedBody) return;

    setSubmitting(true);
    try {
      await addComment(postSlug, name, trimmedBody);
      setBody("");
      setCaptchaInput("");
      setChallenge(generateChallenge());
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-gray-200">
        Leave a Comment
      </h3>
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          Comment submitted! It will appear after approval.
        </div>
      )}
      <form
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        className="flex flex-col gap-4"
      >
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border border-gray-600 bg-gray-800/50 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
          maxLength={50}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-9999px",
            opacity: 0,
            height: 0,
          }}
        >
          <label>
            Do not fill this out:
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </label>
        </div>
        <div>
          <textarea
            placeholder="Write your comment..."
            value={body}
            onChange={(e) =>
              setBody(e.target.value.slice(0, MAX_COMMENT_LENGTH))
            }
            className="w-full rounded-lg border border-gray-600 bg-gray-800/50 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors min-h-[120px] resize-y"
            maxLength={MAX_COMMENT_LENGTH}
          />
          <p
            className="text-xs text-gray-500 mt-1.5 text-right"
            aria-live="polite"
          >
            {body.length}/{MAX_COMMENT_LENGTH}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-400">
            What is{" "}
            <span className="font-mono font-bold text-gray-200">
              {challenge.question}
            </span>
            ?
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
            className="w-16 rounded-lg border border-gray-600 bg-gray-800/50 px-3 py-2 text-sm text-center text-gray-200 placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
            maxLength={3}
            placeholder="?"
          />
        </div>
        <button
          type="submit"
          disabled={
            submitting ||
            !name.trim() ||
            !body.trim() ||
            !captchaInput ||
            body.length > MAX_COMMENT_LENGTH
          }
          className="self-start px-5 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Posting..." : "Post Comment"}
        </button>
      </form>
    </div>
  );
}
