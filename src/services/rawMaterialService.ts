import { v4 as uuid } from "uuid";
import { DB_TABLES, LOW_STOCK_THRESHOLD } from "../constants";
import { storageService } from "./storageService";
import type { RawMaterial } from "../types";

export const rawMaterialService = {
  async getAll(): Promise<RawMaterial[]> {
    return (await storageService
      .getAll<RawMaterial>(DB_TABLES.RAW_MATERIALS))
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  async getActive(): Promise<RawMaterial[]> {
    return (await this.getAll()).filter((m) => m.active);
  },

  async getById(id: string): Promise<RawMaterial | undefined> {
    return storageService.getOne<RawMaterial>(DB_TABLES.RAW_MATERIALS, id);
  },

  async getLowStock(threshold = LOW_STOCK_THRESHOLD): Promise<RawMaterial[]> {
    return (await this.getAll()).filter((m) => m.active && m.stock > 0 && m.stock <= threshold);
  },

  async getOutOfStock(): Promise<RawMaterial[]> {
    return (await this.getAll()).filter((m) => m.active && m.stock <= 0);
  },

  async create(data: Omit<RawMaterial, "id" | "createdAt">): Promise<RawMaterial> {
    const rawMaterial: RawMaterial = { ...data, id: uuid(), createdAt: new Date().toISOString() };
    return storageService.insert(DB_TABLES.RAW_MATERIALS, rawMaterial);
  },

  async update(id: string, patch: Partial<RawMaterial>): Promise<RawMaterial | undefined> {
    return storageService.update<RawMaterial>(DB_TABLES.RAW_MATERIALS, id, patch);
  },

  async remove(id: string): Promise<void> {
    await storageService.remove(DB_TABLES.RAW_MATERIALS, id);
  },

  async adjustStock(id: string, delta: number): Promise<RawMaterial | undefined> {
    const rawMaterial = await this.getById(id);
    if (!rawMaterial) return undefined;
    const newStock = Math.max(0, rawMaterial.stock + delta);
    return this.update(id, { stock: newStock });
  },
};
