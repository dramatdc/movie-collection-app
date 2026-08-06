import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const source = "C:/Users/lrobh/Downloads/IMG_1336.PNG";
const outDir = fileURLToPath(new URL("../public/icons/", import.meta.url));
mkdirSync(outDir, { recursive: true });

async function flattenOnWhite(size, padding = 0) {
  const inner = size - padding * 2;
  const resized = await sharp(source)
    .resize(inner, inner, { fit: "contain", background: "#ffffff" })
    .toBuffer();

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: "#ffffff",
    },
  })
    .composite([{ input: resized, left: padding, top: padding }])
    .png()
    .toBuffer();
}

const targets = [
  { name: "icon-192.png", size: 192, padding: 0 },
  { name: "icon-512.png", size: 512, padding: 0 },
  { name: "icon-maskable-512.png", size: 512, padding: 70 },
  { name: "apple-touch-icon.png", size: 180, padding: 0 },
];

for (const t of targets) {
  const buf = await flattenOnWhite(t.size, t.padding);
  await sharp(buf).toFile(outDir + t.name);
  console.log("wrote", t.name);
}
