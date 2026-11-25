import { Suspense } from "react";
import { AppShell } from "@/components/layout/app-shell";
import TradingContent from "./trading-content";
import styles from "./trading.module.css";


export default function TradingPage() {
  return (
    <AppShell>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Paper Trading</h1>
          <p className={styles.subtitle}>Buy &amp; sell with virtual money • Orders are simulated</p>
        </div>
        <span className="badge">No Real-Money Trades</span>
      </div>
      <Suspense fallback={<div className={styles.empty}>Loading trading interface...</div>}>
        <TradingContent />
      </Suspense>
    </AppShell>
  );
}
