export const DB_TABLES = {
  USERS: "users",
  CATEGORIES: "categories",
  PRODUCTS: "products",
  TRANSACTIONS: "transactions",
  STOCK_MOVEMENTS: "stock_movements",
  EXPENSES: "expenses",
  SETTINGS: "app_settings",
  SHIFTS: "shifts",
} as const;

export const SETTINGS_ROW_ID = "default";
export const SESSION_STORAGE_KEY = "pos_session";
export const SUPABASE_BUCKETS = {
  EXPENSE_RECEIPTS: "expense-receipts",
} as const;

export const EXPENSE_CATEGORIES = [
  "Belanja Bahan",
  "Gas & Bahan Bakar",
  "Es Batu",
  "Kemasan & Plastik",
  "Listrik & Air",
  "Sewa Tempat",
  "Gaji Karyawan",
  "Lain-lain",
];

export const PAYMENT_METHODS: { value: string; label: string; icon: string }[] = [
  { value: "tunai", label: "Tunai", icon: "fi fi-rr-money-bill-wave" },
  { value: "qris", label: "QRIS", icon: "fi fi-rr-qrcode" },
];

export const LOW_STOCK_THRESHOLD = 10;

export const CATEGORY_ICONS = [
  "fi-rr-bowl-rice",
  "fi-rr-glass",
  "fi-rr-cookie",
  "fi-rr-smoking",
  "fi-rr-coffee",
  "fi-rr-fire",
  "fi-rr-utensils",
  "fi-rr-ice-cream",
];
