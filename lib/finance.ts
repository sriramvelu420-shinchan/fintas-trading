import {
  Budget,
  FinanceTransaction,
  MoneySummary,
  PortfolioHolding,
  PortfolioSnapshot,
  Quote,
  SavingsGoal,
} from "./types";
import { monthKey } from "./utils";

const PALETTE = ["#22d3ee", "#34d399", "#f59e0b", "#f43f5e", "#a78bfa", "#fb7185", "#38bdf8"];

export function computePortfolio(
  holdings: Array<any>,
  quotes: Quote[],
  cash: number,
  startingCash: number
): PortfolioSnapshot {
  const quoteMap = new Map(quotes.map((q) => [q.symbol.toUpperCase(), q]));
  const enriched: PortfolioHolding[] = [];
  let invested = 0;
  let value = 0;
  let dayPnl = 0;

  for (const h of holdings) {
    const q = quoteMap.get(h.symbol.toUpperCase());
    if (!q) continue;
    const price = q.price;
    const prevClose = q.prevClose;
    const cost = h.qty * h.avgPrice;
    const cur = h.qty * price;
    invested += cost;
    value += cur;
    const pnl = cur - cost;
    const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;
    const dpnl = h.qty * (price - prevClose);
    dayPnl += dpnl;
    enriched.push({
      ...h,
      name: q.name,
      sector: q.sector,
      price,
      prevClose,
      value: cur,
      invested: cost,
      pnl,
      pnlPercent,
      dayPnl: dpnl,
      allocation: 0,
    });
  }

  const totalValue = value + cash;
  const totalPnl = value + cash - startingCash;
  const totalPnlPercent = startingCash > 0 ? (totalPnl / startingCash) * 100 : 0;
  const dayPnlPercent = (value + cash - dayPnl) > 0 ? (dayPnl / (value + cash - dayPnl)) * 100 : 0;

  for (let i = 0; i < enriched.length; i++) {
    enriched[i].allocation = totalValue > 0 ? (enriched[i].value / totalValue) * 100 : 0;
  }

  const allocation = enriched
    .map((h, idx) => ({ label: h.symbol, value: h.allocation, color: PALETTE[idx % PALETTE.length] }))
    .filter((x) => x.value > 0.01);

  if (cash > 0 && totalValue > 0) {
    allocation.push({ label: "CASH", value: (cash / totalValue) * 100, color: "#475569" });
  }

  return {
    holdings: enriched,
    cash,
    startingCash,
    invested,
    value,
    totalValue,
    totalPnl,
    totalPnlPercent,
    dayPnl,
    dayPnlPercent,
    allocation,
  };
}

export function computeMoneySummary(
  transactions: FinanceTransaction[],
  budgets: Budget[],
  goals: SavingsGoal[],
  month?: string
): MoneySummary {
  const m = month || monthKey();
  const monthTxns = transactions.filter((t) => {
    const d = new Date(t.date);
    const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    return k === m;
  });
  let income = 0;
  let expenses = 0;
  const catMap = new Map<string, number>();
  for (const t of monthTxns) {
    if (t.kind === "income") income += t.amount;
    else {
      expenses += t.amount;
      catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount);
    }
  }
  const net = income - expenses;
  const savingsRate = income > 0 ? (net / income) * 100 : 0;
  const categories = Array.from(catMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, value], idx) => ({ label, value, color: PALETTE[idx % PALETTE.length] }));

  // last 6 months
  const monthly = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const k = monthKey(d);
    const label = d.toLocaleDateString("en-IN", { month: "short" });
    let mi = 0,
      me = 0;
    for (const t of transactions) {
      const td = new Date(t.date);
      const tk = `${td.getFullYear()}-${String(td.getMonth() + 1).padStart(2, "0")}`;
      if (tk !== k) continue;
      if (t.kind === "income") mi += t.amount;
      else me += t.amount;
    }
    monthly.push({ month: k, label, income: mi, expenses: me });
  }

  const budgetRows = budgets.map((b) => {
    let spent = 0;
    for (const t of monthTxns) {
      if (t.kind === "expense" && t.category === b.category) spent += t.amount;
    }
    const percent = b.limit > 0 ? (spent / b.limit) * 100 : 0;
    const remaining = b.limit - spent;
    return { ...b, spent, percent, remaining };
  });

  return {
    month: m,
    income,
    expenses,
    net,
    savingsRate,
    categories,
    monthly,
    budgets: budgetRows,
    goals,
  };
}

export function generateChartSeries(symbol: string, timeframe: string): Array<{ label: string; value: number }> {
  const base = symbol === "NIFTY50" ? 26245 : symbol === "SENSEX" ? 85792 : symbol === "RELIANCE" ? 1485 : symbol === "TCS" ? 3892 : 1700;
  const points = 30;
  const arr = [];
  let val = base;
  for (let i = 0; i < points; i++) {
    const drift = (Math.random() - 0.48) * (base * 0.015);
    val = val + drift;
    arr.push({ label: String(i + 1), value: Number(val.toFixed(2)) });
  }
  return arr;
}
