import { v4 as uuid } from "uuid";
import { DB_TABLES, LOW_STOCK_THRESHOLD } from "../constants";
import { storageService } from "./storageService";
import type { Product } from "../types";

export const productService = {
  async getAll(): Promise<Product[]> {
    return (await storageService
      .getAll<Product>(DB_TABLES.PRODUCTS))
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  async getActive(): Promise<Product[]> {
    return (await this.getAll()).filter((p) => p.active);
  },

  async getById(id: string): Promise<Product | undefined> {
    return storageService.getOne<Product>(DB_TABLES.PRODUCTS, id);
  },

  async getLowStock(threshold = LOW_STOCK_THRESHOLD): Promise<Product[]> {
    return (await this.getAll()).filter((p) => p.active && p.trackStock && p.stock > 0 && p.stock <= threshold);
  },

  async getOutOfStock(): Promise<Product[]> {
    return (await this.getAll()).filter((p) => p.active && p.trackStock && p.stock <= 0);
  },

  async create(data: Omit<Product, "id" | "createdAt">): Promise<Product> {
    const product: Product = { ...data, id: uuid(), createdAt: new Date().toISOString() };
    return storageService.insert(DB_TABLES.PRODUCTS, product);
  },

  async update(id: string, patch: Partial<Product>): Promise<Product | undefined> {
    return storageService.update<Product>(DB_TABLES.PRODUCTS, id, patch);
  },

  async remove(id: string): Promise<void> {
    await storageService.remove(DB_TABLES.PRODUCTS, id);
  },

  async adjustStock(id: string, delta: number): Promise<Product | undefined> {
    const product = await this.getById(id);
    if (!product) return undefined;
    if (!product.trackStock) return product;
    const newStock = Math.max(0, product.stock + delta);
    return this.update(id, { stock: newStock });
  },
};
