import { DB_TABLES, SETTINGS_ROW_ID } from "../constants";
import { storageService } from "./storageService";
import type { AppSettings } from "../types";

const DEFAULT: AppSettings = {
  businessProfile: {
    name: "Usaha Saya",
    address: "-",
    phone: "-",
    footerNote: "Terima kasih atas kunjungan Anda",
  },
};

export const settingsService = {
  async get(): Promise<AppSettings> {
    return storageService.getObject<AppSettings>(DB_TABLES.SETTINGS, SETTINGS_ROW_ID, DEFAULT);
  },

  async update(patch: Partial<AppSettings["businessProfile"]>): Promise<AppSettings> {
    const current = await this.get();
    const updated: AppSettings = {
      ...current,
      businessProfile: { ...current.businessProfile, ...patch },
    };
    return storageService.setObject(DB_TABLES.SETTINGS, SETTINGS_ROW_ID, updated);
  },
};

export const backupService = {
  async exportJSON(): Promise<string> {
    const dump = await storageService.exportAll(Object.values(DB_TABLES));
    return JSON.stringify(dump, null, 2);
  },

  async downloadBackup(): Promise<void> {
    const json = await this.exportJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `pos-backup-${stamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  async restoreFromFile(file: File): Promise<void> {
    const text = await file.text();
    const dump = JSON.parse(text) as Record<string, unknown>;
    await storageService.importAll(dump);
  },
};
