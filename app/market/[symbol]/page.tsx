import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getQuote, getQuotes } from "@/lib/store";
import { generateChartSeries } from "@/lib/finance";
import { classForChange } from "@/lib/utils";
import Link from "next/link";
import styles from "../market.module.css";
import chartStyles from "./chart.module.css";

export default async function StockDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  const sym = symbol.toUpperCase();
  const quote = getQuote(sym);
  if (!quote) {
    return (
      <AppShell>
        <Card>
          <CardHeader>
            <CardTitle>Symbol not found</CardTitle>
            <CardDescription>Simulated data only</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/market">
              <Button variant="outline">Back to Market</Button>
            </Link>
          </CardContent>
        </Card>
      </AppShell>
    );
  }
  const chg = quote.price - quote.prevClose;
  const chgPct = (chg / quote.prevClose) * 100;
  const series = generateChartSeries(sym, "1D");

  return (
    <AppShell>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            {quote.name} <span className={styles.muted}>({quote.symbol})</span>
          </h1>
          <p className={styles.subtitle}>
            {quote.sector} • Simulated Market Data
          </p>
        </div>
        <div className={styles.badges}>
          <Link href={`/trading?symbol=${quote.symbol}`}>
            <Button>Trade {quote.symbol}</Button>
          </Link>
          <Link href="/watchlist">
            <Button variant="outline">Manage Watchlist</Button>
          </Link>
        </div>
      </div>

      <section className={styles.gridTwo}>
        <Card>
          <CardHeader>
            <CardTitle>Price Overview</CardTitle>
            <CardDescription>Current quote</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.priceRow}>
              <div className={styles.bigPrice}>₹{quote.price.toFixed(2)}</div>
              <div className={classForChange(chg) + " " + styles.bigChange}>
                {chg >= 0 ? "+" : ""}
                {chg.toFixed(2)} ({chgPct.toFixed(2)}%)
              </div>
            </div>
            <div className={styles.metaGrid}>
              <div>
                <div className={styles.metaLabel}>Open</div>
                <div>₹{quote.open.toFixed(2)}</div>
              </div>
              <div>
                <div className={styles.metaLabel}>High</div>
                <div>₹{quote.high.toFixed(2)}</div>
              </div>
              <div>
                <div className={styles.metaLabel}>Low</div>
                <div>₹{quote.low.toFixed(2)}</div>
              </div>
              <div>
                <div className={styles.metaLabel}>Prev Close</div>
                <div>₹{quote.prevClose.toFixed(2)}</div>
              </div>
              <div>
                <div className={styles.metaLabel}>Volume</div>
                <div>{quote.volume.toLocaleString("en-IN")}</div>
              </div>
              <div>
                <div className={styles.metaLabel}>Market Cap</div>
                <div>{quote.marketCap ? (quote.marketCap / 1000000000000).toFixed(2) + "T" : "-"}</div>
              </div>
            </div>
            <div className={styles.simNote}>⚠️ This is simulated market data. Not sourced from live exchanges.</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Price Chart (Simulated)</CardTitle>
            <CardDescription>Intraday style trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={chartStyles.chart}>
              {series.map((p, idx) => {
                const max = Math.max(...series.map((x) => x.value));
                const min = Math.min(...series.map((x) => x.value));
                const range = max - min || 1;
                const h = ((p.value - min) / range) * 100;
                return <div key={idx} className={chartStyles.bar} style={{ height: `${Math.max(10, h)}%` }} title={`${p.value}`} />;
              })}
            </div>
            <div className={chartStyles.chartLabels}>
              <span>Start</span>
              <span>End</span>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>Company info</CardDescription>
        </CardHeader>
        <CardContent>
          <p className={styles.aboutText}>{quote.description}</p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
