import fs from "fs";
import path from "path";
import {
  AuditLog,
  Budget,
  Database,
  FinanceTransaction,
  Holding,
  Order,
  PriceAlert,
  Quote,
  SavingsGoal,
  SessionUser,
  User,
  UserPreferences,
  VirtualAccount,
  Watchlist,
} from "./types";
import { daysAgoISO, generateId, monthKey } from "./utils";

const DATA_DIR = path.join(process.cwd(), ".fintas-data");
const DATA_FILE = path.join(DATA_DIR, "db.json");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function defaultPreferences(): UserPreferences {
  return {
    theme: "dark",
    emailAlerts: true,
    priceAlerts: true,
    weeklyDigest: false,
  };
}

function seedQuotes(): Quote[] {
  const now = new Date().toISOString();
  return [
    {
      symbol: "RELIANCE",
      name: "Reliance Industries Ltd.",
      sector: "Energy",
      price: 1485.6,
      prevClose: 1472.4,
      open: 1475.0,
      high: 1490.2,
      low: 1471.8,
      volume: 8423450,
      marketCap: 10050000000000,
      isIndex: false,
      updatedAt: now,
      description: "Oil-to-chemicals, retail, digital services conglomerate.",
    },
    {
      symbol: "TCS",
      name: "Tata Consultancy Services Ltd.",
      sector: "IT",
      price: 3892.25,
      prevClose: 3855.4,
      open: 3860.0,
      high: 3910.5,
      low: 3858.2,
      volume: 1562340,
      marketCap: 14120000000000,
      isIndex: false,
      updatedAt: now,
      description: "Global IT services and consulting.",
    },
    {
      symbol: "INFY",
      name: "Infosys Ltd.",
      sector: "IT",
      price: 1876.8,
      prevClose: 1859.3,
      open: 1862.5,
      high: 1885.4,
      low: 1860.1,
      volume: 4231560,
      marketCap: 7770000000000,
      isIndex: false,
      updatedAt: now,
      description: "IT services, consulting and digital solutions.",
    },
    {
      symbol: "HDFCBANK",
      name: "HDFC Bank Ltd.",
      sector: "Financials",
      price: 1684.45,
      prevClose: 1675.2,
      open: 1678.0,
      high: 1692.3,
      low: 1676.5,
      volume: 7645320,
      marketCap: 12780000000000,
      isIndex: false,
      updatedAt: now,
      description: "Private sector banking and financial services.",
    },
    {
      symbol: "ICICIBANK",
      name: "ICICI Bank Ltd.",
      sector: "Financials",
      price: 1325.9,
      prevClose: 1312.6,
      open: 1315.0,
      high: 1334.2,
      low: 1313.4,
      volume: 6234560,
      marketCap: 9320000000000,
      isIndex: false,
      updatedAt: now,
      description: "Banking and financial services.",
    },
    {
      symbol: "SBIN",
      name: "State Bank of India",
      sector: "Financials",
      price: 812.35,
      prevClose: 804.2,
      open: 806.0,
      high: 819.4,
      low: 803.8,
      volume: 9876540,
      marketCap: 7250000000000,
      isIndex: false,
      updatedAt: now,
      description: "Public sector banking.",
    },
    {
      symbol: "NIFTY50",
      name: "NIFTY 50 Index",
      sector: "Index",
      price: 26245.3,
      prevClose: 26120.5,
      open: 26140.0,
      high: 26280.6,
      low: 26130.2,
      volume: 0,
      marketCap: 0,
      isIndex: true,
      updatedAt: now,
      description: "NSE benchmark index of 50 large companies (Simulated).",
    },
    {
      symbol: "SENSEX",
      name: "S&P BSE SENSEX",
      sector: "Index",
      price: 85792.4,
      prevClose: 85450.2,
      open: 85500.0,
      high: 85920.8,
      low: 85480.5,
      volume: 0,
      marketCap: 0,
      isIndex: true,
      updatedAt: now,
      description: "BSE benchmark index (Simulated).",
    },
  ];
}

