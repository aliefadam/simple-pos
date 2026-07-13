import { v4 as uuid } from "uuid";
import { STORAGE_KEYS } from "../constants";
import { storageService } from "./storageService";
import { productService } from "./productService";
import { isSameDay, isSameMonth } from "../utils/format";
import type { CartItem, PaymentMethod, Transaction, TransactionStatus, User } from "../types";

function generateCode(seq: number): string {
  const d = new Date();
  return `TRX${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(seq).padStart(4, "0")}`;
}

export const transactionService = {
  getAll(): Transaction[] {
    return storageService
      .getAll<Transaction>(STORAGE_KEYS.TRANSACTIONS)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getById(id: string): Transaction | undefined {
    return storageService.getOne<Transaction>(STORAGE_KEYS.TRANSACTIONS, id);
  },

  getToday(): Transaction[] {
    const now = new Date().toISOString();
    return this.getAll().filter((t) => isSameDay(t.date, now) && t.status === "selesai");
  },

  getThisMonth(): Transaction[] {
    const now = new Date().toISOString();
    return this.getAll().filter((t) => isSameMonth(t.date, now) && t.status === "selesai");
  },

  getHeld(): Transaction[] {
    return this.getAll().filter((t) => t.status === "ditahan");
  },

  getByCashier(cashierId: string): Transaction[] {
    return this.getAll().filter((t) => t.cashierId === cashierId);
  },

  checkout(
    items: CartItem[],
    paymentMethod: PaymentMethod,
    cashier: User,
    options?: { cashReceived?: number; extraCharge?: number; status?: TransactionStatus }
  ): Transaction {
    const all = storageService.getAll<Transaction>(STORAGE_KEYS.TRANSACTIONS);
    const subtotal = items.reduce((sum, it) => sum + it.price * it.qty, 0);
    const extraCharge = Math.max(0, options?.extraCharge ?? 0);
    const total = subtotal + extraCharge;
    const status = options?.status ?? "selesai";
    const transaction: Transaction = {
      id: uuid(),
      code: generateCode(all.length + 1),
      date: new Date().toISOString(),
      cashierId: cashier.id,
      cashierName: cashier.name,
      items,
      subtotal,
      extraCharge,
      total,
      paymentMethod,
      cashReceived: options?.cashReceived,
      change: options?.cashReceived ? options.cashReceived - total : undefined,
      status,
    };
    storageService.insert(STORAGE_KEYS.TRANSACTIONS, transaction);

    if (status === "selesai") {
      items.forEach((item) => {
        const product = productService.getById(item.productId);
        if (product?.trackStock) {
          productService.adjustStock(item.productId, -item.qty);
        }
      });
    }
    return transaction;
  },

  resumeHeld(id: string): Transaction | undefined {
    const tx = this.getById(id);
    if (!tx) return undefined;
    storageService.remove<Transaction>(STORAGE_KEYS.TRANSACTIONS, id);
    return tx;
  },

  cancel(id: string): void {
    storageService.update<Transaction>(STORAGE_KEYS.TRANSACTIONS, id, { status: "dibatalkan" });
  },

  remove(id: string): void {
    storageService.remove<Transaction>(STORAGE_KEYS.TRANSACTIONS, id);
  },
};
