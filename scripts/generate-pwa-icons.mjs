import sharp from "sharp";
import { mkdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "public", "icons");

const SIZES = [180, 192, 512];
const MASKABLE_SIZE = 512;
const MASKABLE_BG = "#000000";

async function resolveSourceLogo() {
  const webp = path.join(root, "public", "logo.webp");
  const png = path.join(root, "public", "logo.png");
  try {
    await access(webp);
    return webp;
  } catch {
    return png;
  }
}

async function generate() {
  const source = await resolveSourceLogo();
  await mkdir(outDir, { recursive: true });

  for (const size of SIZES) {
    await sharp(source)
      .resize(size, size, { fit: "contain", background: MASKABLE_BG })
      .webp({ quality: 90, effort: 4 })
      .toFile(path.join(outDir, `icon-${size}.webp`));
  }

  const logoSize = Math.round(MASKABLE_SIZE * 0.62);
  const maskableLogo = await sharp(source)
    .resize(logoSize, logoSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 90, effort: 4 })
    .toBuffer();

  await sharp({
    create: {
      width: MASKABLE_SIZE,
      height: MASKABLE_SIZE,
      channels: 4,
      background: MASKABLE_BG,
    },
  })
    .composite([{ input: maskableLogo, gravity: "center" }])
    .webp({ quality: 90, effort: 4 })
    .toFile(path.join(outDir, "icon-512-maskable.webp"));

  console.log("PWA icons written to public/icons/ (.webp)");
}

generate().catch((error) => {
  console.error(error);
  process.exit(1);
});
