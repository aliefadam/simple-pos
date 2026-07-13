import { v4 as uuid } from "uuid";
import { STORAGE_KEYS } from "../constants";
import { storageService } from "../services/storageService";
import type {
  User,
  Category,
  Product,
  Transaction,
  StockMovement,
  Expense,
  AppSettings,
  CartItem,
  PaymentMethod,
} from "../types";

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

function dateAt(daysAgo: number, hour: number, minute: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, randInt(0, 59), 0);
  return d.toISOString();
}

const USERS: User[] = [
  {
    id: "user-owner",
    name: "Pak Broto",
    username: "owner",
    password: "password",
    role: "owner",
    active: true,
    createdAt: dateAt(120, 8, 0),
  },
  {
    id: "user-kasir",
    name: "Siti Kasir",
    username: "kasir",
    password: "password",
    role: "karyawan",
    active: true,
    createdAt: dateAt(90, 8, 0),
  },
  {
    id: "user-kasir-2",
    name: "Budi Santoso",
    username: "budi",
    password: "password",
    role: "karyawan",
    active: true,
    createdAt: dateAt(60, 8, 0),
  },
];

const CATEGORIES: Category[] = [
  { id: "cat-makanan", name: "Makanan", icon: "fi-rr-bowl-rice", active: true, createdAt: dateAt(120, 8, 0) },
  { id: "cat-minuman", name: "Minuman", icon: "fi-rr-glass", active: true, createdAt: dateAt(120, 8, 0) },
  { id: "cat-snack", name: "Snack", icon: "fi-rr-cookie", active: true, createdAt: dateAt(120, 8, 0) },
  { id: "cat-rokok", name: "Rokok", icon: "fi-rr-smoking", active: true, createdAt: dateAt(120, 8, 0) },
];

const PRODUCTS: Product[] = [
  {
    id: "prod-nasi-kucing",
    name: "Nasi Kucing",
    categoryId: "cat-makanan",
    price: 3000,
    stock: 45,
    trackStock: true,
    image: "",
    active: true,
    createdAt: dateAt(120, 8, 0),
  },
  {
    id: "prod-sate-usus",
    name: "Sate Usus",
    categoryId: "cat-makanan",
    price: 3000,
    stock: 60,
    trackStock: true,
    image: "",
    active: true,
    createdAt: dateAt(120, 8, 0),
  },
  {
    id: "prod-sate-ati",
    name: "Sate Ati",
    categoryId: "cat-makanan",
    price: 3500,
    stock: 40,
    trackStock: true,
    image: "",
    active: true,
    createdAt: dateAt(120, 8, 0),
  },
  {
    id: "prod-sate-telur-puyuh",
    name: "Sate Telur Puyuh",
    categoryId: "cat-makanan",
    price: 3000,
    stock: 8,
    trackStock: true,
    image: "",
    active: true,
    createdAt: dateAt(120, 8, 0),
  },
  {
    id: "prod-indomie-rebus",
    name: "Indomie Rebus",
    categoryId: "cat-makanan",
    price: 8000,
    stock: 6,
    trackStock: true,
    image: "",
    active: true,
    createdAt: dateAt(120, 8, 0),
  },
  {
    id: "prod-es-teh",
    name: "Es Teh",
    categoryId: "cat-minuman",
    price: 4000,
    stock: 100,
    trackStock: true,
    image: "",
    active: true,
    createdAt: dateAt(120, 8, 0),
  },
  {
    id: "prod-kopi-hitam",
    name: "Kopi Hitam",
    categoryId: "cat-minuman",
    price: 5000,
    stock: 80,
    trackStock: true,
    image: "",
    active: true,
    createdAt: dateAt(120, 8, 0),
  },
  {
    id: "prod-teh-hangat",
    name: "Teh Hangat",
    categoryId: "cat-minuman",
    price: 3000,
    stock: 90,
    trackStock: true,
    image: "",
    active: true,
    createdAt: dateAt(120, 8, 0),
  },
  {
    id: "prod-pop-ice",
    name: "Pop Ice",
    categoryId: "cat-minuman",
    price: 6000,
    stock: 0,
    trackStock: true,
    image: "",
    active: true,
    createdAt: dateAt(120, 8, 0),
  },
  {
    id: "prod-air-mineral",
    name: "Air Mineral",
    categoryId: "cat-minuman",
    price: 4000,
    stock: 120,
    trackStock: true,
    image: "",
    active: true,
    createdAt: dateAt(120, 8, 0),
  },
  {
    id: "prod-kacang-rebus",
    name: "Kacang Rebus",
    categoryId: "cat-snack",
    price: 3000,
    stock: 35,
    trackStock: true,
    image: "",
    active: true,
    createdAt: dateAt(120, 8, 0),
  },
  {
    id: "prod-rokok-filter",
    name: "Rokok Filter",
    categoryId: "cat-rokok",
    price: 25000,
    stock: 30,
    trackStock: true,
    image: "",
    active: true,
    createdAt: dateAt(120, 8, 0),
  },
];

