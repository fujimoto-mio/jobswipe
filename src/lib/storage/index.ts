export {
  STORAGE_BUCKETS,
  UPLOAD_KIND_CONFIG,
  BUCKET_FOLDER_PATHS,
  BUCKET_SETUP,
  MULTIPART_UPLOAD_THRESHOLD_BYTES,
  PRESIGNED_READ_URL_EXPIRY_SECONDS,
  buildStorageKey,
  isPrivateUploadKind,
  type StorageBucket,
  type UploadKind,
} from "@/lib/storage/constants";

export {
  buildStorageRef,
  buildPublicObjectUrl,
  parseStorageObjectRef,
  resolveObjectReadUrl,
  isPrivateStorageRef,
  isStorageRef,
  type StorageObjectRef,
} from "@/lib/storage/urls";

export {
  resolveStorageReadUrl,
  resolveJobMedia,
  resolveSeekerProfileMedia,
  resolveStaffMediaFields,
  resolveAvatarUrl,
} from "@/lib/storage/resolve-media";

export {
  validateUploadFile,
  resolveUploadContentType,
  uploadToStorage,
  uploadByKind,
  deleteFromStorage,
  uploadJobVideo,
  uploadThumbnail,
  isStorageUrl,
  isSupabaseStorageUrl,
  getStorageBucketFromUrl,
  getStorageObjectKeyFromUrl,
} from "@/lib/storage/server";
