import { NextResponse } from "next/server";
import { getTrendingWeek } from "@/lib/tmdb/server";

export async function GET() {
  try {
    const data = await getTrendingWeek();
    return NextResponse.json(data);
  } catch (err) {
    console.error("TMDb trending failed", err);
    return NextResponse.json({ error: "TMDb trending failed" }, { status: 502 });
  }
}
