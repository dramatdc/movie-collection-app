import { NextRequest, NextResponse } from "next/server";
import { getMovieDetail } from "@/lib/tmdb/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const data = await getMovieDetail(id);
    return NextResponse.json(data);
  } catch (err) {
    console.error("TMDb movie detail failed", err);
    return NextResponse.json(
      { error: "TMDb movie detail failed" },
      { status: 502 }
    );
  }
}
