// Domain types shared across the app.

export type Role = "owner" | "karyawan";

export interface User {
  id: string;
  name: string;
  username: string;
  password: string;
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

export interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  note: string;
  createdBy: string;
  receiptImage?: string;
  receiptImageName?: string;
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
