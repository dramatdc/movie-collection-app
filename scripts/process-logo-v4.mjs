import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const MONOGRAM = "C:/Users/lrobh/Downloads/Hardcopy.png";
const LOCKUP = "C:/Users/lrobh/Downloads/FinalTotalHardcopy.png";

const iconsDir = fileURLToPath(new URL("../public/icons/", import.meta.url));
const brandDir = fileURLToPath(new URL("../public/brand/", import.meta.url));
mkdirSync(iconsDir, { recursive: true });
mkdirSync(brandDir, { recursive: true });

// App icons: monogram centered (symmetric) on white.
async function buildIcon(size, padding, outName) {
  const inner = size - padding * 2;
  const resized = await sharp(MONOGRAM)
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

// Brand assets used in-app: transparent, tightly cropped already.
await sharp(LOCKUP).toFile(brandDir + "lockup.png");
console.log("wrote lockup.png");
