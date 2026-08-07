import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const outDir = fileURLToPath(new URL("../public/icons/", import.meta.url));
mkdirSync(outDir, { recursive: true });

// Three shelved "spines" mark — ties directly to the app's physical-media
// positioning rather than a generic clapperboard/film-reel icon.
function svgIcon({ size, padding = 0 }) {
  const inner = size - padding * 2;
  const s = inner / 100;
  const t = (x) => padding + x * s;

  return `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#1e1e1e"/>
    <rect x="${t(24)}" y="${t(20)}" width="${12 * s}" height="${60 * s}" rx="${4 * s}" fill="#0095d5"/>
    <rect x="${t(44)}" y="${t(28)}" width="${12 * s}" height="${52 * s}" rx="${4 * s}" fill="#5cc2ec"/>
    <rect x="${t(64)}" y="${t(20)}" width="${12 * s}" height="${60 * s}" rx="${4 * s}" fill="#0095d5"/>
  </svg>`;
}

const targets = [
  { name: "icon-192.png", size: 192, padding: 0 },
  { name: "icon-512.png", size: 512, padding: 0 },
  { name: "icon-maskable-512.png", size: 512, padding: 70 },
  { name: "apple-touch-icon.png", size: 180, padding: 0 },
];

for (const t of targets) {
  const svg = Buffer.from(svgIcon(t));
  await sharp(svg).png().toFile(outDir + t.name);
  console.log("wrote", t.name);
}
