import "server-only";

import { computeMoneySummary, computePortfolio } from "./finance";
import {
  getAccount,
  getAlerts,
  getDb,
  getHoldings,
  getOrders,
  getQuotes,
  getTransactions,
  getWatchlists,
} from "./store";
import { formatCurrency, formatPercent, monthKey } from "./utils";

export interface AiInsight {
  id: string;
  tone: "positive" | "warning" | "danger" | "info";
  title: string;
  body: string;
  action?: { label: string; href: string };
}

export interface AiContext {
  userName: string;
  portfolio: {
    totalValue: number;
    cash: number;
    invested: number;
    value: number;
    totalPnl: number;
    totalPnlPercent: number;
    dayPnl: number;
    dayPnlPercent: number;
    topHolding: { symbol: string; allocation: number; pnl: number } | null;
    cashPercent: number;
  };
  money: {
    income: number;
    expenses: number;
    net: number;
    savingsRate: number;
    topCategory: { label: string; value: number } | null;
    overBudget: string[];
    goals: Array<{ name: string; target: number; current: number; percent: number }>;
  };
  trading: {
    totalOrders: number;
    completed: number;
    pending: number;
    cancelled: number;
    buys: number;
    sells: number;
    recentSymbols: string[];
  };
  market: {
    indices: Array<{ symbol: string; name: string; price: number; changePercent: number }>;
    topGainers: Array<{ symbol: string; changePercent: number }>;
    topLosers: Array<{ symbol: string; changePercent: number }>;
  };
  watchlists: Array<{ name: string; symbols: string[] }>;
  alerts: Array<{ symbol: string; condition: string; price: number; active: boolean }>;
  month: string;
}

export function buildAiContext(userId: string, userName: string): AiContext {
  const db = getDb();
  const quotes = getQuotes();
  const account = getAccount(userId);
  const holdings = getHoldings(userId);
  const orders = getOrders(userId);
  const transactions = getTransactions(userId);
  const budgets = db.budgets.filter((b) => b.userId === userId && b.month === monthKey());
  const goals = db.goals.filter((g) => g.userId === userId);
  const watchlists = getWatchlists(userId);
  const alerts = getAlerts(userId);

  const portfolio = computePortfolio(holdings, quotes, account?.cash || 0, account?.startingCash || 1000000);
  const money = computeMoneySummary(transactions, budgets, goals);
  const topHolding = portfolio.holdings.length
    ? [...portfolio.holdings].sort((a, b) => b.allocation - a.allocation)[0]
    : null;

  const completedOrders = orders.filter((o) => o.status === "completed");
  const stocks = quotes.filter((q) => !q.isIndex);
  const movers = stocks
    .map((q) => ({ symbol: q.symbol, changePercent: ((q.price - q.prevClose) / q.prevClose) * 100 }))
    .sort((a, b) => b.changePercent - a.changePercent);

  const overBudget = money.budgets.filter((b) => b.percent > 100).map((b) => b.category);

  return {
    userName,
    portfolio: {
      totalValue: portfolio.totalValue,
      cash: portfolio.cash,
      invested: portfolio.invested,
      value: portfolio.value,
      totalPnl: portfolio.totalPnl,
      totalPnlPercent: portfolio.totalPnlPercent,
      dayPnl: portfolio.dayPnl,
      dayPnlPercent: portfolio.dayPnlPercent,
      topHolding: topHolding
        ? { symbol: topHolding.symbol, allocation: topHolding.allocation, pnl: topHolding.pnl }
        : null,
      cashPercent: portfolio.totalValue > 0 ? (portfolio.cash / portfolio.totalValue) * 100 : 100,
    },
    money: {
      income: money.income,
      expenses: money.expenses,
      net: money.net,
      savingsRate: money.savingsRate,
      topCategory: money.categories[0] ? { label: money.categories[0].label, value: money.categories[0].value } : null,
      overBudget,
      goals: money.goals.map((g) => ({
        name: g.name,
        target: g.target,
        current: g.current,
        percent: g.target > 0 ? (g.current / g.target) * 100 : 0,
      })),
    },
    trading: {
      totalOrders: orders.length,
      completed: completedOrders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
      buys: completedOrders.filter((o) => o.side === "buy").length,
      sells: completedOrders.filter((o) => o.side === "sell").length,
      recentSymbols: completedOrders.slice(0, 5).map((o) => o.symbol),
    },
    market: {
      indices: quotes
        .filter((q) => q.isIndex)
        .map((q) => ({
          symbol: q.symbol,
          name: q.name,
          price: q.price,
          changePercent: ((q.price - q.prevClose) / q.prevClose) * 100,
        })),
      topGainers: movers.slice(0, 3).map((m) => ({ symbol: m.symbol, changePercent: m.changePercent })),
      topLosers: movers.slice(-3).reverse().map((m) => ({ symbol: m.symbol, changePercent: m.changePercent })),
    },
    watchlists: watchlists.map((w) => ({ name: w.name, symbols: w.symbols })),
    alerts: alerts.map((a) => ({
      symbol: a.symbol,
      condition: a.condition,
      price: a.price,
      active: a.active,
    })),
    month: money.month,
  };
}

