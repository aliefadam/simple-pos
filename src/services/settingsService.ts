import { STORAGE_KEYS } from "../constants";
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
  get(): AppSettings {
    return storageService.getObject<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT);
  },

  update(patch: Partial<AppSettings["businessProfile"]>): AppSettings {
    const current = this.get();
    const updated: AppSettings = {
      ...current,
      businessProfile: { ...current.businessProfile, ...patch },
    };
    storageService.setObject(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },
};

export const backupService = {
  exportJSON(): string {
    const dump = storageService.exportAll(Object.values(STORAGE_KEYS));
    return JSON.stringify(dump, null, 2);
  },

  downloadBackup(): void {
    const json = this.exportJSON();
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
    storageService.importAll(dump);
  },
};