function seedData(): Database {
  const now = new Date().toISOString();
  const quotes = seedQuotes();
  const adminUser: User = {
    id: generateId("usr"),
    name: "FinTas Admin",
    email: "admin@fintastrading.app",
    passwordHash: "admin123hash",
    role: "admin",
    status: "active",
    createdAt: now,
    avatarColor: "#22d3ee",
    preferences: defaultPreferences(),
  };
  const demoUser: User = {
    id: generateId("usr"),
    name: "Demo Trader",
    email: "demo@fintastrading.app",
    passwordHash: "demo123hash",
    role: "user",
    status: "active",
    createdAt: now,
    avatarColor: "#34d399",
    preferences: defaultPreferences(),
  };
  const account: VirtualAccount = {
    userId: demoUser.id,
    startingCash: 1000000,
    cash: 1000000,
    createdAt: now,
    updatedAt: now,
  };
  const watchlist: Watchlist = {
    id: generateId("wlist"),
    userId: demoUser.id,
    name: "My Watchlist",
    symbols: ["RELIANCE", "TCS", "HDFCBANK", "NIFTY50"],
    createdAt: now,
  };
  const txs: FinanceTransaction[] = [
    {
      id: generateId("txn"),
      userId: demoUser.id,
      kind: "income",
      category: "Salary",
      description: "Monthly salary",
      amount: 85000,
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
      createdAt: now,
    },
    {
      id: generateId("txn"),
      userId: demoUser.id,
      kind: "expense",
      category: "Rent",
      description: "Apartment rent",
      amount: 25000,
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 5).toISOString(),
      createdAt: now,
    },
    {
      id: generateId("txn"),
      userId: demoUser.id,
      kind: "expense",
      category: "Groceries",
      description: "Weekly groceries",
      amount: 8500,
      date: new Date(new Date().getFullYear(), new Date().getMonth(), 10).toISOString(),
      createdAt: now,
    },
  ];
  const mk = monthKey();
  const budgets: Budget[] = [
    { id: generateId("bud"), userId: demoUser.id, category: "Rent", month: mk, limit: 25000, createdAt: now },
    { id: generateId("bud"), userId: demoUser.id, category: "Groceries", month: mk, limit: 12000, createdAt: now },
    { id: generateId("bud"), userId: demoUser.id, category: "Entertainment", month: mk, limit: 5000, createdAt: now },
  ];
  const goals: SavingsGoal[] = [
    {
      id: generateId("goal"),
      userId: demoUser.id,
      name: "Emergency Fund",
      target: 300000,
      current: 85000,
      targetDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
      color: "#22c55e",
      createdAt: now,
    },
    {
      id: generateId("goal"),
      userId: demoUser.id,
      name: "Vacation",
      target: 120000,
      current: 32000,
      targetDate: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString(),
      color: "#38bdf8",
      createdAt: now,
    },
  ];
  const alerts: PriceAlert[] = [];
  const notifications: Array<any> = [
    {
      id: generateId("notif"),
      userId: demoUser.id,
      title: "Welcome to FinTas Trading",
      message: "Start practicing with ₹10,00,000 virtual cash. Simulated market data only.",
      kind: "system",
      read: false,
      createdAt: now,
    },
  ];
  const auditLogs: AuditLog[] = [
    {
      id: generateId("audit"),
      userId: adminUser.id,
      userName: adminUser.name,
      action: "system.init",
      details: "Application initialized with seed data",
      ip: "127.0.0.1",
      createdAt: now,
    },
  ];
  return {
    version: 1,
    users: [adminUser, demoUser],
    accounts: [account],
    holdings: [],
    orders: [],
    watchlists: [watchlist],
    transactions: txs,
    budgets,
    goals,
    alerts,
    notifications,
    auditLogs,
    quotes,
    lastTickAt: Date.now(),
  };
}

function load(): Database {
  ensureDir();
  if (!fs.existsSync(DATA_FILE)) {
    const db = seedData();
    save(db);
    return db;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as Database;
    // quick sanity
    if (!parsed.quotes || parsed.quotes.length === 0) {
      parsed.quotes = seedQuotes();
    }
    return parsed;
  } catch {
    const db = seedData();
    save(db);
    return db;
  }
}

function save(db: Database) {
  ensureDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), "utf8");
}

let cache: Database | null = null;

export function getDb(): Database {
  if (!cache) {
    cache = load();
  }
  return cache;
}

export function writeDb(mutator: (db: Database) => void) {
  const db = getDb();
  mutator(db);
  db.lastTickAt = Date.now();
  save(db);
  cache = db;
  return db;
}

export function getUserByEmail(email: string): User | undefined {
  const db = getDb();
  return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id: string): User | undefined {
  const db = getDb();
  return db.users.find((u) => u.id === id);
}

export function toSessionUser(u: User): SessionUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
    avatarColor: u.avatarColor,
    preferences: u.preferences,
  };
}

export function getAccount(userId: string): VirtualAccount | undefined {
  const db = getDb();
  return db.accounts.find((a) => a.userId === userId);
}

export function getQuotes(): Quote[] {
  const db = getDb();
  return db.quotes;
}

export function getQuote(symbol: string): Quote | undefined {
  const db = getDb();
  return db.quotes.find((q) => q.symbol.toUpperCase() === symbol.toUpperCase());
}

export function getHoldings(userId: string): Holding[] {
  const db = getDb();
  return db.holdings.filter((h) => h.userId === userId);
}

export function getOrders(userId: string): Order[] {
  const db = getDb();
  return db.orders.filter((o) => o.userId === userId).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getWatchlists(userId: string): Watchlist[] {
  const db = getDb();
  return db.watchlists.filter((w) => w.userId === userId);
}

export function getTransactions(userId: string): FinanceTransaction[] {
  const db = getDb();
  return db.transactions.filter((t) => t.userId === userId).sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getBudgets(userId: string, month?: string): Budget[] {
  const db = getDb();
  const m = month || monthKey();
  return db.budgets.filter((b) => b.userId === userId && b.month === m);
}

export function getGoals(userId: string): SavingsGoal[] {
  const db = getDb();
  return db.goals.filter((g) => g.userId === userId);
}

export function getAlerts(userId: string): PriceAlert[] {
  const db = getDb();
  return db.alerts.filter((a) => a.userId === userId);
}

export function getNotifications(userId: string): Array<any> {
  const db = getDb();
  return db.notifications.filter((n: any) => n.userId === userId).sort((a: any, b: any) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function addAudit(userId: string | null, userName: string, action: string, details: string, ip: string = "127.0.0.1") {
  writeDb((db) => {
    db.auditLogs.unshift({
      id: generateId("audit"),
      userId,
      userName,
      action,
      details,
      ip,
      createdAt: new Date().toISOString(),
    });
  });
}
