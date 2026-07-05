import { BUCKET_FOLDER_PATHS, STORAGE_BUCKETS, type StorageBucket } from "@/lib/storage/constants";
import { getBucketBaseUrl, getR2Config, resolveBucketFromName } from "@/lib/storage/r2-client";
import { getSignedReadUrl } from "@/lib/storage/signed-urls";

const LEGACY_SUPABASE_BUCKETS: Record<string, StorageBucket> = {
  "job-videos": STORAGE_BUCKETS.public,
  thumbnails: STORAGE_BUCKETS.public,
  images: STORAGE_BUCKETS.public,
  resumes: STORAGE_BUCKETS.private,
};

const PUBLIC_KEY_PREFIXES = BUCKET_FOLDER_PATHS[STORAGE_BUCKETS.public].map((folder) => `${folder}/`);
const PRIVATE_KEY_PREFIXES = BUCKET_FOLDER_PATHS[STORAGE_BUCKETS.private].map((folder) => `${folder}/`);

export type StorageObjectRef = {
  bucket: StorageBucket;
  key: string;
};

export function buildStorageRef(bucketName: string, key: string): string {
  return `r2://${bucketName}/${key}`;
}

export function buildPublicObjectUrl(publicBaseUrl: string, key: string): string {
  return `${publicBaseUrl.replace(/\/$/, "")}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

function getStableObjectUrl(bucket: StorageBucket, key: string): string | null {
  const config = getR2Config();
  if (!config) return null;
  const baseUrl = getBucketBaseUrl(bucket, config);
  if (!baseUrl) return null;
  return buildPublicObjectUrl(baseUrl, key);
}

/** True when R2_PUBLIC_BUCKET_URL is set — public media uses stable CDN URLs instead of presigning. */
export function hasPublicCdnConfigured(): boolean {
  return Boolean(getR2Config()?.publicBucketUrl);
}

/**
 * Resolve a stored ref to a browser-ready URL synchronously (CDN only).
 * Returns null when the value needs async presigning.
 */
export function resolvePublicReadUrlSync(url: string | null | undefined): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;

  const ref = parseStorageObjectRef(trimmed);
  if (!ref) return trimmed;

  if (ref.bucket !== STORAGE_BUCKETS.public) return null;

  return getStableObjectUrl(ref.bucket, ref.key);
}

/** Resolve a stored ref to a browser-ready URL (stable CDN URL or presigned). */
export async function resolveObjectReadUrl(bucket: StorageBucket, key: string): Promise<string | null> {
  const stable = getStableObjectUrl(bucket, key);
  if (stable) return stable;
  return getSignedReadUrl(bucket, key);
}

function hostMatchesBucketUrl(host: string, bucketUrl: string | null | undefined): boolean {
  if (!bucketUrl) return false;
  try {
    return new URL(bucketUrl).host === host;
  } catch {
    return false;
  }
}

function inferKeyByPrefix(pathname: string, prefixes: readonly string[]): string | null {
  const key = decodeURIComponent(pathname.replace(/^\//, ""));
  if (!key) return null;
  return prefixes.some((prefix) => key.startsWith(prefix)) ? key : null;
}

function refFromBucketName(bucketName: string, key: string, config: ReturnType<typeof getR2Config>): StorageObjectRef | null {
  if (!config) return null;
  const bucket = resolveBucketFromName(bucketName, config);
  return bucket ? { bucket, key } : null;
}

export function parseStorageObjectRef(url: string): StorageObjectRef | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }

  const config = getR2Config();

  if (parsed.protocol === "r2:") {
    const bucketName = parsed.hostname;
    const key = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
    if (!bucketName || !key) return null;
    return refFromBucketName(bucketName, key, config);
  }

  if (config && hostMatchesBucketUrl(parsed.host, config.publicBucketUrl)) {
    const key = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
    return key ? { bucket: STORAGE_BUCKETS.public, key } : null;
  }

  if (config && hostMatchesBucketUrl(parsed.host, config.privateBucketUrl)) {
    const key = decodeURIComponent(parsed.pathname.replace(/^\//, ""));
    return key ? { bucket: STORAGE_BUCKETS.private, key } : null;
  }

  if (parsed.hostname.endsWith(".r2.cloudflarestorage.com") && config) {
    const segments = parsed.pathname.replace(/^\//, "").split("/");
    const bucketName = segments.shift();
    const key = segments.map((segment) => decodeURIComponent(segment)).join("/");
    if (!bucketName || !key) return null;
    return refFromBucketName(bucketName, key, config);
  }

  const supabaseMatch = parsed.pathname.match(
    /\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+)$/
  );
  if (supabaseMatch) {
    const [, legacyBucket, rawKey] = supabaseMatch;
    const bucket = LEGACY_SUPABASE_BUCKETS[legacyBucket];
    if (bucket) {
      return { bucket, key: decodeURIComponent(rawKey.split("?")[0]) };
    }
  }

  const publicKey = inferKeyByPrefix(parsed.pathname, PUBLIC_KEY_PREFIXES);
  if (publicKey) {
    return { bucket: STORAGE_BUCKETS.public, key: publicKey };
  }

  const privateKey = inferKeyByPrefix(parsed.pathname, PRIVATE_KEY_PREFIXES);
  if (privateKey) {
    return { bucket: STORAGE_BUCKETS.private, key: privateKey };
  }

  return null;
}

export function isPrivateStorageRef(url: string): boolean {
  const ref = parseStorageObjectRef(url);
  return ref?.bucket === STORAGE_BUCKETS.private;
}

export function isStorageRef(url: string): boolean {
  return url.trim().startsWith("r2://");
}
