import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const src = "C:/Users/lrobh/Downloads/";
const iconsDir = fileURLToPath(new URL("../public/icons/", import.meta.url));
const brandDir = fileURLToPath(new URL("../public/brand/", import.meta.url));
mkdirSync(iconsDir, { recursive: true });
mkdirSync(brandDir, { recursive: true });

const MONOGRAM = src + "HardcopyLogo.png";
const WORDMARK = src + "HardcopyBRAND.png";
const LOCKUP = src + "Hardcopy.png";

// --- App icons: monogram trimmed + composited onto solid white ---
async function buildIcon(size, padding, outName) {
  const inner = size - padding * 2;
  const resized = await sharp(MONOGRAM)
    .trim()
    .resize(inner, inner, { fit: "contain", background: "#ffffff" })
    .png()
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: "#ffffff" },
  })
    .composite([{ input: resized, left: padding, top: padding }])
    .png()
    .toFile(iconsDir + outName);
  console.log("wrote", outName);
}

await buildIcon(192, 0, "icon-192.png");
await buildIcon(512, 0, "icon-512.png");
await buildIcon(512, 70, "icon-maskable-512.png");
await buildIcon(180, 0, "apple-touch-icon.png");

// --- In-app brand assets: trimmed, kept transparent ---
async function buildTransparent(inputPath, outName) {
  const img = sharp(inputPath).trim();
  const meta = await img.metadata();
  await img.png().toFile(brandDir + outName);
  console.log("wrote", outName, `${meta.width}x${meta.height}`);
}

await buildTransparent(MONOGRAM, "mark.png");
await buildTransparent(WORDMARK, "wordmark.png");
await buildTransparent(LOCKUP, "lockup.png");
