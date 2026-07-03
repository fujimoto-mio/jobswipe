import { VIDEO_MAX_BYTES } from "@/lib/storage/constants";

/** Recommended video specs for job uploads */
export const VIDEO_SPECS = {
  format: "MP4 (H.264 + AAC)",
  maxResolution: "1080×1920 (9:16 vertical)",
  recommendedResolution: "720×1280",
  maxBitrate: "4 Mbps",
  recommendedBitrate: "2–3 Mbps",
  maxFileSizeMB: VIDEO_MAX_BYTES / (1024 * 1024),
  faststart: true,
} as const;

export const VIDEO_UPLOAD_TIPS = [
  "MP4 (H.264) 形式、720p・2〜3Mbps 推奨",
  "縦型（9:16）の動画を推奨",
  "ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset fast -movflags +faststart -vf scale=720:-2 output.mp4",
];
export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateVideoFile(file: File): { ok: true } | { ok: false; message: string } {
  if (!file.type.startsWith("video/")) {
    return { ok: false, message: "動画ファイルを選択してください" };
  }
  const maxBytes = VIDEO_SPECS.maxFileSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      ok: false,
      message: `ファイルサイズが大きすぎます（最大 ${VIDEO_SPECS.maxFileSizeMB}MB）`,
    };
  }
  return { ok: true };
}

export async function validateVideoFileFull(
  file: File
): Promise<{ ok: true } | { ok: false; message: string }> {
  return validateVideoFile(file);
}
export function preloadVideoUrl(url: string): HTMLVideoElement | null {
  if (!url || url.startsWith("blob:")) return null;
  const el = document.createElement("video");
  el.preload = "auto";
  el.muted = true;
  el.playsInline = true;
  el.src = url;
  el.load();
  return el;
}
