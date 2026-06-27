import { createSupabaseServiceClient } from "@/lib/supabase/server";

const VIDEO_BUCKET = "job-videos";
const THUMB_BUCKET = "thumbnails";

export async function uploadToStorage(
  bucket: string,
  path: string,
  body: Buffer | ArrayBuffer,
  contentType: string
): Promise<string> {
  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    throw new Error("Supabase Storage is not configured");
  }

  const { error } = await supabase.storage.from(bucket).upload(path, body, {
    contentType,
    upsert: true,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadJobVideo(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `jobs/${Date.now()}-${safe}`;
  return uploadToStorage(VIDEO_BUCKET, path, file, contentType);
}

export async function uploadThumbnail(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `thumbs/${Date.now()}-${safe}`;
  return uploadToStorage(THUMB_BUCKET, path, file, contentType);
}
