"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { formatCurrency, formatPercent } from "@/lib/utils";
import styles from "./money.module.css";

export default function MoneyPage() {
  const [summary, setSummary] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [kind, setKind] = useState<"income" | "expense">("expense");
  const [category, setCategory] = useState("Groceries");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [msg, setMsg] = useState("");

  async function load() {
    const [sres, tres] = await Promise.all([fetch("/api/money/summary").then((r) => r.json()), fetch("/api/money/transactions").then((r) => r.json())]);
    if (!sres.error) setSummary(sres);
    setTransactions(tres.transactions || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function addTxn() {
    setMsg("");
    const res = await fetch("/api/money/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, category, description, amount: Number(amount), date: new Date(date).toISOString() }),
    });
    const data = await res.json();
    if (!res.ok) setMsg(data.error || "Failed");
    else {
      setMsg("Transaction added.");
      setAmount("");
      setDescription("");
      await load();
    }
  }

  return (
    <AppShell>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Money Management</h1>
          <p className={styles.subtitle}>Track income, expenses, budgets &amp; savings goals</p>
        </div>
        <span className="badge">Personal Finances • Virtual Context</span>
      </div>

      <div className={styles.kpiGrid}>
        <Card>
          <CardHeader>
            <CardTitle>Income (Month)</CardTitle>
            <CardDescription>Total earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.kpiValue + " text-green"}>+{formatCurrency(summary?.income || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expenses (Month)</CardTitle>
            <CardDescription>Total spending</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.kpiValue + " text-red"}>-{formatCurrency(summary?.expenses || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Net (Month)</CardTitle>
            <CardDescription>Savings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.kpiValue}>{formatCurrency(summary?.net || 0)}</div>
            <div className={styles.kpiSub}>Savings Rate: {formatPercent(summary?.savingsRate || 0)}</div>
          </CardContent>
        </Card>
      </div>

      <div className={styles.gridTwo}>
        <Card>
          <CardHeader>
            <CardTitle>Add Transaction</CardTitle>
            <CardDescription>Record income or expense</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={styles.form}>
              <div className={styles.row}>
                <Button variant={kind === "expense" ? "danger" : "outline"} onClick={() => setKind("expense")} fullWidth>
                  Expense
                </Button>
                <Button variant={kind === "income" ? "primary" : "outline"} onClick={() => setKind("income")} fullWidth>
                  Income
                </Button>
              </div>
              <Select label="Category" value={category} onChange={(e) => setCategory(e.target.value)}>
                {kind === "income" ? (
                  <>
                    <option>Salary</option>
                    <option>Freelance</option>
                    <option>Bonus</option>
                    <option>Other</option>
                  </>
                ) : (
                  <>
                    <option>Rent</option>
                    <option>Groceries</option>
                    <option>Utilities</option>
                    <option>Transport</option>
                    <option>Entertainment</option>
                    <option>Food</option>
                    <option>Other</option>
                  </>
                )}
              </Select>
              <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Monthly groceries" />
              <div className={styles.row}>
                <Input label="Amount (₹)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              {msg ? <div className={styles.msg}>{msg}</div> : null}
              <Button onClick={addTxn}>Add Transaction</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest entries</CardDescription>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className={styles.empty}>No transactions yet</div>
            ) : (
              <div className={styles.txnList}>
                {transactions.slice(0, 12).map((t) => (
                  <div key={t.id} className={styles.txnRow}>
                    <div>
                      <div className={styles.txnCat}>{t.category}</div>
                      <div className={styles.txnDesc}>
                        {t.description} • {new Date(t.date).toLocaleDateString("en-IN")}
                      </div>
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
      </div>

      <div className={styles.gridTwo}>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Budgets</CardTitle>
            <CardDescription>Spending vs limits</CardDescription>
          </CardHeader>
          <CardContent>
            {(summary?.budgets || []).length === 0 ? (
              <div className={styles.empty}>No budgets set for this month</div>
            ) : (
              <div className={styles.budgetList}>
                {summary.budgets.map((b: any) => (
                  <div key={b.id} className={styles.budgetRow}>
                    <div className={styles.budgetTop}>
                      <span>{b.category}</span>
                      <span>
                        {formatCurrency(b.spent)} / {formatCurrency(b.limit)}
                      </span>
                    </div>
                    <div className={styles.barBg}>
                      <div className={styles.bar} style={{ width: `${Math.min(100, b.percent)}%` }} />
                    </div>
                    <div className={styles.budgetBot}>
                      <span className={styles.kpiSub}>{b.percent.toFixed(1)}% used</span>
                      <span className={styles.kpiSub}>{formatCurrency(b.remaining)} left</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Savings Goals</CardTitle>
            <CardDescription>Track progress</CardDescription>
          </CardHeader>
          <CardContent>
            {(summary?.goals || []).length === 0 ? (
              <div className={styles.empty}>No goals yet</div>
            ) : (
              <div className={styles.goalList}>
                {summary.goals.map((g: any) => {
                  const pct = g.target > 0 ? (g.current / g.target) * 100 : 0;
                  return (
                    <div key={g.id} className={styles.goalRow}>
                      <div className={styles.budgetTop}>
                        <span>{g.name}</span>
                        <span>
                          {formatCurrency(g.current)} / {formatCurrency(g.target)}
                        </span>
                      </div>
                      <div className={styles.barBg}>
                        <div className={styles.bar} style={{ width: `${Math.min(100, pct)}%`, background: g.color || "var(--primary)" }} />
                      </div>
                      <div className={styles.budgetBot}>
                        <span className={styles.kpiSub}>{pct.toFixed(1)}% complete</span>
                        <span className={styles.kpiSub}>Target: {new Date(g.targetDate).toLocaleDateString("en-IN")}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
