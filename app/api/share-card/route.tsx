import { ImageResponse } from "next/og";
import sharp from "sharp";
import type { NextRequest } from "next/server";
import { INTER_REGULAR_BASE64, INTER_BOLD_BASE64, LOGO_MARK_BASE64 } from "./embedded-assets";

// Rendered with next/og (Satori) rather than sharp+raw SVG text, which
// depended on a system font being installed to rasterize <text> — the
// deployed serverless environment doesn't have one, so every letter came
// out as a missing-glyph box. Satori requires fonts to be supplied
// explicitly instead of assuming one exists, which is exactly what makes
// this reliable regardless of what's installed where it runs.
//
// The font/logo bytes are embedded as base64 constants (see
// embedded-assets.ts) rather than read from disk with fs.readFile at
// request time — that worked locally but 500'd in production. Vercel's
// build only bundles files it can statically prove a deployed function
// reads, by tracing fs calls back to literal path strings; ours went
// through a small helper function that took the path as a parameter, and
// that one level of indirection was apparently enough to lose the trace,
// so the files never made it into the deployed bundle. Baking the bytes
// directly into the module removes the file read — and the guesswork
// about whether some bundler's static analysis will find it — entirely.

const WIDTH = 1080;
const HEIGHT = 1620;
const CARD_MARGIN = 28;
const CARD_RADIUS = 56;
const BORDER_WIDTH = 8;

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

const fontRegular = Buffer.from(INTER_REGULAR_BASE64, "base64");
const fontBold = Buffer.from(INTER_BOLD_BASE64, "base64");
const logoDataUrl = `data:image/png;base64,${LOGO_MARK_BASE64}`;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "Untitled";
  const year = searchParams.get("year");
  const format = searchParams.get("format");
  const posterPath = searchParams.get("poster");

  let posterDataUrl: string | null = null;
  if (posterPath) {
    try {
      const posterRes = await fetch(`https://image.tmdb.org/t/p/w780${posterPath}`);
      if (!posterRes.ok) throw new Error(`poster fetch failed: ${posterRes.status}`);
      const buf = await posterRes.arrayBuffer();
      posterDataUrl = `data:image/jpeg;base64,${Buffer.from(buf).toString("base64")}`;
    } catch (err) {
      console.error("share-card poster fetch failed", err);
    }
  }

  const titleLines = wrapText(title, 20, 2);
  const subtitle = [year, format].filter(Boolean).join("   ·   ");

  const rendered = new ImageResponse(
    (
      <div style={{ width: WIDTH, height: HEIGHT, display: "flex", fontFamily: "Inter" }}>
        <div
          style={{
            position: "absolute",
            top: CARD_MARGIN,
            left: CARD_MARGIN,
            right: CARD_MARGIN,
            bottom: CARD_MARGIN,
            display: "flex",
            borderRadius: CARD_RADIUS,
            border: `${BORDER_WIDTH}px solid #0095D5`,
            overflow: "hidden",
            background: "#1e1e1e",
          }}
        >
          {posterDataUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={posterDataUrl}
              alt=""
              width={WIDTH}
              height={HEIGHT}
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 660,
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: "0 56px 56px",
              backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.94))",
            }}
          >
            <div style={{ display: "flex", color: "#0095D5", fontSize: 36, fontWeight: 700, letterSpacing: 1 }}>
              JUST ADDED TO MY COLLECTION
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                color: "#ffffff",
                fontSize: 62,
                fontWeight: 700,
                marginTop: 18,
                lineHeight: 1.15,
              }}
            >
              {titleLines.map((line, i) => (
                <div key={i} style={{ display: "flex" }}>
                  {line}
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                marginTop: 28,
              }}
            >
              <div style={{ display: "flex", color: "#d4d4d4", fontSize: 34 }}>{subtitle}</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoDataUrl} alt="" width={148} height={52} style={{ objectFit: "contain" }} />
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: "Inter", data: fontRegular, weight: 400, style: "normal" },
        { name: "Inter", data: fontBold, weight: 700, style: "normal" },
      ],
    }
  );

  // Satori's own PNG encoder isn't especially size-optimized — re-compress
  // through sharp (keeping the alpha channel, so the transparent rounded
  // corners survive) before this gets copied to someone's clipboard.
  const rawPng = Buffer.from(await rendered.arrayBuffer());
  const optimizedPng = await sharp(rawPng).png({ compressionLevel: 9, effort: 10 }).toBuffer();

  return new Response(new Uint8Array(optimizedPng), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
    },
  });
}
