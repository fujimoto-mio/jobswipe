import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  PRESIGNED_READ_URL_EXPIRY_SECONDS,
  type StorageBucket,
} from "@/lib/storage/constants";
import { getR2Client, getR2Config, resolveBucketName } from "@/lib/storage/r2-client";

type CacheEntry = { url: string; expiresAt: number };

const presignCache = new Map<string, CacheEntry>();
const CACHE_REFRESH_BUFFER_MS = 5 * 60 * 1000;

function cacheKey(bucket: StorageBucket, key: string): string {
  return `${bucket}:${key}`;
}

export async function getSignedReadUrl(bucket: StorageBucket, key: string): Promise<string | null> {
  const config = getR2Config();
  const client = getR2Client();
  if (!config || !client) return null;

  const hit = presignCache.get(cacheKey(bucket, key));
  if (hit && hit.expiresAt > Date.now() + CACHE_REFRESH_BUFFER_MS) {
    return hit.url;
  }

  const bucketName = resolveBucketName(bucket, config);
  const url = await getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: bucketName, Key: key }),
    { expiresIn: PRESIGNED_READ_URL_EXPIRY_SECONDS }
  );

  presignCache.set(cacheKey(bucket, key), {
    url,
    expiresAt: Date.now() + PRESIGNED_READ_URL_EXPIRY_SECONDS * 1000,
  });

  return url;
}

export async function getSignedReadUrls(
  items: Array<{ bucket: StorageBucket; key: string }>
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  if (items.length === 0) return results;

  const urls = await Promise.all(items.map((item) => getSignedReadUrl(item.bucket, item.key)));
  items.forEach((item, index) => {
    const url = urls[index];
    if (url) results.set(cacheKey(item.bucket, item.key), url);
  });
  return results;
}
