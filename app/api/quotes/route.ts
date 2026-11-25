import { NextRequest, NextResponse } from "next/server";
import { getQuote, getQuotes } from "@/lib/store";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  if (symbol) {
    const q = getQuote(symbol);
    if (!q) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(q);
  }
  return NextResponse.json({ quotes: getQuotes() });
}
