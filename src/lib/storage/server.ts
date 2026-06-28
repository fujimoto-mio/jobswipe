import { createSupabaseServiceClient } from "@/lib/supabase/server";
import {
  STORAGE_BUCKETS,
  UPLOAD_KIND_CONFIG,
  type StorageBucket,
  type UploadKind,
} from "@/lib/storage/constants";

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function buildObjectPath(folder: string, filename: string, userId?: string): string {
  const safe = sanitizeFilename(filename);
  const prefix = userId ? `${folder}/${userId}` : folder;
  return `${prefix}/${Date.now()}-${safe}`;
}

function mimeMatches(contentType: string, rule: string | string[]): boolean {
  if (Array.isArray(rule)) return rule.includes(contentType);
  return contentType.startsWith(rule);
}

export function validateUploadFile(
  kind: UploadKind,
  contentType: string,
  size: number
): { ok: true } | { ok: false; message: string } {
  const config = UPLOAD_KIND_CONFIG[kind];
  if (!mimeMatches(contentType, config.mimePrefix)) {
    return { ok: false, message: "ファイル形式が正しくありません" };
  }
  if (size > config.maxBytes) {
    const maxMb = Math.round(config.maxBytes / (1024 * 1024));
    return { ok: false, message: `ファイルサイズが大きすぎます（最大 ${maxMb}MB）` };
  }
  return { ok: true };
}

export async function uploadToStorage(
  bucket: StorageBucket,
  path: string,
  body: Buffer | ArrayBuffer,
  contentType: string,
  options?: { upsert?: boolean }
): Promise<string> {
  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    throw new Error("Supabase Storage is not configured");
  }

  const { error } = await supabase.storage.from(bucket).upload(path, body, {
    contentType,
    upsert: options?.upsert ?? true,
  });

  if (error) throw new Error(error.message);

  const config = Object.values(UPLOAD_KIND_CONFIG).find((c) => c.bucket === bucket);
  if (config?.public === false) {
    const { data, error: signError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 60 * 24 * 365);
    if (signError || !data?.signedUrl) {
      throw new Error(signError?.message ?? "Signed URL generation failed");
    }
    return data.signedUrl;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadByKind(
  kind: UploadKind,
  file: Buffer,
  filename: string,
  contentType: string,
  options?: { userId?: string }
): Promise<string> {
  const validation = validateUploadFile(kind, contentType, file.byteLength);
  if (!validation.ok) throw new Error(validation.message);

  const config = UPLOAD_KIND_CONFIG[kind];
  const path = buildObjectPath(config.folder, filename, options?.userId);
  return uploadToStorage(config.bucket, path, file, contentType);
}

export async function getSignedStorageUrl(
  bucket: StorageBucket,
  path: string,
  expiresInSeconds = 3600
): Promise<string> {
  const supabase = createSupabaseServiceClient();
  if (!supabase) throw new Error("Supabase Storage is not configured");

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
  if (error || !data?.signedUrl) {
    throw new Error(error?.message ?? "Signed URL generation failed");
  }
  return data.signedUrl;
}

export async function deleteFromStorage(bucket: StorageBucket, path: string): Promise<void> {
  const supabase = createSupabaseServiceClient();
  if (!supabase) throw new Error("Supabase Storage is not configured");

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(error.message);
}

/** @deprecated Use uploadByKind("video", ...) */
export async function uploadJobVideo(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  return uploadByKind("video", file, filename, contentType);
}

/** @deprecated Use uploadByKind("thumbnail", ...) */
export async function uploadThumbnail(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  return uploadByKind("thumbnail", file, filename, contentType);
}

export function isSupabaseStorageUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.pathname.includes("/storage/v1/object/");
  } catch {
    return false;
  }
}

export function getStorageBucketFromUrl(url: string): StorageBucket | null {
  if (!isSupabaseStorageUrl(url)) return null;
  for (const bucket of Object.values(STORAGE_BUCKETS)) {
    if (url.includes(`/${bucket}/`)) return bucket;
  }
  return null;
}
