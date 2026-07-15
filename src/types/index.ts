// Domain types shared across the app.

export type Role = "owner" | "karyawan";

export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  passwordSalt?: string;
  role: Role;
  avatar?: string;
  active: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // flaticon uicon class, e.g. "fi-rr-bowl-rice"
  active: boolean;
  createdAt: string;
}

export interface RecipeItem {
  rawMaterialId: string;
  qty: number; // jumlah bahan baku terpakai per 1 unit produk terjual
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  stock: number;
  trackStock: boolean;
  image: string;
  active: boolean;
  createdAt: string;
  recipe?: RecipeItem[];
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
  note?: string;
  image: string;
}

export type PaymentMethod = "tunai" | "qris";
export type TransactionStatus = "selesai" | "ditahan" | "dibatalkan";

export interface Transaction {
  id: string;
  code: string;
  date: string; // ISO string
  cashierId: string;
  cashierName: string;
  items: CartItem[];
  subtotal: number;
  extraCharge: number;
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  change?: number;
  status: TransactionStatus;
}

export type StockMovementType = "masuk" | "penyesuaian" | "keluar-transaksi";

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  qty: number; // signed: positive = masuk, negative = keluar
  reason: string;
  date: string;
  userId: string;
  userName: string;
}

export interface RawMaterial {
  id: string;
  name: string;
  unit: string;
  stock: number;
  active: boolean;
  createdAt: string;
}

export interface RawMaterialMovement {
  id: string;
  rawMaterialId: string;
  rawMaterialName: string;
  type: StockMovementType;
  qty: number; // signed: positive = masuk, negative = keluar
  reason: string;
  date: string;
  userId: string;
  userName: string;
}

export interface Expense {
  id: string;
  date: string;
  createdAt?: string;
  category: string;
  amount: number;
  note: string;
  createdByUserId: string;
  createdBy: string;
  createdByRole: Role;
  receiptImage?: string;
  receiptImageName?: string;
}

export type ShiftStatus = "buka" | "tutup";

export interface Shift {
  id: string;
  cashierId: string;
  cashierName: string;
  closedByCashierId?: string;
  closedByCashierName?: string;
  openedAt: string;
  closedAt?: string;
  openingCash: number;
  totalCashSales?: number;
  totalCashExpenses?: number;
  expectedCash?: number;
  actualCash?: number;
  difference?: number;
  notes?: string;
  status: ShiftStatus;
}

export interface BusinessProfile {
  name: string;
  address: string;
  phone: string;
  logo?: string;
  footerNote: string;
}

export interface AppSettings {
  businessProfile: BusinessProfile;
}

export interface Session {
  userId: string;
  rememberMe: boolean;
  loginAt: string;
}
