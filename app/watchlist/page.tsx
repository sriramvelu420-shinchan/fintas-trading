import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { getQuotes, getWatchlists } from "@/lib/store";
import { classForChange } from "@/lib/utils";
import Link from "next/link";
import styles from "../market/market.module.css";


export default async function WatchlistPage() {
  const session = await getSession();
  const userId = session?.id;
  const watchlists = userId ? getWatchlists(userId) : [];
  const quotes = getQuotes();
  const quoteMap = new Map(quotes.map((q) => [q.symbol, q]));

  return (
    <AppShell>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Watchlist</h1>
          <p className={styles.subtitle}>Track your favorite stocks</p>
        </div>
        <span className="badge">Create &amp; manage lists</span>
      </div>

      {watchlists.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No watchlists</CardTitle>
            <CardDescription>Default list is created on signup</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        watchlists.map((wl) => (
          <Card key={wl.id}>
            <CardHeader>
              <CardTitle>{wl.name}</CardTitle>
              <CardDescription>{wl.symbols.length} symbols</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.table}>
                <div className={styles.tableHead}>
                  <span>Symbol</span>
                  <span>Name</span>
                  <span>Price</span>
                  <span>Change</span>
                  <span>Action</span>
                </div>
                {wl.symbols.map((sym) => {
                  const q = quoteMap.get(sym);
                  if (!q) return null;
                  const chg = q.price - q.prevClose;
                  const chgPct = (chg / q.prevClose) * 100;
                  return (
                    <div className={styles.tableRow} key={sym}>
                      <span className={styles.sym}>{q.symbol}</span>
                      <span>{q.name}</span>
                      <span>₹{q.price.toFixed(2)}</span>
                      <span className={classForChange(chg)}>
                        {chg >= 0 ? "+" : ""}
                        {chgPct.toFixed(2)}%
                      </span>
                      <Link href={`/market/${q.symbol}`}>View</Link>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </AppShell>
  );
}