export function getAiInsights(userId: string, userName: string): AiInsight[] {
  const ctx = buildAiContext(userId, userName);
  const insights: AiInsight[] = [];

  if (ctx.portfolio.topHolding && ctx.portfolio.topHolding.allocation > 35) {
    insights.push({
      id: "concentration",
      tone: "warning",
      title: "Portfolio concentration is high",
      body: `${ctx.portfolio.topHolding.symbol} is ${ctx.portfolio.topHolding.allocation.toFixed(1)}% of your virtual portfolio. Consider reviewing position sizing in your paper trades.`,
      action: { label: "Review portfolio", href: "/portfolio" },
    });
  } else if (ctx.portfolio.topHolding) {
    insights.push({
      id: "diversification",
      tone: "positive",
      title: "Reasonable diversification",
      body: `Your largest position (${ctx.portfolio.topHolding.symbol}) is ${ctx.portfolio.topHolding.allocation.toFixed(1)}% of the portfolio, below the 35% concentration threshold.`,
      action: { label: "View holdings", href: "/portfolio" },
    });
  }

  if (ctx.portfolio.cashPercent > 50) {
    insights.push({
      id: "idle-cash",
      tone: "info",
      title: "Plenty of virtual cash available",
      body: `${formatPercent(ctx.portfolio.cashPercent)} of your portfolio is in virtual cash. You have room to test new paper trades without over-committing.`,
      action: { label: "Open trading desk", href: "/trading" },
    });
  } else if (ctx.portfolio.cashPercent < 10) {
    insights.push({
      id: "low-cash",
      tone: "warning",
      title: "Low virtual cash buffer",
      body: `Only ${formatPercent(ctx.portfolio.cashPercent)} of your portfolio is in cash. Keep a buffer so you can manage existing positions and limit orders.`,
      action: { label: "Check wallet", href: "/portfolio" },
    });
  }

  insights.push({
    id: "day-pnl",
    tone: ctx.portfolio.dayPnl >= 0 ? "positive" : "danger",
    title: ctx.portfolio.dayPnl >= 0 ? "Portfolio is up today" : "Portfolio is down today",
    body: `${ctx.portfolio.dayPnl >= 0 ? "+" : ""}${formatCurrency(ctx.portfolio.dayPnl)} (${formatPercent(ctx.portfolio.dayPnlPercent)}) versus previous simulated close.`,
    action: { label: "See performance", href: "/portfolio" },
  });

  if (ctx.money.overBudget.length) {
    insights.push({
      id: "budget-overrun",
      tone: "danger",
      title: "Budget categories need attention",
      body: `${ctx.money.overBudget.join(", ")} ${ctx.money.overBudget.length === 1 ? "is" : "are"} over the monthly limit. Review recent transactions before adding more spending.`,
      action: { label: "Review budgets", href: "/money" },
    });
  } else if (ctx.money.savingsRate < 20 && ctx.money.income > 0) {
    insights.push({
      id: "savings-rate",
      tone: "warning",
      title: "Savings rate is below target",
      body: `You are saving ${formatPercent(ctx.money.savingsRate)} of income this month. A 20% target is a useful starting point for personal finance goals.`,
      action: { label: "Open money manager", href: "/money" },
    });
  } else if (ctx.money.income > 0) {
    insights.push({
      id: "savings-healthy",
      tone: "positive",
      title: "Healthy monthly savings rate",
      body: `You are keeping ${formatPercent(ctx.money.savingsRate)} of this month's income. Consider allocating part of it toward a savings goal.`,
      action: { label: "View goals", href: "/money" },
    });
  }

  const goal = [...ctx.money.goals].sort((a, b) => b.percent - a.percent)[0];
  if (goal) {
    insights.push({
      id: "goal-progress",
      tone: "info",
      title: `${goal.name} is ${goal.percent.toFixed(0)}% complete`,
      body: `${formatCurrency(goal.current)} saved toward ${formatCurrency(goal.target)}. Small, frequent contributions keep the goal on track.`,
      action: { label: "Manage goals", href: "/money" },
    });
  }

  if (ctx.trading.pending > 0) {
    insights.push({
      id: "pending-orders",
      tone: "info",
      title: `${ctx.trading.pending} pending paper order${ctx.trading.pending === 1 ? "" : "s"}`,
      body: "Limit orders are waiting for the simulated price to reach your target. You can cancel them any time from the orders page.",
      action: { label: "View orders", href: "/orders" },
    });
  }

  return insights.slice(0, 6);
}

