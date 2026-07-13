import { v4 as uuid } from "uuid";
import { STORAGE_KEYS } from "../constants";
import { storageService } from "./storageService";
import type { Category } from "../types";

export const categoryService = {
  getAll(): Category[] {
    return storageService
      .getAll<Category>(STORAGE_KEYS.CATEGORIES)
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  getActive(): Category[] {
    return this.getAll().filter((c) => c.active);
  },

  create(data: Omit<Category, "id" | "createdAt">): Category {
    const category: Category = { ...data, id: uuid(), createdAt: new Date().toISOString() };
    return storageService.insert(STORAGE_KEYS.CATEGORIES, category);
  },

  update(id: string, patch: Partial<Category>): Category | undefined {
    return storageService.update<Category>(STORAGE_KEYS.CATEGORIES, id, patch);
  },

  remove(id: string): void {
    storageService.remove<Category>(STORAGE_KEYS.CATEGORIES, id);
  },
};
