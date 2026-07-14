import { v4 as uuid } from "uuid";
import { DB_TABLES } from "../constants";
import { storageService } from "./storageService";
import { productService } from "./productService";
import { stockService } from "./stockService";
import { isSameDay, isSameMonth } from "../utils/format";
import type { CartItem, PaymentMethod, Transaction, TransactionStatus, User } from "../types";

function generateCode(seq: number): string {
  const d = new Date();
  return `TRX${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}-${String(seq).padStart(4, "0")}`;
}

export const transactionService = {
  async getAll(): Promise<Transaction[]> {
    return (await storageService
      .getAll<Transaction>(DB_TABLES.TRANSACTIONS))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async getById(id: string): Promise<Transaction | undefined> {
    return storageService.getOne<Transaction>(DB_TABLES.TRANSACTIONS, id);
  },

  async getToday(): Promise<Transaction[]> {
    const now = new Date().toISOString();
    return (await this.getAll()).filter((t) => isSameDay(t.date, now) && t.status === "selesai");
  },

  async getThisMonth(): Promise<Transaction[]> {
    const now = new Date().toISOString();
    return (await this.getAll()).filter((t) => isSameMonth(t.date, now) && t.status === "selesai");
  },

  async getHeld(): Promise<Transaction[]> {
    return (await this.getAll()).filter((t) => t.status === "ditahan");
  },

  async getByCashier(cashierId: string): Promise<Transaction[]> {
    return (await this.getAll()).filter((t) => t.cashierId === cashierId);
  },

  async checkout(
    items: CartItem[],
    paymentMethod: PaymentMethod,
    cashier: User,
    options?: { cashReceived?: number; extraCharge?: number; status?: TransactionStatus }
  ): Promise<Transaction> {
    const all = await storageService.getAll<Transaction>(DB_TABLES.TRANSACTIONS);
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
    await storageService.insert(DB_TABLES.TRANSACTIONS, transaction);

    if (status === "selesai") {
      for (const item of items) {
        const product = await productService.getById(item.productId);
        if (product?.trackStock) {
          await stockService.record(
            item.productId,
            "keluar-transaksi",
            -item.qty,
            `Terjual di transaksi ${transaction.code}`,
            cashier,
          );
        }
      }
    }
    return transaction;
  },

  async resumeHeld(id: string): Promise<Transaction | undefined> {
    const tx = await this.getById(id);
    if (!tx) return undefined;
    await storageService.remove(DB_TABLES.TRANSACTIONS, id);
    return tx;
  },

  async cancel(id: string, actor: User): Promise<void> {
    const transaction = await this.getById(id);
    if (!transaction) return;

    if (transaction.status === "selesai") {
      for (const item of transaction.items) {
        const product = await productService.getById(item.productId);
        if (product?.trackStock) {
          await stockService.record(
            item.productId,
            "penyesuaian",
            item.qty,
            `Pengembalian stok dari pembatalan transaksi ${transaction.code}`,
            actor,
          );
        }
      }
    }

    await storageService.update<Transaction>(DB_TABLES.TRANSACTIONS, id, {
      status: "dibatalkan",
    });
  },

  async remove(id: string): Promise<void> {
    await storageService.remove(DB_TABLES.TRANSACTIONS, id);
  },
};
