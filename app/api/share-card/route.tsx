import { ImageResponse } from "next/og";
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
const CARD_MARGIN = 28;
const CARD_GAP = 24;
const CARD_RADIUS = 56;
const BORDER_WIDTH = 8;
// Two independent rounded-rectangle cards, stacked with a gap between them
// — the poster card is sized tall enough for a full poster to fit via
// objectFit "contain" without cropping any of it, and the banner is its
// own separate card underneath rather than sharing the poster's box.
const POSTER_CARD_HEIGHT = 1300;
const BANNER_CARD_HEIGHT = 620;
const HEIGHT = CARD_MARGIN * 2 + POSTER_CARD_HEIGHT + CARD_GAP + BANNER_CARD_HEIGHT;

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
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          display: "flex",
          flexDirection: "column",
          fontFamily: "Inter",
          padding: CARD_MARGIN,
        }}
      >
        {/* Card 1: the poster, whole — "contain" rather than "cover" so
            nothing is ever cropped off it regardless of its exact aspect
            ratio, with the card's own dark background filling any thin
            letterbox margin that results. */}
        <div
          style={{
            display: "flex",
            width: "100%",
            height: POSTER_CARD_HEIGHT,
            alignItems: "center",
            justifyContent: "center",
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
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          )}
        </div>

        <div style={{ display: "flex", width: "100%", height: CARD_GAP }} />

        {/* Card 2: a completely separate rounded-rectangle banner, not
            sharing the poster's box — its whole job is to brag. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: BANNER_CARD_HEIGHT,
            justifyContent: "center",
            borderRadius: CARD_RADIUS,
            border: `${BORDER_WIDTH}px solid #0095D5`,
            overflow: "hidden",
            background: "#0095D5",
            padding: "40px 56px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              background: "#101820",
              color: "#ffffff",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 1.5,
              padding: "12px 24px",
              borderRadius: 999,
            }}
          >
            NEW ADDITION
          </div>
          <div
            style={{
              display: "flex",
              color: "#ffffff",
              fontSize: 58,
              fontWeight: 700,
              letterSpacing: 0.5,
              marginTop: 26,
              lineHeight: 1.1,
            }}
          >
            Look what I just got
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              color: "#0b1520",
              fontSize: 66,
              fontWeight: 700,
              marginTop: 16,
              lineHeight: 1.12,
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
              alignItems: "center",
              marginTop: 26,
            }}
          >
            <div style={{ display: "flex", color: "rgba(11,21,32,0.85)", fontSize: 32, fontWeight: 700 }}>
              {subtitle}
            </div>
            <div
              style={{
                display: "flex",
                background: "rgba(16,24,32,0.4)",
                borderRadius: 16,
                padding: "10px 16px",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoDataUrl} alt="" width={130} height={46} style={{ objectFit: "contain" }} />
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

  // Satori's raw PNG output is served as-is — an extra sharp re-compression
  // pass here was previously trading a few hundred KB of file size for
  // several extra seconds of CPU time on every request, which is the wrong
  // trade for something the user is actively waiting on.
  const png = Buffer.from(await rendered.arrayBuffer());

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      // The query params fully determine the output, so the exact same URL
      // always produces the exact same bytes — safe to cache aggressively.
      // This also means the modal's <img> preview and the later "Share with
      // friends" fetch (same URL) hit the browser cache instead of
      // regenerating the image from scratch a second time.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
