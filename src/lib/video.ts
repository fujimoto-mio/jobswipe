/** Production video specs per JobSwipe v1 (15–30 sec vertical) */
export const VIDEO_SPECS = {
  format: "MP4 (H.264 + AAC)",
  maxResolution: "1080×1920 (9:16 vertical)",
  recommendedResolution: "720×1280",
  maxBitrate: "4 Mbps",
  recommendedBitrate: "2–3 Mbps",
  minDurationSec: 15,
  maxDurationSec: 30,
  maxFileSizeMB: 30,
  faststart: true,
} as const;

export const VIDEO_UPLOAD_TIPS = [
  "MP4 (H.264) 形式、720p・2〜3Mbps 推奨",
  "縦型（9:16）15〜30秒の動画（仕様書準拠）",
  "ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset fast -movflags +faststart -t 30 -vf scale=720:-2 output.mp4",
  "Supabase Storage（job-videos バケット）にアップロード",
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

export function validateVideoDuration(file: File): Promise<{ ok: true } | { ok: false; message: string }> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    const url = URL.createObjectURL(file);
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      const duration = video.duration;
      if (Number.isNaN(duration)) {
        resolve({ ok: false, message: "動画の長さを読み取れませんでした" });
        return;
      }
      if (duration < VIDEO_SPECS.minDurationSec || duration > VIDEO_SPECS.maxDurationSec) {
        resolve({
          ok: false,
          message: `動画は${VIDEO_SPECS.minDurationSec}〜${VIDEO_SPECS.maxDurationSec}秒である必要があります（現在: ${Math.round(duration)}秒）`,
        });
        return;
      }
      resolve({ ok: true });
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ ok: false, message: "動画ファイルを読み込めませんでした" });
    };
    video.src = url;
  });
}

export async function validateVideoFileFull(
  file: File
): Promise<{ ok: true } | { ok: false; message: string }> {
  const basic = validateVideoFile(file);
  if (!basic.ok) return basic;
  return validateVideoDuration(file);
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
