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

// Precise crop rects found by scanning the alpha channel for the main
// content band and excluding a small stray artifact near the bottom of
// each source export (visible as a "tiny white box" once naively trimmed).
const CROPS = {
  monogram: { left: 27, top: 0, width: 2356, height: 833 },
  wordmark: { left: 0, top: 0, width: 2695, height: 431 },
  lockup: { left: 0, top: 0, width: 2695, height: 1353 },
};

async function croppedBuffer(inputPath, crop) {
  return sharp(inputPath).extract(crop).png().toBuffer();
}

// --- App icons: monogram composited onto white, biased downward per
// feedback that centered placement reads as "too high" ---
async function buildIcon(size, padding, outName) {
  const cropped = await croppedBuffer(MONOGRAM, CROPS.monogram);
  const inner = size - padding * 2;
  const aspect = CROPS.monogram.width / CROPS.monogram.height;
  const drawW = inner;
  const drawH = Math.round(inner / aspect);
  const resized = await sharp(cropped)
    .resize(drawW, drawH, { fit: "fill" })
    .png()
    .toBuffer();

  const remaining = inner - drawH;
  const topOffset = padding + Math.round(remaining * 0.62);

  await sharp({
    create: { width: size, height: size, channels: 4, background: "#ffffff" },
  })
    .composite([{ input: resized, left: padding, top: topOffset }])
    .png()
    .toFile(iconsDir + outName);
  console.log("wrote", outName);
}

await buildIcon(192, 0, "icon-192.png");
await buildIcon(512, 0, "icon-512.png");
await buildIcon(512, 70, "icon-maskable-512.png");
await buildIcon(180, 0, "apple-touch-icon.png");

// --- In-app brand assets: tight-cropped, transparent ---
async function buildTransparent(inputPath, crop, outName) {
  const buf = await croppedBuffer(inputPath, crop);
  await sharp(buf).toFile(brandDir + outName);
  console.log("wrote", outName, `${crop.width}x${crop.height}`);
}

await buildTransparent(MONOGRAM, CROPS.monogram, "mark.png");
await buildTransparent(WORDMARK, CROPS.wordmark, "wordmark.png");
await buildTransparent(LOCKUP, CROPS.lockup, "lockup.png");
