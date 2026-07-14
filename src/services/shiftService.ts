import { v4 as uuid } from "uuid";
import { DB_TABLES } from "../constants";
import { storageService } from "./storageService";
import { transactionService } from "./transactionService";
import { expenseService } from "./expenseService";
import type { Shift, User } from "../types";

interface CashSummary {
  totalCashSales: number;
  totalCashExpenses: number;
  expectedCash: number;
}

// Transaction.date is stamped once at checkout() and never edited afterward,
// so windowing by date is race-free and gives a true point-in-time snapshot.
// Held (ditahan) transactions are deleted on resume and re-created fresh at
// checkout(), so a hold started in one shift but paid in another is correctly
// attributed to whichever shift is open at the moment payment completes.
//
// Expense.date is a user-editable, backdatable business date, so we window
// expenses by createdAt (the actual recording timestamp) instead.
async function computeCashSummary(shift: Shift, asOf: string): Promise<CashSummary> {
  const openedAtMs = new Date(shift.openedAt).getTime();
  const asOfMs = new Date(asOf).getTime();

  const allTransactions = await transactionService.getAll();
  const totalCashSales = allTransactions
    .filter((t) => {
      const ms = new Date(t.date).getTime();
      return (
        t.paymentMethod === "tunai" &&
        t.status === "selesai" &&
        ms >= openedAtMs &&
        ms <= asOfMs
      );
    })
    .reduce((sum, t) => sum + t.total, 0);

  const allExpenses = await expenseService.getAll();
  const totalCashExpenses = allExpenses
    .filter((e) => {
      const ms = new Date(e.createdAt ?? e.date).getTime();
      return ms >= openedAtMs && ms <= asOfMs;
    })
    .reduce((sum, e) => sum + e.amount, 0);

  return {
    totalCashSales,
    totalCashExpenses,
    expectedCash: shift.openingCash + totalCashSales - totalCashExpenses,
  };
}

export const shiftService = {
  async getAll(): Promise<Shift[]> {
    return (await storageService.getAll<Shift>(DB_TABLES.SHIFTS)).sort(
      (a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime(),
    );
  },

  async getOpen(): Promise<Shift | undefined> {
    const all = await this.getAll();
    return all.find((s) => s.status === "buka");
  },

  async open(cashier: User, openingCash: number): Promise<Shift> {
    const existing = await this.getOpen();
    if (existing) {
      throw new Error("Masih ada shift yang sedang berjalan");
    }
    const shift: Shift = {
      id: uuid(),
      cashierId: cashier.id,
      cashierName: cashier.name,
      openedAt: new Date().toISOString(),
      openingCash,
      status: "buka",
    };
    try {
      return await storageService.insert(DB_TABLES.SHIFTS, shift);
    } catch (error) {
      if (error instanceof Error && error.message.includes("shifts_one_open_idx")) {
        throw new Error("Shift sudah dibuka oleh perangkat lain");
      }
      throw error;
    }
  },

  /** Live preview of the cash reconciliation, safe to call repeatedly before closing. */
  async previewClose(shift: Shift): Promise<CashSummary> {
    return computeCashSummary(shift, new Date().toISOString());
  },

  async close(
    shiftId: string,
    cashier: User,
    actualCash: number,
    notes?: string,
  ): Promise<Shift> {
    const shift = await storageService.getOne<Shift>(DB_TABLES.SHIFTS, shiftId);
    if (!shift) throw new Error("Shift tidak ditemukan");
    if (shift.status !== "buka") throw new Error("Shift ini sudah ditutup");

    const closedAt = new Date().toISOString();
    const { totalCashSales, totalCashExpenses, expectedCash } = await computeCashSummary(
      shift,
      closedAt,
    );
    const difference = actualCash - expectedCash;

    const updated = await storageService.update<Shift>(DB_TABLES.SHIFTS, shiftId, {
      closedAt,
      closedByCashierId: cashier.id,
      closedByCashierName: cashier.name,
      totalCashSales,
      totalCashExpenses,
      expectedCash,
      actualCash,
      difference,
      notes,
      status: "tutup",
    });
    if (!updated) throw new Error("Gagal menutup shift");
    return updated;
  },
};
