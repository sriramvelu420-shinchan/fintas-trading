"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import styles from "./trading.module.css";

export default function TradingContent() {
  const params = useSearchParams();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [symbol, setSymbol] = useState(params.get("symbol") || "RELIANCE");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [qty, setQty] = useState(1);
  const [type, setType] = useState<"market" | "limit">("market");
  const [limitPrice, setLimitPrice] = useState("");
  const [portfolio, setPortfolio] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const quote = quotes.find((q) => q.symbol === symbol);
  const price = quote?.price || 0;
  const estTotal = qty * (type === "limit" && limitPrice ? Number(limitPrice) : price);

  async function load() {
    const [qres, pres, ores] = await Promise.all([fetch("/api/quotes").then((r) => r.json()), fetch("/api/portfolio").then((r) => r.json()), fetch("/api/orders").then((r) => r.json())]);
    setQuotes(qres.quotes || []);
    if (!pres.error) setPortfolio(pres);
    setOrders(ores.orders || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function placeOrder() {
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/trading/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, side, qty, type, limitPrice: type === "limit" ? limitPrice : null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Order failed");
      setMsg("Order placed successfully (simulated).");
      await load();
    } catch (e: any) {
      setMsg(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.grid}>
      <Card>
        <CardHeader>
          <CardTitle>Place Order</CardTitle>
          <CardDescription>Market or limit (simulated)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={styles.form}>
            <Select label="Symbol" value={symbol} onChange={(e) => setSymbol(e.target.value)}>
              {quotes.map((q) => (
                <option key={q.symbol} value={q.symbol}>
                  {q.symbol} - {q.name}
                </option>
              ))}
            </Select>
            <div className={styles.row}>
              <Button variant={side === "buy" ? "primary" : "outline"} onClick={() => setSide("buy")} fullWidth>
                Buy
              </Button>
              <Button variant={side === "sell" ? "danger" : "outline"} onClick={() => setSide("sell")} fullWidth>
                Sell
              </Button>
            </div>
            <div className={styles.row}>
              <Select label="Order Type" value={type} onChange={(e) => setType(e.target.value as any)}>
                <option value="market">Market</option>
                <option value="limit">Limit</option>
              </Select>
              <Input label="Quantity" type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} />
            </div>
            {type === "limit" ? <Input label="Limit Price (₹)" type="number" step="0.01" value={limitPrice} onChange={(e) => setLimitPrice(e.target.value)} /> : null}
            <Card className={styles.previewCard}>
              <CardContent>
                <div className={styles.previewRow}>
                  <span>Last Price</span>
                  <span>₹{price.toFixed(2)}</span>
                </div>
                <div className={styles.previewRow}>
                  <span>Estimated {type === "limit" && limitPrice ? "Limit" : "Market"} Total</span>
                  <span>{formatCurrency(estTotal)}</span>
                </div>
                <div className={styles.previewRow}>
                  <span>Virtual Cash</span>
                  <span>{formatCurrency(portfolio?.cash || 0)}</span>
                </div>
                {side === "sell" ? (
                  <div className={styles.previewRow}>
                    <span>Holdings ({symbol})</span>
                    <span>{portfolio?.holdings?.find((h: any) => h.symbol === symbol)?.qty || 0} qty</span>
                  </div>
                ) : null}
              </CardContent>
            </Card>
            {msg ? <div className={styles.msg}>{msg}</div> : null}
            <Button onClick={placeOrder} disabled={loading} fullWidth>
              {loading ? "Placing..." : side === "buy" ? "Place Buy Order (Simulated)" : "Place Sell Order (Simulated)"}
            </Button>
            <div className={styles.disclaimer}>All trades use virtual cash only. No real money involved.</div>
          </div>
        </CardContent>
      </Card>

      <div className={styles.sideCol}>
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Virtual wallet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.accountRow}>
              <span>Cash</span>
              <span>{formatCurrency(portfolio?.cash || 0)}</span>
            </div>
            <div className={styles.accountRow}>
              <span>Invested</span>
              <span>{formatCurrency(portfolio?.invested || 0)}</span>
            </div>
            <div className={styles.accountRow}>
              <span>Total Value</span>
              <span>{formatCurrency(portfolio?.totalValue || 0)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>History</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className={styles.empty}>No orders yet</div>
            ) : (
              <div className={styles.orderList}>
                {orders.slice(0, 10).map((o) => (
                  <div key={o.id} className={styles.orderRow}>
                    <div>
                      <div className={styles.orderSym}>
                        {o.symbol} <span className={o.side === "buy" ? "text-green" : "text-red"}>{o.side.toUpperCase()}</span>
                      </div>
                      <div className={styles.orderMeta}>
                        {o.qty} qty • {o.status}
                      </div>
                    </div>
                    <div className={styles.orderRight}>{o.total ? formatCurrency(o.total) : "-"}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
