import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { AI_SUGGESTIONS, getAiInsights } from "@/lib/ai";
import AiClient from "./ai-client";
import styles from "./ai.module.css";

export default async function AiPage() {
  const session = await getSession();

  if (!session) {
    return (
      <AppShell>
        <Card>
          <CardHeader>
            <CardTitle>AI Mode requires an account</CardTitle>
            <CardDescription>Log in to let FinTas AI review your personal demo data.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/auth/login">
              <Button>Log in to continue</Button>
            </Link>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  const insights = getAiInsights(session.id, session.name);
  const connected = Boolean(process.env.OPENAI_API_KEY);

  return (
    <AppShell>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>AI Mode</h1>
          <p className={styles.subtitle}>Ask questions about your paper portfolio, market practice and money habits.</p>
        </div>
        <div className={styles.headerBadges}>
          <span className="badge">{connected ? "AI Connected" : "Demo AI Engine"}</span>
          <span className="badge">Simulated Data</span>
        </div>
      </div>

      <div className={styles.grid}>
        <AiClient
          userName={session.name}
          suggestions={AI_SUGGESTIONS}
          mode={connected ? "connected" : "demo"}
        />

        <div className={styles.side}>
          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
              <CardDescription>Generated from your current demo data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.insights}>
                {insights.length === 0 ? (
                  <div className={styles.empty}>Add activity to unlock personalized insights.</div>
                ) : (
                  insights.map((insight) => (
                    <div key={insight.id} className={`${styles.insight} ${styles[insight.tone]}`}>
                      <div className={styles.insightTitle}>{insight.title}</div>
                      <p className={styles.insightBody}>{insight.body}</p>
                      {insight.action ? (
                        <Link href={insight.action.href} className={styles.insightLink}>
                          {insight.action.label} →
                        </Link>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What AI Mode can do</CardTitle>
              <CardDescription>Educational assistance only</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className={styles.list}>
                <li>Summarize virtual portfolio risk and allocation</li>
                <li>Explain simulated market movements</li>
                <li>Highlight budget and savings trends</li>
                <li>Review paper-trading order behavior</li>
              </ul>
              <div className={styles.disclaimer}>
                FinTas AI does not place trades, move money, or provide real investment advice.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
