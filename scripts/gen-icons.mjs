import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const outDir = fileURLToPath(new URL("../public/icons/", import.meta.url));
mkdirSync(outDir, { recursive: true });

function svgIcon({ size, padding = 0 }) {
  const inner = size - padding * 2;
  return `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#0b0f14"/>
    <g transform="translate(${padding},${padding})">
      <rect x="${inner * 0.12}" y="${inner * 0.2}" width="${inner * 0.76}" height="${inner * 0.6}" rx="${inner * 0.04}" fill="#f5c542"/>
      <rect x="${inner * 0.12}" y="${inner * 0.2}" width="${inner * 0.76}" height="${inner * 0.12}" fill="#0b0f14"/>
      ${[0.18, 0.34, 0.5, 0.66, 0.82].map((x) => `<rect x="${inner * x - inner * 0.02}" y="${inner * 0.2}" width="${inner * 0.04}" height="${inner * 0.12}" fill="#f5c542"/>`).join("")}
      <circle cx="${inner * 0.5}" cy="${inner * 0.58}" r="${inner * 0.14}" fill="#0b0f14"/>
      <polygon points="${inner * 0.46},${inner * 0.51} ${inner * 0.46},${inner * 0.65} ${inner * 0.58},${inner * 0.58}" fill="#f5c542"/>
    </g>
  </svg>`;
}

const targets = [
  { name: "icon-192.png", size: 192, padding: 0 },
  { name: "icon-512.png", size: 512, padding: 0 },
  { name: "icon-maskable-512.png", size: 512, padding: 64 },
  { name: "apple-touch-icon.png", size: 180, padding: 0 },
];

for (const t of targets) {
  const svg = Buffer.from(svgIcon(t));
  await sharp(svg).png().toFile(outDir + t.name);
  console.log("wrote", t.name);
}
