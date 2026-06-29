/** Supabase Storage bucket names */
export const STORAGE_BUCKETS = {
  videos: "job-videos",
  thumbnails: "thumbnails",
  images: "images",
  resumes: "resumes",
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

export type UploadKind = "video" | "thumbnail" | "image" | "resume" | "company-logo" | "company-banner" | "staff-avatar" | "seeker-avatar" | "seeker-banner";

export const UPLOAD_KIND_CONFIG: Record<
  UploadKind,
  {
    bucket: StorageBucket;
    folder: string;
    maxBytes: number;
    mimePrefix: string | string[];
    public: boolean;
  }
> = {
  video: {
    bucket: STORAGE_BUCKETS.videos,
    folder: "jobs",
    maxBytes: 30 * 1024 * 1024,
    mimePrefix: "video/",
    public: true,
  },
  thumbnail: {
    bucket: STORAGE_BUCKETS.thumbnails,
    folder: "jobs",
    maxBytes: 5 * 1024 * 1024,
    mimePrefix: "image/",
    public: true,
  },
  image: {
    bucket: STORAGE_BUCKETS.images,
    folder: "uploads",
    maxBytes: 5 * 1024 * 1024,
    mimePrefix: "image/",
    public: true,
  },
  "company-logo": {
    bucket: STORAGE_BUCKETS.images,
    folder: "company-logos",
    maxBytes: 2 * 1024 * 1024,
    mimePrefix: "image/",
    public: true,
  },
  "company-banner": {
    bucket: STORAGE_BUCKETS.images,
    folder: "company-banners",
    maxBytes: 5 * 1024 * 1024,
    mimePrefix: "image/",
    public: true,
  },
  "staff-avatar": {
    bucket: STORAGE_BUCKETS.images,
    folder: "staff-avatars",
    maxBytes: 2 * 1024 * 1024,
    mimePrefix: "image/",
    public: true,
  },
  "seeker-avatar": {
    bucket: STORAGE_BUCKETS.images,
    folder: "seeker-avatars",
    maxBytes: 2 * 1024 * 1024,
    mimePrefix: "image/",
    public: true,
  },
  "seeker-banner": {
    bucket: STORAGE_BUCKETS.images,
    folder: "seeker-banners",
    maxBytes: 5 * 1024 * 1024,
    mimePrefix: "image/",
    public: true,
  },
  resume: {
    bucket: STORAGE_BUCKETS.resumes,
    folder: "seekers",
    maxBytes: 10 * 1024 * 1024,
    mimePrefix: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    public: false,
  },
};

export const BUCKET_SETUP = [
  {
    id: STORAGE_BUCKETS.videos,
    public: true,
    fileSizeLimit: 30 * 1024 * 1024,
    allowedMimeTypes: ["video/mp4", "video/webm", "video/quicktime", "video/*"],
  },
  {
    id: STORAGE_BUCKETS.thumbnails,
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  {
    id: STORAGE_BUCKETS.images,
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  {
    id: STORAGE_BUCKETS.resumes,
    public: false,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
] as const;
