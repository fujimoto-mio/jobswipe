import { S3Client } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import http from "node:http";
import https from "node:https";
import { STORAGE_BUCKETS, type StorageBucket } from "@/lib/storage/constants";

export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBucket: string;
  privateBucket: string;
  /** Stable CDN URL for public bucket reads (job videos, logos, avatars). */
  publicBucketUrl: string | null;
  /** Optional — stable CDN URL when public access is enabled on the private bucket. */
  privateBucketUrl: string | null;
};

let client: S3Client | null = null;

const httpAgent = new http.Agent({ keepAlive: true, maxSockets: 50 });
const httpsAgent = new https.Agent({ keepAlive: true, maxSockets: 50 });

export function getR2Config(): R2Config | null {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const publicBucket = process.env.R2_BUCKET_PUBLIC?.trim() || STORAGE_BUCKETS.public;
  const privateBucket = process.env.R2_BUCKET_PRIVATE?.trim() || STORAGE_BUCKETS.private;
  const publicBucketUrl = process.env.R2_PUBLIC_BUCKET_URL?.trim().replace(/\/$/, "") || null;
  const privateBucketUrl = process.env.R2_PRIVATE_BUCKET_URL?.trim().replace(/\/$/, "") || null;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    publicBucket,
    privateBucket,
    publicBucketUrl,
    privateBucketUrl,
  };
}

export function getBucketBaseUrl(bucket: StorageBucket, config: R2Config): string | null {
  if (bucket === STORAGE_BUCKETS.public) return config.publicBucketUrl;
  return config.privateBucketUrl;
}

export function getMissingR2EnvVars(): string[] {
  const missing: string[] = [];
  if (!process.env.R2_ACCOUNT_ID?.trim()) missing.push("R2_ACCOUNT_ID");
  if (!process.env.R2_ACCESS_KEY_ID?.trim()) missing.push("R2_ACCESS_KEY_ID");
  if (!process.env.R2_SECRET_ACCESS_KEY?.trim()) missing.push("R2_SECRET_ACCESS_KEY");
  return missing;
}

export function getR2Client(): S3Client | null {
  const config = getR2Config();
  if (!config) return null;

  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      maxAttempts: 3,
      requestHandler: new NodeHttpHandler({
        httpAgent,
        httpsAgent,
        connectionTimeout: 10_000,
        socketTimeout: 120_000,
      }),
    });
  }

  return client;
}

export function resolveBucketName(bucket: StorageBucket, config: R2Config): string {
  return bucket === STORAGE_BUCKETS.public ? config.publicBucket : config.privateBucket;
}

export function resolveBucketFromName(bucketName: string, config: R2Config): StorageBucket | null {
  if (bucketName === config.publicBucket) return STORAGE_BUCKETS.public;
  if (bucketName === config.privateBucket) return STORAGE_BUCKETS.private;
  return null;
}
