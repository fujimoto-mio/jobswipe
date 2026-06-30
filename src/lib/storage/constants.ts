/** Cloudflare R2 bucket names */
export const STORAGE_BUCKETS = {
  public: "jobswipe-public",
  private: "jobswipe-private",
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

export type UploadKind =
  | "video"
  | "thumbnail"
  | "image"
  | "resume"
  | "company-logo"
  | "company-banner"
  | "staff-avatar"
  | "seeker-avatar"
  | "seeker-banner";

export const UPLOAD_KIND_CONFIG: Record<
  UploadKind,
  {
    bucket: StorageBucket;
    folder: string;
    maxBytes: number;
    mimePrefix: string | string[];
  }
> = {
  video: {
    bucket: STORAGE_BUCKETS.public,
    folder: "jobs/videos",
    maxBytes: 30 * 1024 * 1024,
    mimePrefix: "video/",
  },
  thumbnail: {
    bucket: STORAGE_BUCKETS.public,
    folder: "jobs/thumbnails",
    maxBytes: 5 * 1024 * 1024,
    mimePrefix: "image/",
  },
  image: {
    bucket: STORAGE_BUCKETS.private,
    folder: "chat/attachments",
    maxBytes: 5 * 1024 * 1024,
    mimePrefix: "image/",
  },
  "company-logo": {
    bucket: STORAGE_BUCKETS.public,
    folder: "company-logos",
    maxBytes: 2 * 1024 * 1024,
    mimePrefix: "image/",
  },
  "company-banner": {
    bucket: STORAGE_BUCKETS.public,
    folder: "company-banners",
    maxBytes: 5 * 1024 * 1024,
    mimePrefix: "image/",
  },
  "staff-avatar": {
    bucket: STORAGE_BUCKETS.public,
    folder: "staff-avatars",
    maxBytes: 2 * 1024 * 1024,
    mimePrefix: "image/",
  },
  "seeker-avatar": {
    bucket: STORAGE_BUCKETS.public,
    folder: "seeker-avatars",
    maxBytes: 2 * 1024 * 1024,
    mimePrefix: "image/",
  },
  "seeker-banner": {
    bucket: STORAGE_BUCKETS.public,
    folder: "seeker-banners",
    maxBytes: 5 * 1024 * 1024,
    mimePrefix: "image/",
  },
  resume: {
    bucket: STORAGE_BUCKETS.private,
    folder: "seekers/resumes",
    maxBytes: 10 * 1024 * 1024,
    mimePrefix: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
};

/** Folders seeded per bucket by `npm run storage:setup` */
export const BUCKET_FOLDER_PATHS: Record<StorageBucket, readonly string[]> = {
  [STORAGE_BUCKETS.public]: [
    "jobs/videos",
    "jobs/thumbnails",
    "company-logos",
    "company-banners",
    "staff-avatars",
    "seeker-avatars",
    "seeker-banners",
  ],
  [STORAGE_BUCKETS.private]: ["chat/attachments", "seekers/resumes"],
};

export const BUCKET_SETUP = [
  {
    id: STORAGE_BUCKETS.public,
    public: false,
    note: "Videos, thumbnails, avatars. Reads use presigned URLs (or set R2_PUBLIC_BUCKET_URL later for CDN).",
  },
  {
    id: STORAGE_BUCKETS.private,
    public: false,
    note: "Chat attachments and resumes. Reads use presigned URLs (or set R2_PRIVATE_BUCKET_URL later).",
  },
] as const;

/** Use multipart upload for files at or above this size (faster for videos). */
export const MULTIPART_UPLOAD_THRESHOLD_BYTES = 5 * 1024 * 1024;

/** Presigned read URL lifetime — cached server-side to avoid re-signing every request. */
export const PRESIGNED_READ_URL_EXPIRY_SECONDS = 60 * 60;

export function isPrivateUploadKind(kind: UploadKind): boolean {
  return UPLOAD_KIND_CONFIG[kind].bucket === STORAGE_BUCKETS.private;
}

export function buildStorageKey(folder: string, filename: string, userId?: string): string {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const prefix = userId ? `${folder}/${userId}` : folder;
  return `${prefix}/${Date.now()}-${safe}`;
}
