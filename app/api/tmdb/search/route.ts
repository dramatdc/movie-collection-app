import { NextRequest, NextResponse } from "next/server";
import { searchMovies } from "@/lib/tmdb/server";

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("query");
  if (!query || !query.trim()) {
    return NextResponse.json({ results: [] });
  }

  try {
    const data = await searchMovies(query.trim());
    return NextResponse.json(data);
  } catch (err) {
    console.error("TMDb search failed", err);
    return NextResponse.json(
      { error: "TMDb search failed" },
      { status: 502 }
    );
  }
}
