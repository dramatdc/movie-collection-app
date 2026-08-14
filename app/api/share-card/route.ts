import { NextRequest } from "next/server";
import sharp, { type Sharp } from "sharp";

// Generated server-side (rather than composited client-side on a <canvas>)
// so this never has to deal with cross-origin poster images tainting a
// canvas, or with font/rendering differences between browsers — it's the
// same image every time, for every caller.

const WIDTH = 1080;
const HEIGHT = 1620;
const GRADIENT_HEIGHT = 760;
const MARGIN_X = 64;

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Movie titles range from "Up" to "The Lord of the Rings: The Fellowship
// of the Ring" — greedily wraps to maxLines, ellipsizing the last line if
// there's still more left over after that.
function wrapText(text: string, maxChars: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  const last = kept[maxLines - 1].slice(0, Math.max(0, maxChars - 1)).replace(/\s+$/, "");
  kept[maxLines - 1] = `${last}…`;
  return kept;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "Untitled";
  const year = searchParams.get("year");
  const format = searchParams.get("format");
  const posterPath = searchParams.get("poster");
  // PNG is the safer choice specifically for writing to the OS clipboard —
  // some clipboard implementations are pickier about accepted image MIME
  // types than a plain <img> or a share-sheet attachment would be, so the
  // clipboard-copy path asks for this explicitly. Everything else gets the
  // much smaller JPEG by default.
  const wantsPng = searchParams.get("output") === "png";

  let base: Sharp;
  if (posterPath) {
    try {
      const posterRes = await fetch(`https://image.tmdb.org/t/p/w780${posterPath}`);
      if (!posterRes.ok) throw new Error(`poster fetch failed: ${posterRes.status}`);
      const posterBuf = Buffer.from(await posterRes.arrayBuffer());
      base = sharp(posterBuf).resize(WIDTH, HEIGHT, { fit: "cover", position: "attention" });
    } catch (err) {
      console.error("share-card poster fetch failed", err);
      base = sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background: "#1e1e1e" } });
    }
  } else {
    base = sharp({ create: { width: WIDTH, height: HEIGHT, channels: 3, background: "#1e1e1e" } });
  }

  const titleLines = wrapText(title, 20, 2);
  const lineHeight = 78;
  const subtitle = [year, format].filter(Boolean).join("   ·   ");

  // Anchored from the bottom up — however many title lines there are, the
  // subtitle/watermark row always lands in the same place.
  const subtitleY = HEIGHT - 110;
  const titleLastLineY = subtitleY - 96;
  const titleFirstLineY = titleLastLineY - (titleLines.length - 1) * lineHeight;
  const captionY = titleFirstLineY - 92;

  const titleTspans = titleLines
    .map((line, i) => `<tspan x="${MARGIN_X}" y="${titleFirstLineY + i * lineHeight}">${escapeXml(line)}</tspan>`)
    .join("");

  const overlaySvg = `
    <svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0.92"/>
        </linearGradient>
      </defs>
      <rect x="0" y="${HEIGHT - GRADIENT_HEIGHT}" width="${WIDTH}" height="${GRADIENT_HEIGHT}" fill="url(#fade)"/>
      <text x="${MARGIN_X}" y="${captionY}" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="700" letter-spacing="1" fill="#0095D5">JUST ADDED TO MY COLLECTION</text>
      <text font-family="Arial, Helvetica, sans-serif" font-size="66" font-weight="700" fill="#ffffff">${titleTspans}</text>
      ${subtitle ? `<text x="${MARGIN_X}" y="${subtitleY}" font-family="Arial, Helvetica, sans-serif" font-size="38" fill="#d4d4d4">${escapeXml(subtitle)}</text>` : ""}
      <text x="${WIDTH - MARGIN_X}" y="${subtitleY}" text-anchor="end" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" letter-spacing="1" fill="#0095D5">HARDCOPY</text>
    </svg>
  `;

  const composed = base.composite([{ input: Buffer.from(overlaySvg) }]);
  // JPEG rather than PNG by default — this is a photographic poster
  // underneath, where PNG's lossless compression produces a multi-megabyte
  // file for barely any visible quality gain over a high-quality JPEG.
  const output = wantsPng
    ? await composed.png().toBuffer()
    : await composed.jpeg({ quality: 90 }).toBuffer();

  return new Response(new Uint8Array(output), {
    headers: {
      "Content-Type": wantsPng ? "image/png" : "image/jpeg",
      "Cache-Control": "no-store",
    },
  });
}
