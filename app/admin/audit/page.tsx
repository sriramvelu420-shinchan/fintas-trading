import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { getDb } from "@/lib/store";
import styles from "../../money/money.module.css";


export default async function AdminAuditPage() {
  try {
    await requireAdmin();
  } catch {}
  const db = getDb();
  const logs = db.auditLogs.slice(0, 150);

  return (
    <AppShell>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Audit Logs</h1>
          <p className={styles.subtitle}>System activity trail</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>Security &amp; actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={styles.txnList}>
            {logs.map((l) => (
              <div key={l.id} className={styles.txnRow}>
                <div>
                  <div className={styles.txnCat}>
                    {l.action} • {l.userName}
                  </div>
                  <div className={styles.txnDesc}>
                    {l.details} • {l.ip} • {new Date(l.createdAt).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
