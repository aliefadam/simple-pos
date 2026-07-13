import { v4 as uuid } from "uuid";
import { STORAGE_KEYS, LOW_STOCK_THRESHOLD } from "../constants";
import { storageService } from "./storageService";
import type { Product } from "../types";

export const productService = {
  getAll(): Product[] {
    return storageService
      .getAll<Product>(STORAGE_KEYS.PRODUCTS)
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  getActive(): Product[] {
    return this.getAll().filter((p) => p.active);
  },

  getById(id: string): Product | undefined {
    return storageService.getOne<Product>(STORAGE_KEYS.PRODUCTS, id);
  },

  getLowStock(threshold = LOW_STOCK_THRESHOLD): Product[] {
    return this.getAll().filter((p) => p.active && p.trackStock && p.stock > 0 && p.stock <= threshold);
  },

  getOutOfStock(): Product[] {
    return this.getAll().filter((p) => p.active && p.trackStock && p.stock <= 0);
  },

  create(data: Omit<Product, "id" | "createdAt">): Product {
    const product: Product = { ...data, id: uuid(), createdAt: new Date().toISOString() };
    return storageService.insert(STORAGE_KEYS.PRODUCTS, product);
  },

  update(id: string, patch: Partial<Product>): Product | undefined {
    return storageService.update<Product>(STORAGE_KEYS.PRODUCTS, id, patch);
  },

  remove(id: string): void {
    storageService.remove<Product>(STORAGE_KEYS.PRODUCTS, id);
  },

  adjustStock(id: string, delta: number): Product | undefined {
    const product = this.getById(id);
    if (!product) return undefined;
    if (!product.trackStock) return product;
    const newStock = Math.max(0, product.stock + delta);
    return this.update(id, { stock: newStock });
  },
};
