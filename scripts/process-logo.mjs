import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const src = "C:/Users/lrobh/Downloads/";
const iconsDir = fileURLToPath(new URL("../public/icons/", import.meta.url));
const brandDir = fileURLToPath(new URL("../public/brand/", import.meta.url));
mkdirSync(iconsDir, { recursive: true });
mkdirSync(brandDir, { recursive: true });

async function whiteToTransparent(inputPath, threshold = 245) {
  const { data, info } = await sharp(inputPath)
    .trim()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  for (let i = 0; i < data.length; i += channels) {
    if (data[i] >= threshold && data[i + 1] >= threshold && data[i + 2] >= threshold) {
      data[i + 3] = 0;
    }
  }
  return { data, width, height, channels };
}

// --- App icons: monogram composited onto solid white (icons shouldn't be
// transparent — iOS flattens apple-touch-icon transparency to black) ---
async function buildIcon(size, padding, outName) {
  const { data, width, height, channels } = await whiteToTransparent(
    src + "Hardcopy Logo Only.jpg"
  );
  const inner = size - padding * 2;
  const resized = await sharp(data, { raw: { width, height, channels } })
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

// --- In-app brand assets: transparent PNGs for use on the dark UI ---
async function buildTransparent(fileName, outName) {
  const { data, width, height, channels } = await whiteToTransparent(src + fileName);
  await sharp(data, { raw: { width, height, channels } }).png().toFile(brandDir + outName);
  console.log("wrote", outName, `${width}x${height}`);
}

await buildTransparent("Hardcopy Logo Only.jpg", "mark.png");
await buildTransparent("Hardcopy Words.jpg", "wordmark.png");
await buildTransparent("Hardcopy full Logo.jpg", "lockup.png");