const PAYMENTS: PaymentMethod[] = ["tunai", "tunai", "tunai", "qris"];

function buildTransaction(daysAgo: number, seq: number): Transaction {
  const hour = randInt(7, 21);
  const minute = randInt(0, 59);
  const date = dateAt(daysAgo, hour, minute);
  const itemCount = randInt(1, 4);
  const chosen = new Set<string>();
  const items: CartItem[] = [];
  for (let i = 0; i < itemCount; i++) {
    const product = pick(PRODUCTS.filter((p) => p.stock > 0 || true));
    if (chosen.has(product.id)) continue;
    chosen.add(product.id);
    const qty = randInt(1, 5);
    items.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty,
      image: product.image,
    });
  }
  if (items.length === 0) {
    const product = pick(PRODUCTS);
    items.push({ productId: product.id, name: product.name, price: product.price, qty: 1, image: product.image });
  }
  const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
  const extraCharge = pick([0, 0, 0, 1000, 2000]);
  const total = subtotal + extraCharge;
  const cashier = pick([USERS[1], USERS[2]]);
  const method = pick(PAYMENTS);
  const d = new Date(date);
  const code = `TRX${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(seq).padStart(4, "0")}`;
  const cashReceived = method === "tunai" ? Math.ceil(total / 1000) * 1000 + pick([0, 0, 5000, 10000]) : undefined;
  return {
    id: uuid(),
    code,
    date,
    cashierId: cashier.id,
    cashierName: cashier.name,
    items,
    subtotal,
    extraCharge,
    total,
    paymentMethod: method,
    cashReceived,
    change: cashReceived ? cashReceived - total : undefined,
    status: "selesai",
  };
}

