import { v4 as uuid } from "uuid";
import { DB_TABLES } from "../constants";
import { storageService } from "./storageService";
import { productService } from "./productService";
import type { StockMovement, StockMovementType, User } from "../types";

export const stockService = {
  async getAll(): Promise<StockMovement[]> {
    return (await storageService
      .getAll<StockMovement>(DB_TABLES.STOCK_MOVEMENTS))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async getByProduct(productId: string): Promise<StockMovement[]> {
    return (await this.getAll()).filter((m) => m.productId === productId);
  },

  async record(
    productId: string,
    type: StockMovementType,
    qty: number,
    reason: string,
    user: User
  ): Promise<StockMovement> {
    const product = await productService.getById(productId);
    if (product && !product.trackStock) {
      throw new Error("Produk ini tidak menggunakan stok");
    }
    const movement: StockMovement = {
      id: uuid(),
      productId,
      productName: product?.name ?? "Produk",
      type,
      qty,
      reason,
      date: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
    };
    await storageService.insert(DB_TABLES.STOCK_MOVEMENTS, movement);
    await productService.adjustStock(productId, qty);
    return movement;
  },

  async stockIn(productId: string, qty: number, reason: string, user: User): Promise<StockMovement> {
    return this.record(productId, "masuk", Math.abs(qty), reason || "Stok masuk", user);
  },

  async adjust(productId: string, qty: number, reason: string, user: User): Promise<StockMovement> {
    return this.record(productId, "penyesuaian", qty, reason, user);
  },
};
