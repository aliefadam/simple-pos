import { v4 as uuid } from "uuid";
import { STORAGE_KEYS } from "../constants";
import { storageService } from "./storageService";
import { isSameDay, isSameMonth } from "../utils/format";
import type { Expense } from "../types";

export const expenseService = {
  getAll(): Expense[] {
    return storageService
      .getAll<Expense>(STORAGE_KEYS.EXPENSES)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getToday(): Expense[] {
    const now = new Date().toISOString();
    return this.getAll().filter((e) => isSameDay(e.date, now));
  },

  getThisMonth(): Expense[] {
    const now = new Date().toISOString();
    return this.getAll().filter((e) => isSameMonth(e.date, now));
  },

  create(data: Omit<Expense, "id">): Expense {
    const expense: Expense = { ...data, id: uuid() };
    return storageService.insert(STORAGE_KEYS.EXPENSES, expense);
  },

  update(id: string, patch: Partial<Expense>): Expense | undefined {
    return storageService.update<Expense>(STORAGE_KEYS.EXPENSES, id, patch);
  },

  remove(id: string): void {
    storageService.remove<Expense>(STORAGE_KEYS.EXPENSES, id);
  },
};
