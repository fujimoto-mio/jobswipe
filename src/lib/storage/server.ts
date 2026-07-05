import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { API_ERRORS } from "@/lib/api-errors";
import {
  MULTIPART_UPLOAD_THRESHOLD_BYTES,
  STORAGE_BUCKETS,
  UPLOAD_KIND_CONFIG,
  buildStorageKey,
  type StorageBucket,
  type UploadKind,
} from "@/lib/storage/constants";
import {
  getMissingR2EnvVars,
  getR2Client,
  getR2Config,
  resolveBucketName,
} from "@/lib/storage/r2-client";
import { buildStorageRef, parseStorageObjectRef } from "@/lib/storage/urls";
import { resolveUploadContentType, validateResolvedUpload } from "@/lib/upload/validation";

export { resolveUploadContentType, SUPPORTED_IMAGE_MIMES } from "@/lib/upload/validation";

export function validateUploadFile(
  kind: UploadKind,
  contentType: string,
  size: number
): { ok: true } | { ok: false; message: string } {
  const message = validateResolvedUpload(kind, contentType, size);
  if (message) return { ok: false, message };
  return { ok: true };
}

function cacheControlFor(contentType: string): string {
  if (contentType.startsWith("video/")) return "public, max-age=31536000, immutable";
  if (contentType.startsWith("image/")) return "public, max-age=86400";
  return "private, max-age=3600";
}

async function putObject(
  client: NonNullable<ReturnType<typeof getR2Client>>,
  bucketName: string,
  path: string,
  payload: Buffer,
  contentType: string
): Promise<void> {
  const params = {
    Bucket: bucketName,
    Key: path,
    Body: payload,
    ContentType: contentType,
    CacheControl: cacheControlFor(contentType),
  };

  if (payload.byteLength >= MULTIPART_UPLOAD_THRESHOLD_BYTES) {
    const upload = new Upload({
      client,
      params,
      queueSize: 4,
      partSize: MULTIPART_UPLOAD_THRESHOLD_BYTES,
      leavePartsOnError: false,
    });
    await upload.done();
    return;
  }

  await client.send(new PutObjectCommand(params));
}

export async function uploadToStorage(
  bucket: StorageBucket,
  path: string,
  body: Buffer | ArrayBuffer,
  contentType: string
): Promise<string> {
  const config = getR2Config();
  const client = getR2Client();
  if (!config || !client) {
    const missing = getMissingR2EnvVars();
    throw new Error(
      missing.length
        ? `Cloudflare R2 is not configured (missing: ${missing.join(", ")})`
        : API_ERRORS.r2NotConfigured
    );
  }

  const bucketName = resolveBucketName(bucket, config);
  const payload =
    body instanceof Buffer
      ? body
      : Buffer.from(body instanceof ArrayBuffer ? new Uint8Array(body) : body);

  await putObject(client, bucketName, path, payload, contentType);

  return buildStorageRef(bucketName, path);
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

  const kindConfig = UPLOAD_KIND_CONFIG[kind];
  const path = buildStorageKey(kindConfig.folder, filename, options?.userId);
  return uploadToStorage(kindConfig.bucket, path, file, contentType);
}

export async function deleteFromStorage(bucket: StorageBucket, path: string): Promise<void> {
  const config = getR2Config();
  const client = getR2Client();
  if (!config || !client) {
    const missing = getMissingR2EnvVars();
    throw new Error(
      missing.length
        ? `Cloudflare R2 is not configured (missing: ${missing.join(", ")})`
        : API_ERRORS.r2NotConfigured
    );
  }

  const bucketName = resolveBucketName(bucket, config);
  await client.send(new DeleteObjectCommand({ Bucket: bucketName, Key: path }));
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

export function isStorageUrl(url: string): boolean {
  if (!url) return false;
  if (parseStorageObjectRef(url)) return true;
  return isSupabaseStorageUrl(url);
}

/** @deprecated Use isStorageUrl — kept for legacy Supabase URLs in the database */
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
  const ref = parseStorageObjectRef(url);
  if (ref) return ref.bucket;

  if (isSupabaseStorageUrl(url)) {
    if (url.includes("/resumes/") || url.includes(`/${STORAGE_BUCKETS.private}/`)) {
      return STORAGE_BUCKETS.private;
    }
    return STORAGE_BUCKETS.public;
  }

  return null;
}

export function getStorageObjectKeyFromUrl(url: string): string | null {
  return parseStorageObjectRef(url)?.key ?? null;
}
