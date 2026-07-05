/**
 * Verifies R2 buckets and seeds folder prefixes for JobSwipe.
 * Run: npm run storage:setup
 */
import { CreateBucketCommand, HeadBucketCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const PUBLIC_BUCKET = process.env.R2_BUCKET_PUBLIC ?? "jobswipe-public";
const PRIVATE_BUCKET = process.env.R2_BUCKET_PRIVATE ?? "jobswipe-private";
const PUBLIC_FOLDERS = [
  "jobs/videos",
  "jobs/thumbnails",
  "company-logos",
  "company-banners",
  "staff-avatars",
  "seeker-avatars",
  "seeker-banners",
];
const PRIVATE_FOLDERS = ["chat/attachments", "seekers/resumes"];

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

if (!accountId || !accessKeyId || !secretAccessKey) {
  console.error("Missing R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, or R2_SECRET_ACCESS_KEY in .env");
  process.exit(1);
}

const client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

async function ensureBucket(name, label) {
  try {
    await client.send(new HeadBucketCommand({ Bucket: name }));
    console.log(`OK: ${name} — ${label}`);
    return true;
  } catch {
    try {
      await client.send(new CreateBucketCommand({ Bucket: name }));
      console.log(`Created bucket: ${name} — ${label}`);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`Failed to create bucket "${name}":`, message);
      return false;
    }
  }
}

async function seedFolders(bucket, folders) {
  for (const folder of folders) {
    const key = `${folder}/.keep`;
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: "",
        ContentType: "application/octet-stream",
      })
    );
    console.log(`  Created folder: ${folder}/`);
  }
}

let ok = true;
ok &&= await ensureBucket(PUBLIC_BUCKET, "public media (videos, images, avatars)");
ok &&= await ensureBucket(PRIVATE_BUCKET, "private (chat attachments, resumes/CVs)");
if (!ok) process.exit(1);

console.log(`\nSeeding folders in ${PUBLIC_BUCKET}:`);
await seedFolders(PUBLIC_BUCKET, PUBLIC_FOLDERS);

console.log(`\nSeeding folders in ${PRIVATE_BUCKET}:`);
await seedFolders(PRIVATE_BUCKET, PRIVATE_FOLDERS);

console.log("\nR2 storage ready.");
console.log("Uploads store r2:// refs; API reads use presigned URLs.");
console.log("Optional later: set R2_PRIVATE_BUCKET_URL for stable CDN URLs on private bucket reads.");
