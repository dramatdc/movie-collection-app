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
const HEIGHT = 1620;
const CARD_MARGIN = 28;
const CARD_RADIUS = 56;
const BORDER_WIDTH = 8;
// The poster gets the top of the card at full quality with nothing overlaid
// on it; everything else lives in a solid banner below it instead of a
// gradient blended into the image — a clean hand-off reads more like an
// actual banner and lets the poster itself stay the star.
const POSTER_HEIGHT = 1000;

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
            flexDirection: "column",
            borderRadius: CARD_RADIUS,
            border: `${BORDER_WIDTH}px solid #0095D5`,
            overflow: "hidden",
            background: "#1e1e1e",
          }}
        >
          <div style={{ position: "relative", width: "100%", height: POSTER_HEIGHT, display: "flex" }}>
            {posterDataUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={posterDataUrl}
                alt=""
                width={WIDTH}
                height={POSTER_HEIGHT}
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </div>

          {/* The banner: a solid, unmistakable block instead of a gradient
              blended into the poster — the whole point is to actually look
              like a brag banner, not a caption. */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: "36px 56px",
              background: "#0095D5",
            }}
          >
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                background: "#101820",
                color: "#ffffff",
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: 1.5,
                padding: "10px 22px",
                borderRadius: 999,
              }}
            >
              NEW ADDITION
            </div>
            <div
              style={{
                display: "flex",
                color: "#0b1520",
                fontSize: 40,
                fontWeight: 700,
                letterSpacing: 0.5,
                marginTop: 22,
              }}
            >
              Look what I just got
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                color: "#ffffff",
                fontSize: 64,
                fontWeight: 700,
                marginTop: 10,
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
                alignItems: "center",
                marginTop: 30,
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
