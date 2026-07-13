export const STORAGE_KEYS = {
  USERS: "pos_users",
  CATEGORIES: "pos_categories",
  PRODUCTS: "pos_products",
  TRANSACTIONS: "pos_transactions",
  STOCK_MOVEMENTS: "pos_stock_movements",
  EXPENSES: "pos_expenses",
  SETTINGS: "pos_settings",
  SESSION: "pos_session",
  THEME: "pos_theme",
  SEEDED: "pos_seeded_v1",
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
