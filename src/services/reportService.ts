import { transactionService } from "./transactionService";
import { expenseService } from "./expenseService";
import { productService } from "./productService";
import { isSameDay } from "../utils/format";
import type { Transaction } from "../types";

export interface DashboardStats {
  omsetHariIni: number;
  jumlahTransaksiHariIni: number;
  produkTerjualHariIni: number;
  produkHampirHabis: number;
  pengeluaranHariIni: number;
}

export interface DailyPoint {
  label: string;
  date: string;
  omset: number;
  transaksi: number;
}

export interface TopProduct {
  productId: string;
  name: string;
  image: string;
  qty: number;
  total: number;
}

export const reportService = {
  async getDashboardStats(options?: { includeExpenses?: boolean }): Promise<DashboardStats> {
    const todayTx = await transactionService.getToday();
    const omsetHariIni = todayTx.reduce((s, t) => s + t.total, 0);
    const produkTerjualHariIni = todayTx.reduce(
      (s, t) => s + t.items.reduce((si, it) => si + it.qty, 0),
      0
    );
    const produkHampirHabis = (await productService.getLowStock()).length + (await productService.getOutOfStock()).length;
    const pengeluaranHariIni = options?.includeExpenses
      ? (await expenseService.getToday()).reduce((s, e) => s + e.amount, 0)
      : 0;
    return {
      omsetHariIni,
      jumlahTransaksiHariIni: todayTx.length,
      produkTerjualHariIni,
      produkHampirHabis,
      pengeluaranHariIni,
    };
  },

  async getWeeklySales(): Promise<DailyPoint[]> {
    const all = (await transactionService.getAll()).filter((t) => t.status === "selesai");
    const points: DailyPoint[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString();
      const dayTx = all.filter((t) => isSameDay(t.date, iso));
      points.push({
        label: new Intl.DateTimeFormat("id-ID", { weekday: "short" }).format(d),
        date: iso,
        omset: dayTx.reduce((s, t) => s + t.total, 0),
        transaksi: dayTx.length,
      });
    }
    return points;
  },

  async getMonthlySales(monthsBack = 6): Promise<{ label: string; omset: number }[]> {
    const all = (await transactionService.getAll()).filter((t) => t.status === "selesai");
    const points: { label: string; omset: number }[] = [];
    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthTx = all.filter((t) => {
        const td = new Date(t.date);
        return td.getFullYear() === d.getFullYear() && td.getMonth() === d.getMonth();
      });
      points.push({
        label: new Intl.DateTimeFormat("id-ID", { month: "short" }).format(d),
        omset: monthTx.reduce((s, t) => s + t.total, 0),
      });
    }
    return points;
  },

  async getTopProducts(transactions?: Transaction[], limit = 5): Promise<TopProduct[]> {
    const source = transactions ?? (await transactionService.getAll()).filter((t) => t.status === "selesai");
    const map = new Map<string, TopProduct>();
    source.forEach((t) => {
      t.items.forEach((item) => {
        const existing = map.get(item.productId);
        if (existing) {
          existing.qty += item.qty;
          existing.total += item.price * item.qty;
        } else {
          map.set(item.productId, {
            productId: item.productId,
            name: item.name,
            image: item.image,
            qty: item.qty,
            total: item.price * item.qty,
          });
        }
      });
    });
    return Array.from(map.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, limit);
  },

  async getLeastSoldProducts(limit = 5): Promise<TopProduct[]> {
    const all = await this.getTopProducts(undefined, 999);
    const products = await productService.getActive();
    const sold = new Set(all.map((p) => p.productId));
    const unsold: TopProduct[] = products
      .filter((p) => !sold.has(p.id))
      .map((p) => ({ productId: p.id, name: p.name, image: p.image, qty: 0, total: 0 }));
    return [...unsold, ...all.slice().reverse()].slice(0, limit);
  },

  async getProfitSimple(): Promise<{ pendapatan: number; pengeluaran: number; laba: number }> {
    const pendapatan = (await transactionService.getThisMonth()).reduce((s, t) => s + t.total, 0);
    const pengeluaran = (await expenseService.getThisMonth()).reduce((s, e) => s + e.amount, 0);
    return { pendapatan, pengeluaran, laba: pendapatan - pengeluaran };
  },

  async getRecentActivity(limit = 8) {
    const transactions = (await transactionService.getAll()).slice(0, limit);
    return transactions;
  },
};
