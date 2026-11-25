import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { getAlerts } from "@/lib/store";
import styles from "../money/money.module.css";


export default async function AlertsPage() {
  const session = await getSession();
  const userId = session?.id;
  const alerts = userId ? getAlerts(userId) : [];

  return (
    <AppShell>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Price Alerts</h1>
          <p className={styles.subtitle}>Get notified when price crosses your target</p>
        </div>
        <span className="badge">Notifications enabled</span>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
          <CardDescription>Simulated alerts</CardDescription>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className={styles.empty}>No alerts set. Add alerts from the stock detail page (coming soon in this version).</div>
          ) : (
            <div className={styles.txnList}>
              {alerts.map((a: any) => (
                <div key={a.id} className={styles.txnRow}>
                  <div>
                    <div className={styles.txnCat}>
                      {a.symbol} • {a.condition === "above" ? "Above" : "Below"} ₹{a.price}
                    </div>
                    <div className={styles.txnDesc}>Status: {a.active ? "Active" : "Triggered"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
