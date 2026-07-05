import sharp from "sharp";
import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const RASTER_EXT = new Set([".png", ".jpg", ".jpeg"]);
const WEBP_QUALITY = 85;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (RASTER_EXT.has(path.extname(entry.name).toLowerCase())) {
      files.push(fullPath);
    }
  }
  return files;
}

async function convertFile(inputPath) {
  const ext = path.extname(inputPath);
  const outputPath = inputPath.slice(0, -ext.length) + ".webp";
  const before = (await stat(inputPath)).size;

  await sharp(inputPath)
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toFile(outputPath);

  const after = (await stat(outputPath)).size;
  await unlink(inputPath);

  const saved = before - after;
  const pct = before ? Math.round((saved / before) * 100) : 0;
  console.log(`  ${path.relative(publicDir, inputPath)} → webp (${formatBytes(before)} → ${formatBytes(after)}, -${pct}%)`);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function main() {
  const files = await walk(publicDir);
  if (!files.length) {
    console.log("No PNG/JPEG assets found under public/");
    return;
  }

  console.log(`Converting ${files.length} raster asset(s) to WebP (quality ${WEBP_QUALITY})…`);
  for (const file of files) {
    await convertFile(file);
  }
  console.log("Done.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
