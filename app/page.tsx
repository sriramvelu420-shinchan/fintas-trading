import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logoDot} />
          <div>
            <div className={styles.brandName}>FinTas Trading</div>
            <div className={styles.brandSub}>Paper Trading • Money Management Platform</div>
          </div>
        </div>
        <nav className={styles.nav}>
          <Link href="/market">Market</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/ai">AI Mode</Link>
          <Link href="/auth/login">Login</Link>
          <Link href="/auth/register">
            <Button size="sm">Get Started</Button>
          </Link>
        </nav>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.kicker}>SIMULATED • NO REAL MONEY</span>
          <h1 className={styles.heroTitle}>
            Master Trading &amp; Money Management
            <span className={styles.heroAccent}>Risk-Free</span>
          </h1>
          <p className={styles.heroText}>
            FinTas Trading combines realistic paper trading with personal finance tools. Practice with ₹10,00,000 virtual cash, build portfolios, track budgets, set savings goals, and learn with simulated market data.
          </p>
          <div className={styles.heroActions}>
            <Link href="/auth/register">
              <Button size="lg">Start Paper Trading</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg">
                View Dashboard
              </Button>
            </Link>
          </div>
          <div className={styles.heroBadges}>
            <span className="badge">Virtual Wallet</span>
            <span className="badge">AI Mode</span>
            <span className="badge">Live-like Charts</span>
            <span className="badge">Budgets &amp; Goals</span>
            <span className="badge">Admin Controls</span>
          </div>
        </div>
        <Card className={styles.heroCard}>
          <CardHeader>
            <CardTitle>Demo Preview</CardTitle>
            <CardDescription>Portfolio snapshot (simulated)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.previewGrid}>
              <div>
                <div className={styles.previewLabel}>Total Value</div>
                <div className={styles.previewValue}>₹10,42,580</div>
                <div className="text-green">+₹42,580 (+4.26%)</div>
              </div>
              <div>
                <div className={styles.previewLabel}>Virtual Cash</div>
                <div className={styles.previewValue}>₹9,18,420</div>
                <div className={styles.previewSub}>Available to trade</div>
              </div>
              <div>
                <div className={styles.previewLabel}>Day P&amp;L</div>
                <div className={styles.previewValue + " text-green"}>+₹8,240</div>
                <div className={styles.previewSub}>Across holdings</div>
              </div>
            </div>
            <div className={styles.previewList}>
              <div className={styles.previewRow}>
                <span>RELIANCE</span>
                <span>12 qty • ₹1,485.60</span>
                <span className="text-green">+2.34%</span>
              </div>
              <div className={styles.previewRow}>
                <span>TCS</span>
                <span>5 qty • ₹3,892.25</span>
                <span className="text-green">+1.12%</span>
              </div>
              <div className={styles.previewRow}>
                <span>HDFCBANK</span>
                <span>8 qty • ₹1,684.45</span>
                <span className="text-red">-0.48%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2>Everything you need to learn trading safely</h2>
          <p>Built for practice, not real brokerage execution. Every action is clearly labeled as simulated.</p>
        </div>
        <div className={styles.featureGrid}>
          <Card>
            <CardHeader>
              <CardTitle>Paper Trading Engine</CardTitle>
              <CardDescription>Buy/sell with virtual money</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className={styles.list}>
                <li>Market &amp; limit orders (simulated)</li>
                <li>Cash &amp; holdings validation</li>
                <li>Order history &amp; execution logs</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Smart Portfolio</CardTitle>
              <CardDescription>Track performance in real-time style</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className={styles.list}>
                <li>Allocation, P&amp;L, day change</li>
                <li>Holdings breakdown</li>
                <li>Clean performance charts</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Money Management</CardTitle>
              <CardDescription>Budget, spend, save</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className={styles.list}>
                <li>Income/expense tracking</li>
                <li>Monthly budgets &amp; alerts</li>
                <li>Savings goals with progress</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className={styles.footer}>
        <div>© {new Date().getFullYear()} FinTas Trading. For educational and practice purposes only.</div>
        <div>Simulated market data • No real money transactions</div>
      </footer>
    </main>
  );
}
