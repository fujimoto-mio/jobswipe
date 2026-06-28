/**
 * Creates Supabase Storage buckets for JobSwipe (images, videos, resumes).
 * Run: npm run storage:setup
 */
import { createClient } from "@supabase/supabase-js";

const BUCKETS = [
  {
    id: "job-videos",
    public: true,
    fileSizeLimit: 30 * 1024 * 1024,
    allowedMimeTypes: ["video/mp4", "video/webm", "video/quicktime"],
  },
  {
    id: "thumbnails",
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  {
    id: "images",
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  },
  {
    id: "resumes",
    public: false,
    fileSizeLimit: 10 * 1024 * 1024,
    allowedMimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
];

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: existing, error: listError } = await supabase.storage.listBuckets();
if (listError) {
  console.error("Failed to list buckets:", listError.message);
  process.exit(1);
}

const existingIds = new Set((existing ?? []).map((b) => b.id));

for (const bucket of BUCKETS) {
  if (existingIds.has(bucket.id)) {
    const { error: updateError } = await supabase.storage.updateBucket(bucket.id, {
      public: bucket.public,
      fileSizeLimit: bucket.fileSizeLimit,
      allowedMimeTypes: bucket.allowedMimeTypes,
    });
    if (updateError) {
      console.warn(`Could not update bucket "${bucket.id}":`, updateError.message);
    } else {
      console.log(`Updated bucket: ${bucket.id} (public=${bucket.public})`);
    }
    continue;
  }

  const { error } = await supabase.storage.createBucket(bucket.id, {
    public: bucket.public,
    fileSizeLimit: bucket.fileSizeLimit,
    allowedMimeTypes: bucket.allowedMimeTypes,
  });

  if (error) {
    console.error(`Failed to create bucket "${bucket.id}":`, error.message);
    process.exit(1);
  }

  console.log(`Created bucket: ${bucket.id} (public=${bucket.public})`);
}

console.log("\nStorage buckets ready.");
console.log("Public URLs: ", `${url}/storage/v1/object/public/<bucket>/<path>`);
