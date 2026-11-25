export type Role = "user" | "admin";
export type UserStatus = "active" | "suspended";
export type ThemePreference = "dark" | "light" | "system";

export interface UserPreferences {
  theme: ThemePreference;
  emailAlerts: boolean;
  priceAlerts: boolean;
  weeklyDigest: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  avatarColor: string;
  preferences: UserPreferences;
}

export type SafeUser = Omit<User, "passwordHash">;

export interface VirtualAccount {
  userId: string;
  startingCash: number;
  cash: number;
  createdAt: string;
  updatedAt: string;
}

export interface Holding {
  id: string;
  userId: string;
  symbol: string;
  qty: number;
  avgPrice: number;
  updatedAt: string;
}

export type OrderSide = "buy" | "sell";
export type OrderType = "market" | "limit";
export type OrderStatus = "pending" | "completed" | "cancelled";

export interface Order {
  id: string;
  userId: string;
  symbol: string;
  side: OrderSide;
  qty: number;
  type: OrderType;
  limitPrice: number | null;
  status: OrderStatus;
  price: number | null;
  total: number | null;
  createdAt: string;
  executedAt: string | null;
  cancelledAt: string | null;
  note: string | null;
}

export interface Watchlist {
  id: string;
  userId: string;
  name: string;
  symbols: string[];
  createdAt: string;
}

export type TransactionKind = "income" | "expense";

export interface FinanceTransaction {
  id: string;
  userId: string;
  kind: TransactionKind;
  category: string;
  description: string;
  amount: number;
  date: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  category: string;
  month: string;
  limit: number;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  target: number;
  current: number;
  targetDate: string;
  color: string;
  createdAt: string;
}

export type AlertCondition = "above" | "below";

export interface PriceAlert {
  id: string;
  userId: string;
  symbol: string;
  condition: AlertCondition;
  price: number;
  active: boolean;
  createdAt: string;
  triggeredAt: string | null;
}

export type NotificationKind = "trade" | "alert" | "money" | "system";

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  kind: NotificationKind;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  userName: string;
  action: string;
  details: string;
  ip: string;
  createdAt: string;
}

export interface Quote {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  prevClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap: number;
  isIndex: boolean;
  updatedAt: string;
  description: string;
}

export interface Database {
  version: number;
  users: User[];
  accounts: VirtualAccount[];
  holdings: Holding[];
  orders: Order[];
  watchlists: Watchlist[];
  transactions: FinanceTransaction[];
  budgets: Budget[];
  goals: SavingsGoal[];
  alerts: PriceAlert[];
  notifications: AppNotification[];
  auditLogs: AuditLog[];
  quotes: Quote[];
  lastTickAt: number;
}

export interface ChartPoint {
  label: string;
  value: number;
}

export type Timeframe = "1D" | "1W" | "1M" | "3M" | "1Y";

export interface StockSeries {
  timeframe: Timeframe;
  points: ChartPoint[];
}

export interface PortfolioHolding extends Holding {
  name: string;
  sector: string;
  price: number;
  prevClose: number;
  value: number;
  invested: number;
  pnl: number;
  pnlPercent: number;
  dayPnl: number;
  allocation: number;
}

export interface PortfolioSnapshot {
  holdings: PortfolioHolding[];
  cash: number;
  startingCash: number;
  invested: number;
  value: number;
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  dayPnl: number;
  dayPnlPercent: number;
  allocation: Array<{ label: string; value: number; color: string }>;
}

export interface MoneySummary {
  month: string;
  income: number;
  expenses: number;
  net: number;
  savingsRate: number;
  categories: Array<{ label: string; value: number; color: string }>;
  monthly: Array<{ month: string; label: string; income: number; expenses: number }>;
  budgets: Array<Budget & { spent: number; percent: number; remaining: number }>;
  goals: SavingsGoal[];
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  avatarColor: string;
  preferences: UserPreferences;
}
