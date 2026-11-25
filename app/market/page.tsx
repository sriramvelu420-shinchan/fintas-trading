import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getQuotes } from "@/lib/store";
import { classForChange } from "@/lib/utils";
import Link from "next/link";
import styles from "./market.module.css";


export default function MarketPage() {
  const quotes = getQuotes();
  const indices = quotes.filter((q) => q.isIndex);
  const stocks = quotes.filter((q) => !q.isIndex);

  return (
    <AppShell>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Stock Market</h1>
          <p className={styles.subtitle}>Simulated market data • Prices update on refresh</p>
        </div>
        <span className="badge">Not Live Market Prices</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Market Indices</CardTitle>
          <CardDescription>NIFTY 50 &amp; SENSEX (Simulated)</CardDescription>
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
          <CardTitle>Equities</CardTitle>
          <CardDescription>Search and trade simulated stocks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={styles.table}>
            <div className={styles.tableHead}>
              <span>Symbol</span>
              <span>Name</span>
              <span>Sector</span>
              <span>Price</span>
              <span>Change</span>
              <span>Volume</span>
            </div>
            {stocks.map((s) => {
              const chg = s.price - s.prevClose;
              const chgPct = (chg / s.prevClose) * 100;
              return (
                <Link href={`/market/${s.symbol}`} key={s.symbol} className={styles.tableRow}>
                  <span className={styles.sym}>{s.symbol}</span>
                  <span>{s.name}</span>
                  <span className={styles.muted}>{s.sector}</span>
                  <span>₹{s.price.toFixed(2)}</span>
                  <span className={classForChange(chg)}>
                    {chg >= 0 ? "+" : ""}
                    {chgPct.toFixed(2)}%
                  </span>
                  <span className={styles.muted}>{s.volume.toLocaleString("en-IN")}</span>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