function buildTransactions(): Transaction[] {
  const txs: Transaction[] = [];
  let seq = 1;
  // 20+ transactions today
  for (let i = 0; i < 22; i++) {
    txs.push(buildTransaction(0, seq++));
  }
  // spread remaining ~35 across the past 29 days for ~50+ this month
  for (let i = 0; i < 35; i++) {
    txs.push(buildTransaction(randInt(1, 27), seq++));
  }
  // one held transaction for demo
  const held = buildTransaction(0, seq++);
  held.status = "ditahan";
  txs.push(held);
  return txs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function buildStockMovements(): StockMovement[] {
  const moves: StockMovement[] = PRODUCTS.map((p) => ({
    id: uuid(),
    productId: p.id,
    productName: p.name,
    type: "masuk",
    qty: p.trackStock ? p.stock : 0,
    reason: "Stok awal setup toko",
    date: dateAt(120, 8, 0),
    userId: "user-owner",
    userName: "Pak Broto",
  }));
  moves.push({
    id: uuid(),
    productId: "prod-es-teh",
    productName: "Es Teh",
    type: "masuk",
    qty: 50,
    reason: "Restock gula & teh celup",
    date: dateAt(3, 9, 15),
    userId: "user-owner",
    userName: "Pak Broto",
  });
  moves.push({
    id: uuid(),
    productId: "prod-sate-telur-puyuh",
    productName: "Sate Telur Puyuh",
    type: "penyesuaian",
    qty: -3,
    reason: "Barang rusak / basi",
    date: dateAt(1, 20, 0),
    userId: "user-kasir",
    userName: "Siti Kasir",
  });
  moves.push({
    id: uuid(),
    productId: "prod-pop-ice",
    productName: "Pop Ice",
    type: "penyesuaian",
    qty: -2,
    reason: "Salah input saat kulakan",
    date: dateAt(2, 17, 30),
    userId: "user-kasir-2",
    userName: "Budi Santoso",
  });
  return moves;
}

function buildExpenses(): Expense[] {
  const items: { category: string; amount: number; note: string; daysAgo: number }[] = [
    { category: "Gas & Bahan Bakar", amount: 24000, note: "Beli gas elpiji 3kg", daysAgo: 0 },
    { category: "Es Batu", amount: 15000, note: "Beli es batu 3 balok", daysAgo: 0 },
    { category: "Kemasan & Plastik", amount: 12000, note: "Beli plastik & kresek", daysAgo: 1 },
    { category: "Listrik & Air", amount: 150000, note: "Bayar listrik bulan ini", daysAgo: 4 },
    { category: "Belanja Bahan", amount: 220000, note: "Belanja sayur & lauk pasar", daysAgo: 2 },
    { category: "Belanja Bahan", amount: 180000, note: "Belanja ayam & telur", daysAgo: 6 },
    { category: "Gas & Bahan Bakar", amount: 24000, note: "Beli gas elpiji 3kg", daysAgo: 9 },
    { category: "Sewa Tempat", amount: 500000, note: "Sewa lapak bulanan", daysAgo: 12 },
    { category: "Es Batu", amount: 15000, note: "Beli es batu", daysAgo: 10 },
    { category: "Gaji Karyawan", amount: 400000, note: "Bayar mingguan karyawan", daysAgo: 7 },
    { category: "Lain-lain", amount: 30000, note: "Beli tisu & sabun cuci piring", daysAgo: 15 },
    { category: "Kemasan & Plastik", amount: 10000, note: "Beli sedotan & tusuk sate", daysAgo: 18 },
  ];
  return items.map((it) => ({
    id: uuid(),
    date: dateAt(it.daysAgo, randInt(8, 19), randInt(0, 59)),
    category: it.category,
    amount: it.amount,
    note: it.note,
    createdBy: pick(["Pak Broto", "Siti Kasir", "Budi Santoso"]),
  }));
}

const DEFAULT_SETTINGS: AppSettings = {
  businessProfile: {
    name: "Angkringan Berkah Jaya",
    address: "Jl. Malioboro No. 45, Yogyakarta",
    phone: "0812-3456-7890",
    footerNote: "Terima kasih sudah mampir, monggo pinarak malih!",
  },
};

export function seedDatabaseIfNeeded(): void {
  const seeded = localStorage.getItem(STORAGE_KEYS.SEEDED);
  if (seeded) return;

  storageService.saveAll(STORAGE_KEYS.USERS, USERS);
  storageService.saveAll(STORAGE_KEYS.CATEGORIES, CATEGORIES);
  storageService.saveAll(STORAGE_KEYS.PRODUCTS, PRODUCTS);
  storageService.saveAll(STORAGE_KEYS.TRANSACTIONS, buildTransactions());
  storageService.saveAll(STORAGE_KEYS.STOCK_MOVEMENTS, buildStockMovements());
  storageService.saveAll(STORAGE_KEYS.EXPENSES, buildExpenses());
  storageService.setObject(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  localStorage.setItem(STORAGE_KEYS.SEEDED, "true");
}

export function resetDummyData(): void {
  localStorage.removeItem(STORAGE_KEYS.SEEDED);
  localStorage.removeItem(STORAGE_KEYS.USERS);
  localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
  localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
  localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
  localStorage.removeItem(STORAGE_KEYS.STOCK_MOVEMENTS);
  localStorage.removeItem(STORAGE_KEYS.EXPENSES);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  seedDatabaseIfNeeded();
}
