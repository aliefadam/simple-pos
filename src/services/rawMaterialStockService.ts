import { v4 as uuid } from "uuid";
import { DB_TABLES } from "../constants";
import { storageService } from "./storageService";
import { rawMaterialService } from "./rawMaterialService";
import type { RawMaterialMovement, StockMovementType, User } from "../types";

export const rawMaterialStockService = {
  async getAll(): Promise<RawMaterialMovement[]> {
    return (await storageService
      .getAll<RawMaterialMovement>(DB_TABLES.RAW_MATERIAL_MOVEMENTS))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  async getByRawMaterial(rawMaterialId: string): Promise<RawMaterialMovement[]> {
    return (await this.getAll()).filter((m) => m.rawMaterialId === rawMaterialId);
  },

  async record(
    rawMaterialId: string,
    type: StockMovementType,
    qty: number,
    reason: string,
    user: User
  ): Promise<RawMaterialMovement> {
    const rawMaterial = await rawMaterialService.getById(rawMaterialId);
    const movement: RawMaterialMovement = {
      id: uuid(),
      rawMaterialId,
      rawMaterialName: rawMaterial?.name ?? "Bahan Baku",
      type,
      qty,
      reason,
      date: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
    };
    await storageService.insert(DB_TABLES.RAW_MATERIAL_MOVEMENTS, movement);
    await rawMaterialService.adjustStock(rawMaterialId, qty);
    return movement;
  },

  async stockIn(rawMaterialId: string, qty: number, reason: string, user: User): Promise<RawMaterialMovement> {
    return this.record(rawMaterialId, "masuk", Math.abs(qty), reason || "Stok masuk", user);
  },

  async adjust(rawMaterialId: string, qty: number, reason: string, user: User): Promise<RawMaterialMovement> {
    return this.record(rawMaterialId, "penyesuaian", qty, reason, user);
  },
};
