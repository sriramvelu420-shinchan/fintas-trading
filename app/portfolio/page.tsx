import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { getAccount, getHoldings, getQuotes } from "@/lib/store";
import { computePortfolio } from "@/lib/finance";
import { classForChange, formatCurrency, formatPercent } from "@/lib/utils";
import styles from "./portfolio.module.css";


export default async function PortfolioPage() {
  const session = await getSession();
  const userId = session?.id;
  let snapshot: any = null;
  if (userId) {
    const holdings = getHoldings(userId);
    const quotes = getQuotes();
    const account = getAccount(userId);
    snapshot = computePortfolio(holdings, quotes, account?.cash || 0, account?.startingCash || 1000000);
  }

  return (
    <AppShell>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Portfolio</h1>
          <p className={styles.subtitle}>Holdings, allocation and performance</p>
        </div>
        <span className="badge">Virtual Holdings</span>
      </div>

      <div className={styles.kpiGrid}>
        <Card>
          <CardHeader>
            <CardTitle>Total Value</CardTitle>
            <CardDescription>Cash + Holdings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.kpiValue}>{formatCurrency(snapshot?.totalValue || 1000000)}</div>
            <div className={classForChange(snapshot?.totalPnl || 0)}>
              {snapshot?.totalPnl >= 0 ? "+" : ""}
              {formatCurrency(snapshot?.totalPnl || 0)} ({formatPercent(snapshot?.totalPnlPercent || 0)})
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Invested</CardTitle>
            <CardDescription>Cost basis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.kpiValue}>{formatCurrency(snapshot?.invested || 0)}</div>
            <div className={styles.kpiSub}>Current: {formatCurrency(snapshot?.value || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Day P&amp;L</CardTitle>
            <CardDescription>Intraday change</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={classForChange(snapshot?.dayPnl || 0) + " " + styles.kpiValue}>
              {snapshot?.dayPnl >= 0 ? "+" : ""}
              {formatCurrency(snapshot?.dayPnl || 0)}
            </div>
            <div className={styles.kpiSub}>{formatPercent(snapshot?.dayPnlPercent || 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
          <CardDescription>Detailed breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          {!snapshot || snapshot.holdings.length === 0 ? (
            <div className={styles.empty}>No holdings yet. Place a buy order from Trading.</div>
          ) : (
            <div className={styles.table}>
              <div className={styles.tableHead}>
                <span>Symbol</span>
                <span>Name</span>
                <span>Qty</span>
                <span>Avg Price</span>
                <span>LTP</span>
                <span>Invested</span>
                <span>Current Value</span>
                <span>P&amp;L</span>
                <span>Day P&amp;L</span>
                <span>Alloc</span>
              </div>
              {snapshot.holdings.map((h: any) => (
                <div className={styles.tableRow} key={h.id}>
                  <span className={styles.sym}>{h.symbol}</span>
                  <span>{h.name}</span>
                  <span>{h.qty}</span>
                  <span>₹{h.avgPrice.toFixed(2)}</span>
                  <span>₹{h.price.toFixed(2)}</span>
                  <span>{formatCurrency(h.invested)}</span>
                  <span>{formatCurrency(h.value)}</span>
                  <span className={classForChange(h.pnl)}>
                    {h.pnl >= 0 ? "+" : ""}
                    {formatCurrency(h.pnl)} ({formatPercent(h.pnlPercent)})
                  </span>
                  <span className={classForChange(h.dayPnl)}>
                    {h.dayPnl >= 0 ? "+" : ""}
                    {formatCurrency(h.dayPnl)}
                  </span>
                  <span>{h.allocation.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
