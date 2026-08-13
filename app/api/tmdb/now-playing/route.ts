import { NextResponse } from "next/server";
import { getNowPlaying } from "@/lib/tmdb/server";

export async function GET() {
  try {
    const data = await getNowPlaying();
    return NextResponse.json(data);
  } catch (err) {
    console.error("TMDb now-playing failed", err);
    return NextResponse.json({ error: "TMDb now-playing failed" }, { status: 502 });
  }
}
