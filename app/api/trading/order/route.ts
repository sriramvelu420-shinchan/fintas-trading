import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { addAudit, getAccount, getDb, getQuote, writeDb } from "@/lib/store";
import { generateId } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const symbol = String(body.symbol || "").toUpperCase().trim();
    const side = body.side === "sell" ? "sell" : "buy";
    const qty = Math.max(1, Math.floor(Number(body.qty) || 0));
    const type = body.type === "limit" ? "limit" : "market";
    const limitPrice = body.limitPrice ? Number(body.limitPrice) : null;

    const quote = getQuote(symbol);
    if (!quote) {
      return NextResponse.json({ error: "Invalid symbol" }, { status: 400 });
    }
    const price = quote.price;
    const total = qty * (type === "limit" && limitPrice ? limitPrice : price);

    const db = getDb();
    const account = getAccount(user.id);
    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 400 });
    }

    if (side === "buy") {
      if (account.cash < total) {
        return NextResponse.json({ error: "Insufficient virtual cash" }, { status: 400 });
      }
    } else if (side === "sell") {
      const holding = db.holdings.find((h) => h.userId === user.id && h.symbol === symbol);
      if (!holding || holding.qty < qty) {
        return NextResponse.json({ error: "Insufficient holdings" }, { status: 400 });
      }
    }

    const now = new Date().toISOString();
    const order = {
      id: generateId("ord"),
      userId: user.id,
      symbol,
      side,
      qty,
      type,
      limitPrice,
      status: type === "limit" ? "pending" : "completed",
      price: type === "market" ? price : null,
      total: type === "market" ? total : null,
      createdAt: now,
      executedAt: type === "market" ? now : null,
      cancelledAt: null,
      note: type === "limit" ? "Pending - limit order (simulated)" : "Executed at market (simulated)",
    };

    writeDb((d) => {
      d.orders.push(order as any);
      if (order.status === "completed") {
        const acc = d.accounts.find((a) => a.userId === user.id);
        if (!acc) return;
        if (side === "buy") {
          acc.cash -= total;
          const holding = d.holdings.find((h) => h.userId === user.id && h.symbol === symbol);
          if (holding) {
            const newQty = holding.qty + qty;
            const newAvg = (holding.avgPrice * holding.qty + price * qty) / newQty;
            holding.qty = newQty;
            holding.avgPrice = Number(newAvg.toFixed(2));
            holding.updatedAt = now;
          } else {
            d.holdings.push({
              id: generateId("hold"),
              userId: user.id,
              symbol,
              qty,
              avgPrice: Number(price.toFixed(2)),
              updatedAt: now,
            });
          }
        } else if (side === "sell") {
          acc.cash += total;
          const holding = d.holdings.find((h) => h.userId === user.id && h.symbol === symbol);
          if (holding) {
            const newQty = holding.qty - qty;
            if (newQty <= 0) {
              d.holdings = d.holdings.filter((h) => !(h.userId === user.id && h.symbol === symbol));
            } else {
              holding.qty = newQty;
              holding.updatedAt = now;
            }
          }
        }
        acc.updatedAt = now;
      }
      d.notifications.push({
        id: generateId("notif"),
        userId: user.id,
        title: side === "buy" ? "Buy Order Executed" : "Sell Order Executed",
        message: `${side.toUpperCase()} ${qty} ${symbol} @ ₹${price.toFixed(2)} (Simulated)`,
        kind: "trade",
        read: false,
        createdAt: now,
      });
    });

    addAudit(user.id, user.name, "trade.order", `${side} ${qty} ${symbol} @ ${price}`, req.headers.get("x-forwarded-for") || "127.0.0.1");
    return NextResponse.json({ ok: true, order });
  } catch (e: any) {
    if (e.message === "UNAUTHORIZED") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: e.message || "Error" }, { status: 400 });
  }
}
