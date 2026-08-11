import sharp from "sharp";
import { fileURLToPath } from "node:url";

const SOURCE = "C:/Users/lrobh/Downloads/final logo.png";
const iconsDir = fileURLToPath(new URL("../public/icons/", import.meta.url));

async function buildIcon(size, outName) {
  await sharp(SOURCE)
    .resize(size, size, { fit: "cover" })
    .png()
    .toFile(iconsDir + outName);
  console.log("wrote", outName);
}

async function buildMaskable(size, outName) {
  const padding = Math.round(size * 0.16);
  const inner = size - padding * 2;
  const resized = await sharp(SOURCE)
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

await buildIcon(192, "icon-192.png");
await buildIcon(512, "icon-512.png");
await buildIcon(180, "apple-touch-icon.png");
await buildMaskable(512, "icon-maskable-512.png");
