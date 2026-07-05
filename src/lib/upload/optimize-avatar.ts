import sharp from "sharp";

/** Max edge length — covers 2x retina for profile hero (~88px) and chat (~32–44px). */
export const AVATAR_PIXEL_SIZE = 256;

const AVATAR_KINDS = new Set(["staff-avatar", "seeker-avatar"]);

export function isAvatarUploadKind(kind: string): boolean {
  return AVATAR_KINDS.has(kind);
}

export async function optimizeAvatarImage(input: Buffer): Promise<Buffer> {
  return sharp(input, { failOn: "none" })
    .rotate()
    .resize(AVATAR_PIXEL_SIZE, AVATAR_PIXEL_SIZE, {
      fit: "cover",
      position: "centre",
    })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
}

export function toOptimizedAvatarFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "") || "avatar";
  return `${base}.webp`;
}
