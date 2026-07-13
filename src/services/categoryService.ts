import { v4 as uuid } from "uuid";
import { DB_TABLES } from "../constants";
import { storageService } from "./storageService";
import type { Category } from "../types";

export const categoryService = {
  async getAll(): Promise<Category[]> {
    return (await storageService
      .getAll<Category>(DB_TABLES.CATEGORIES))
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  async getActive(): Promise<Category[]> {
    return (await this.getAll()).filter((c) => c.active);
  },

  async create(data: Omit<Category, "id" | "createdAt">): Promise<Category> {
    const category: Category = { ...data, id: uuid(), createdAt: new Date().toISOString() };
    return storageService.insert(DB_TABLES.CATEGORIES, category);
  },

  async update(id: string, patch: Partial<Category>): Promise<Category | undefined> {
    return storageService.update<Category>(DB_TABLES.CATEGORIES, id, patch);
  },

  async remove(id: string): Promise<void> {
    await storageService.remove(DB_TABLES.CATEGORIES, id);
  },
};
