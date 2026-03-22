import { useState } from "react";
import { FaXTwitter, FaLinkedinIn } from "react-icons/fa6";

interface Props {
  title: string;
  slug: string;
}

export default function ShareButtons({ title, slug }: Props) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/#/blog/${slug}`;
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  function copyLink() {
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-gray-400">Share:</span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-300 hover:text-purple-400 transition-colors"
        aria-label="Share on Twitter"
      >
        <FaXTwitter className="w-4 h-4" />
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-300 hover:text-purple-400 transition-colors inline-flex items-center"
        aria-label="Share on LinkedIn"
      >
        <FaLinkedinIn className="w-4 h-4" />
      </a>
      <button
        onClick={copyLink}
        className="text-gray-300 hover:text-purple-400 transition-colors"
        aria-label="Copy link"
      >
        {copied ? "✓ Copied" : "🔗 Link"}
      </button>
    </div>
  );
}
