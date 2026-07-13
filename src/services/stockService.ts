import { v4 as uuid } from "uuid";
import { STORAGE_KEYS } from "../constants";
import { storageService } from "./storageService";
import { productService } from "./productService";
import type { StockMovement, StockMovementType, User } from "../types";

export const stockService = {
  getAll(): StockMovement[] {
    return storageService
      .getAll<StockMovement>(STORAGE_KEYS.STOCK_MOVEMENTS)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  getByProduct(productId: string): StockMovement[] {
    return this.getAll().filter((m) => m.productId === productId);
  },

  record(
    productId: string,
    type: StockMovementType,
    qty: number,
    reason: string,
    user: User
  ): StockMovement {
    const product = productService.getById(productId);
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
    storageService.insert(STORAGE_KEYS.STOCK_MOVEMENTS, movement);
    productService.adjustStock(productId, qty);
    return movement;
  },

  stockIn(productId: string, qty: number, reason: string, user: User): StockMovement {
    return this.record(productId, "masuk", Math.abs(qty), reason || "Stok masuk", user);
  },

  adjust(productId: string, qty: number, reason: string, user: User): StockMovement {
    return this.record(productId, "penyesuaian", qty, reason, user);
  },
};
