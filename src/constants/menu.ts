import type { Role } from "../types";

export interface MenuItem {
  label: string;
  to?: string;
  icon: string;
  roles?: Role[];
  children?: { label: string; to: string; icon: string; roles?: Role[] }[];
}

export const MENU: MenuItem[] = [
  { label: "Dashboard", to: "/", icon: "fi fi-rr-apps" },
  {
    label: "Kasir",
    icon: "fi fi-rr-shopping-cart-check",
    children: [
      {
        label: "Transaksi Baru",
        to: "/kasir/transaksi-baru",
        icon: "fi-rr-cash-register",
      },
      {
        label: "Riwayat Transaksi",
        to: "/kasir/riwayat",
        icon: "fi fi-rr-time-past",
      },
      {
        label: "Riwayat Shift",
        to: "/kasir/riwayat-shift",
        icon: "fi fi-rr-time-check",
        roles: ["owner"],
      },
    ],
  },
  {
    label: "Master Data",
    icon: "fi fi-rr-database",
    roles: ["owner"],
    children: [
      {
        label: "Kategori",
        to: "/master/kategori",
        icon: "fi fi-rr-apps-add",
        roles: ["owner"],
      },
      {
        label: "Produk",
        to: "/master/produk",
        icon: "fi fi-rr-box",
        roles: ["owner"],
      },
      {
        label: "Stok",
        to: "/master/stok",
        icon: "fi fi-rr-boxes",
        roles: ["owner"],
      },
    ],
  },
  {
    label: "Keuangan",
    icon: "fi fi-rr-wallet",
    children: [
      {
        label: "Pengeluaran",
        to: "/keuangan/pengeluaran",
        icon: "fi fi-rr-receipt",
      },
      {
        label: "Laporan",
        to: "/keuangan/laporan",
        icon: "fi fi-rr-chart-histogram",
        roles: ["owner"],
      },
    ],
  },
  {
    label: "Pengaturan",
    icon: "fi fi-rr-settings",
    children: [
      {
        label: "User",
        to: "/pengaturan/user",
        icon: "fi fi-rr-users",
        roles: ["owner"],
      },
      {
        label: "Profil Usaha",
        to: "/pengaturan/profil",
        icon: "fi fi-rr-building",
        roles: ["owner"],
      },
      {
        label: "Tema & Data",
        to: "/pengaturan/tema",
        icon: "fi fi-rr-palette",
      },
    ],
  },
];
