import { NextRequest, NextResponse } from "next/server";
import { lookupUpc } from "@/lib/upc/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  try {
    const result = await lookupUpc(code);
    return NextResponse.json(result);
  } catch (err) {
    console.error("UPC lookup failed", err);
    return NextResponse.json({ status: "not_found", upc: code });
  }
}
