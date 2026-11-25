import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { getAccount, getDb, getHoldings, getQuotes } from "@/lib/store";
import { computePortfolio } from "@/lib/finance";

export async function GET() {
  try {
    const user = await requireUser();
    const holdings = getHoldings(user.id);
    const quotes = getQuotes();
    const account = getAccount(user.id);
    const snapshot = computePortfolio(holdings, quotes, account?.cash || 0, account?.startingCash || 1000000);
    return NextResponse.json(snapshot);
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e.message || "Error" }, { status: 400 });
  }
}