function localAnswer(question: string, ctx: AiContext): string {
  const q = question.toLowerCase();

  if (/(hello|hi|hey|help|what can you do)/.test(q)) {
    return `Hi ${ctx.userName.split(" ")[0]}! I can review your virtual portfolio, explain paper-trading risk, summarize simulated market moves, and help you spot budget or savings trends. Ask me something like "How diversified is my portfolio?" or "How are my budgets doing?"`;
  }

  if (/(portfolio|holding|diversif|concentrat|risk)/.test(q)) {
    const top = ctx.portfolio.topHolding;
    const msg = top
      ? `Your virtual portfolio is worth ${formatCurrency(ctx.portfolio.totalValue)}, with ${formatCurrency(ctx.portfolio.cash)} in cash (${ctx.portfolio.cashPercent.toFixed(1)}%). Your largest holding is ${top.symbol} at ${top.allocation.toFixed(1)}% of the portfolio, currently ${top.pnl >= 0 ? "up" : "down"} ${formatCurrency(Math.abs(top.pnl))}. ${top.allocation > 35 ? "That is a concentrated position, so paper-trade smaller sizes if you want more diversification." : "That concentration level is moderate."}`
      : `You do not have any stock holdings yet. Your virtual portfolio consists of ${formatCurrency(ctx.portfolio.cash)} in cash, ready for paper trading.`;
    return `${msg} This is educational analysis of simulated data, not investment advice.`;
  }

  if (/(cash|buying power|wallet)/.test(q)) {
    return `You have ${formatCurrency(ctx.portfolio.cash)} of virtual cash available, which is ${ctx.portfolio.cashPercent.toFixed(1)}% of your total paper-trading portfolio. Cash is not real money and cannot be deposited or withdrawn.`;
  }

  if (/(today|day pnl|profit|loss|performance|return)/.test(q)) {
    return `Today's simulated portfolio change is ${ctx.portfolio.dayPnl >= 0 ? "+" : ""}${formatCurrency(ctx.portfolio.dayPnl)} (${formatPercent(ctx.portfolio.dayPnlPercent)}). Your all-time virtual return is ${ctx.portfolio.totalPnl >= 0 ? "+" : ""}${formatCurrency(ctx.portfolio.totalPnl)} (${formatPercent(ctx.portfolio.totalPnlPercent)}).`;
  }

  if (/(budget|expense|spend|spending|category|money)/.test(q)) {
    const cat = ctx.money.topCategory;
    const over = ctx.money.overBudget.length ? ctx.money.overBudget.join(", ") : "none";
    return `This month you recorded ${formatCurrency(ctx.money.income)} income and ${formatCurrency(ctx.money.expenses)} expenses, leaving ${formatCurrency(ctx.money.net)} net. ${cat ? `Your largest expense category is ${cat.label} at ${formatCurrency(cat.value)}.` : "No expenses have been recorded yet."} Categories over budget: ${over}. These amounts are personal-finance tracking entries, separate from your virtual trading wallet.`;
  }

  if (/(sav|goal|target)/.test(q)) {
    const goal = [...ctx.money.goals].sort((a, b) => b.percent - a.percent)[0];
    return goal
      ? `Your closest savings goal is ${goal.name}: ${formatCurrency(goal.current)} of ${formatCurrency(goal.target)} (${goal.percent.toFixed(0)}%). Your current monthly savings rate is ${formatPercent(ctx.money.savingsRate)}.`
      : `You have not created a savings goal yet. Add one in Money Management, then track contributions against the target.`;
  }

  if (/(order|trade|buy|sell|history)/.test(q)) {
    return `You have ${ctx.trading.totalOrders} paper orders: ${ctx.trading.completed} completed, ${ctx.trading.pending} pending, and ${ctx.trading.cancelled} cancelled. Completed orders include ${ctx.trading.buys} buys and ${ctx.trading.sells} sells. Recent symbols: ${ctx.trading.recentSymbols.length ? ctx.trading.recentSymbols.join(", ") : "none yet"}. All orders are simulated and never touch a brokerage.`;
  }

  if (/(market|nifty|sensex|index|stock|price|gain|loser)/.test(q)) {
    const indices = ctx.market.indices
      .map((i) => `${i.symbol} ${i.price.toFixed(2)} (${formatPercent(i.changePercent)})`)
      .join("; ");
    const gainers = ctx.market.topGainers.map((g) => `${g.symbol} ${formatPercent(g.changePercent)}`).join(", ");
    return `Simulated market snapshot: ${indices}. Top gainers include ${gainers || "no movers"}. Prices are generated for practice and are not live exchange quotes.`;
  }

  if (/(watchlist|alert)/.test(q)) {
    const lists = ctx.watchlists.map((w) => `${w.name} (${w.symbols.length})`).join(", ") || "none";
    return `You have these watchlists: ${lists}. You also have ${ctx.alerts.filter((a) => a.active).length} active price alerts. Alerts are based on simulated prices only.`;
  }

  return `I can help with five areas: portfolio and risk, virtual cash and orders, simulated market moves, budgets and spending, and savings goals. Based on your current data, your paper portfolio is ${formatCurrency(ctx.portfolio.totalValue)} with a ${formatPercent(ctx.portfolio.dayPnlPercent)} simulated day change, and your monthly net is ${formatCurrency(ctx.money.net)}. Ask a more specific question for a detailed breakdown.`;
}

const SYSTEM_PROMPT = `You are FinTas AI Mode, an educational assistant inside a paper-trading and personal money-management demo app.
Rules:
- Be concise, practical and friendly.
- Treat all market data as simulated, never live.
- Never claim to execute real trades or move real money.
- Do not provide personalized financial advice; frame answers as education.
- Use only the provided user context for numbers.
- If asked about unsupported features, say so clearly.`;

export async function generateAiAnswer(question: string, ctx: AiContext): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return localAnswer(question, ctx);

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 500,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "system", content: `USER CONTEXT (JSON): ${JSON.stringify(ctx)}` },
          { role: "user", content: question },
        ],
      }),
    });
    if (!res.ok) return localAnswer(question, ctx);
    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() || localAnswer(question, ctx);
  } catch {
    return localAnswer(question, ctx);
  }
}

export const AI_SUGGESTIONS = [
  "How diversified is my virtual portfolio?",
  "How are my budgets doing this month?",
  "Summarize today's simulated market",
  "What do my pending orders mean?",
  "How close am I to my savings goals?",
];
