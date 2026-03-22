export interface BlogPostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  readingTime: number; // minutes
  thumbnail?: string; // optional image URL or path
}

export interface Comment {
  id: string;
  postSlug: string;
  authorName: string;
  authorUid: string;
  body: string;
  createdAt: Date;
}

export interface Reaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}
