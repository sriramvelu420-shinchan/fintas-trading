import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { getAiInsights } from "@/lib/ai";
import { getAccount, getDb, getHoldings, getNotifications, getOrders, getQuotes, getTransactions } from "@/lib/store";
import { computeMoneySummary, computePortfolio } from "@/lib/finance";
import { formatCurrency, formatPercent, classForChange } from "@/lib/utils";
import styles from "./dashboard.module.css";
import Link from "next/link";


export default async function DashboardPage() {
  const session = await getSession();
  const userId = session?.id;
  const db = getDb();
  const quotes = getQuotes();
  const indices = quotes.filter((q) => q.isIndex);
  const stocks = quotes.filter((q) => !q.isIndex).slice(0, 6);

  let portfolio = null as any;
  let money = null as any;
  let orders: any[] = [];
  let notifs: any[] = [];
  if (userId) {
    const holdings = getHoldings(userId);
    const account = getAccount(userId);
    portfolio = computePortfolio(holdings, quotes, account?.cash || 0, account?.startingCash || 1000000);
    const txns = getTransactions(userId);
    const budgets = db.budgets.filter((b) => b.userId === userId && b.month === new Date().toISOString().slice(0, 7));
    const goals = db.goals.filter((g) => g.userId === userId);
    money = computeMoneySummary(txns, budgets, goals);
    orders = db.orders.filter((o) => o.userId === userId).slice(0, 5);
    notifs = getNotifications(userId).slice(0, 4);
  }

  return (
    <AppShell>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>
            {session ? `Welcome back, ${session.name}` : "Demo overview • Login to see your personalized data"}
          </p>
        </div>
        <div className={styles.badges}>
          <span className="badge">Paper Trading</span>
          <span className="badge">Virtual Balances Only</span>
          <span className="badge">Simulated Prices</span>
        </div>
      </div>

      <section className={styles.kpiGrid}>
        <Card>
          <CardHeader>
            <CardTitle>Total Portfolio Value</CardTitle>
            <CardDescription>Cash + Holdings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.kpiValue}>{formatCurrency(portfolio?.totalValue || 1000000)}</div>
            <div className={classForChange(portfolio?.totalPnl || 0)}>
              {portfolio?.totalPnl >= 0 ? "+" : ""}
              {formatCurrency(portfolio?.totalPnl || 0)} ({formatPercent(portfolio?.totalPnlPercent || 0)})
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Virtual Cash Balance</CardTitle>
            <CardDescription>Available for trading</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.kpiValue}>{formatCurrency(portfolio?.cash || 1000000)}</div>
            <div className={styles.kpiSub}>Starting: {formatCurrency(portfolio?.startingCash || 1000000)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Day P&amp;L</CardTitle>
            <CardDescription>Unrealized intraday</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={classForChange(portfolio?.dayPnl || 0) + " " + styles.kpiValue}>
              {portfolio?.dayPnl >= 0 ? "+" : ""}
              {formatCurrency(portfolio?.dayPnl || 0)}
            </div>
            <div className={styles.kpiSub}>{formatPercent(portfolio?.dayPnlPercent || 0)} vs previous close</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Money Summary (Month)</CardTitle>
            <CardDescription>Income vs Expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.kpiValue}>{formatCurrency(money?.net || 60000)}</div>
            <div className={styles.kpiRow}>
              <span className="text-green">+{formatCurrency(money?.income || 85000)}</span>
              <span className="text-red">-{formatCurrency(money?.expenses || 25000)}</span>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className={styles.gridTwo}>
        <Card>
          <CardHeader>
            <CardTitle>Market Indices</CardTitle>
            <CardDescription>Simulated benchmarks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.indexGrid}>
              {indices.map((idx) => {
                const chg = idx.price - idx.prevClose;
                const chgPct = (chg / idx.prevClose) * 100;
                return (
                  <Link href={`/market/${idx.symbol}`} key={idx.symbol} className={styles.indexCard}>
                    <div>
                      <div className={styles.indexName}>{idx.name}</div>
                      <div className={styles.indexSymbol}>{idx.symbol}</div>
                    </div>
                    <div className={styles.indexRight}>
                      <div className={styles.indexPrice}>{idx.price.toLocaleString("en-IN")}</div>
                      <div className={classForChange(chg)}>
                        {chg >= 0 ? "+" : ""}
                        {chg.toFixed(2)} ({chgPct.toFixed(2)}%)
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Movers</CardTitle>
            <CardDescription>From your watchlist / market</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.moverList}>
              {stocks.map((s) => {
                const chg = s.price - s.prevClose;
                const chgPct = (chg / s.prevClose) * 100;
                return (
                  <Link href={`/market/${s.symbol}`} key={s.symbol} className={styles.moverRow}>
                    <div>
                      <div className={styles.moverSymbol}>{s.symbol}</div>
                      <div className={styles.moverName}>{s.name}</div>
                    </div>
                    <div className={styles.moverRight}>
                      <div>₹{s.price.toFixed(2)}</div>
                      <div className={classForChange(chg)}>
                        {chg >= 0 ? "+" : ""}
                        {chgPct.toFixed(2)}%
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      {session ? (
        <Card>
          <CardHeader>
            <CardTitle>AI Mode Insights</CardTitle>
            <CardDescription>
              Quick signals from your demo data ·{" "}
              <Link href="/ai" className="text-primary">
                Open AI Mode →
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.aiStrip}>
              {getAiInsights(session.id, session.name)
                .slice(0, 3)
                .map((insight) => (
                  <div key={insight.id} className={styles.aiInsight}>
                    <div className={styles.aiInsightTitle}>{insight.title}</div>
                    <div className={styles.aiInsightBody}>{insight.body}</div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <section className={styles.gridThree}>
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Trading activity</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className={styles.empty}>No orders yet. Go to Trading to place your first order.</div>
            ) : (
              <div className={styles.table}>
                <div className={styles.tableHead}>
                  <span>Symbol</span>
                  <span>Side</span>
                  <span>Qty</span>
                  <span>Status</span>
                  <span>Total</span>
                </div>
                {orders.map((o) => (
                  <div className={styles.tableRow} key={o.id}>
                    <span>{o.symbol}</span>
                    <span className={o.side === "buy" ? "text-green" : "text-red"}>{o.side.toUpperCase()}</span>
                    <span>{o.qty}</span>
                    <span>{o.status}</span>
                    <span>{o.total ? formatCurrency(o.total) : "-"}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Money Activity</CardTitle>
            <CardDescription>Latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {(money?.categories?.length || 0) === 0 && (getTransactions(userId || "").length === 0) ? (
              <div className={styles.empty}>Add income/expenses in Money Management.</div>
            ) : (
              <div className={styles.txnList}>
                {getTransactions(userId || "")
                  .slice(0, 5)
                  .map((t) => (
                    <div key={t.id} className={styles.txnRow}>
                      <div>
                        <div className={styles.txnCat}>{t.category}</div>
                        <div className={styles.txnDesc}>{t.description}</div>
                      </div>
                      <div className={t.kind === "income" ? "text-green" : "text-red"}>
                        {t.kind === "income" ? "+" : "-"}
                        {formatCurrency(t.amount)}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Recent alerts</CardDescription>
          </CardHeader>
          <CardContent>
            {notifs.length === 0 ? (
              <div className={styles.empty}>No notifications yet.</div>
            ) : (
              <div className={styles.notifList}>
                {notifs.map((n: any) => (
                  <div key={n.id} className={styles.notifRow}>
                    <div>
                      <div className={styles.notifTitle}>{n.title}</div>
                      <div className={styles.notifMsg}>{n.message}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
