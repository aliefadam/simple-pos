import { v4 as uuid } from "uuid";
import { DB_TABLES, SUPABASE_BUCKETS } from "../constants";
import { storageService } from "./storageService";
import { isSameMonth } from "../utils/format";
import { isWithinCurrentBusinessDay } from "../utils/businessTime";
import type { Expense } from "../types";
import { requireSupabase } from "../lib/supabase";

export const expenseService = {
  async getAll(): Promise<Expense[]> {
    return (await storageService
      .getAll<Expense>(DB_TABLES.EXPENSES))
      .sort((a, b) => {
        const byDate = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (byDate !== 0) return byDate;
        return new Date(b.createdAt ?? b.date).getTime() - new Date(a.createdAt ?? a.date).getTime();
      });
  },

  async getToday(): Promise<Expense[]> {
    const now = new Date();
    return (await this.getAll()).filter((e) =>
      isWithinCurrentBusinessDay(e.date, now),
    );
  },

  async getThisMonth(): Promise<Expense[]> {
    const now = new Date().toISOString();
    return (await this.getAll()).filter((e) => isSameMonth(e.date, now));
  },

  async create(data: Omit<Expense, "id">): Promise<Expense> {
    const expense: Expense = {
      ...data,
      id: uuid(),
      createdAt: data.createdAt ?? new Date().toISOString(),
    };
    return storageService.insert(DB_TABLES.EXPENSES, expense);
  },

  async update(id: string, patch: Partial<Expense>): Promise<Expense | undefined> {
    return storageService.update<Expense>(DB_TABLES.EXPENSES, id, patch);
  },

  async remove(id: string): Promise<void> {
    await storageService.remove(DB_TABLES.EXPENSES, id);
  },

  async uploadReceipt(file: File): Promise<{ receiptImage: string; receiptImageName: string }> {
    const client = requireSupabase();
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `expenses/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error } = await client.storage
      .from(import.meta.env.VITE_SUPABASE_STORAGE_BUCKET_EXPENSE_RECEIPTS || SUPABASE_BUCKETS.EXPENSE_RECEIPTS)
      .upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: true,
      });
    if (error) throw new Error(error.message);
    const { data } = client.storage
      .from(import.meta.env.VITE_SUPABASE_STORAGE_BUCKET_EXPENSE_RECEIPTS || SUPABASE_BUCKETS.EXPENSE_RECEIPTS)
      .getPublicUrl(path);
    return {
      receiptImage: data.publicUrl,
      receiptImageName: file.name,
    };
  },
};
