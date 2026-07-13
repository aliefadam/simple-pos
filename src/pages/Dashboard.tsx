import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { ProductAvatar } from "../components/ProductAvatar";
import {
  reportService,
  type DashboardStats,
  type DailyPoint,
  type TopProduct,
} from "../services/reportService";
import {
  databaseStatusService,
  type DatabaseStatus,
} from "../services/databaseStatusService";
import { productService } from "../services/productService";
import { transactionService } from "../services/transactionService";
import { formatCurrency, formatNumber, timeAgo } from "../utils/format";
import { useAuth } from "../context/AuthContext";
import type { Product, Transaction } from "../types";

const statConfig = [
  {
    key: "omsetHariIni",
    label: "Omset Hari Ini",
    icon: "fi fi-rr-money-bill-wave",
    tone: "indigo",
    format: "currency",
  },
  {
    key: "jumlahTransaksiHariIni",
    label: "Jumlah Transaksi",
    icon: "fi fi-rr-receipt",
    tone: "blue",
    format: "number",
  },
  {
    key: "produkTerjualHariIni",
    label: "Produk Terjual",
    icon: "fi fi-rr-shopping-bag",
    tone: "green",
    format: "number",
  },
  {
    key: "produkHampirHabis",
    label: "Produk Hampir Habis",
    icon: "fi fi-rr-triangle-warning",
    tone: "amber",
    format: "number",
  },
  {
    key: "pengeluaranHariIni",
    label: "Pengeluaran Hari Ini",
    icon: "fi fi-rr-wallet",
    tone: "red",
    format: "currency",
  },
] as const;

const TONE_CLASSES: Record<string, string> = {
  indigo:
    "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
  blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
  green:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  red: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

export default function Dashboard() {
  const { user, isOwner } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [weekly, setWeekly] = useState<DailyPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus | null>(
    null,
  );

  useEffect(() => {
    let active = true;

    const timer = setTimeout(async () => {
      const [
        dashboardStats,
        weeklySales,
        top,
        low,
        out,
        recentActivity,
        dbStatus,
      ] = await Promise.all([
        reportService.getDashboardStats(),
        reportService.getWeeklySales(),
        reportService.getTopProducts(undefined, 5),
        productService.getLowStock(),
        productService.getOutOfStock(),
        isOwner
          ? reportService.getRecentActivity(6)
          : transactionService.getByCashier(user?.id ?? ""),
        isOwner ? databaseStatusService.check() : Promise.resolve(null),
      ]);

      if (!active) return;

      setStats(dashboardStats);
      setWeekly(weeklySales);
      setTopProducts(top);
      setLowStock([...low, ...out].slice(0, 5));
      setRecent(recentActivity.slice(0, 6));
      setDatabaseStatus(dbStatus);
      setLoading(false);
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [isOwner, user?.id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Halo, {user?.name?.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Berikut ringkasan performa usaha Anda hari ini.
          </p>
        </div>
        <Link
          to="/kasir/transaksi-baru"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm shadow-indigo-600/20 transition-all duration-200 hover:bg-indigo-700 active:scale-95"
        >
          <i className="fi fi-rr-add text-sm" />
          Transaksi Baru
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-5">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <Skeleton className="mt-4 h-6 w-24" />
                <Skeleton className="mt-2 h-3 w-32" />
              </Card>
            ))
          : statConfig.map((s, idx) => {
              const value = stats?.[s.key as keyof DashboardStats] ?? 0;
              return (
                <Card
                  key={s.key}
                  className="slide-up p-5 transition-transform duration-200 hover:-translate-y-0.5"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${TONE_CLASSES[s.tone]}`}
                  >
                    <i className={`${s.icon} text-base`} />
                  </div>
                  <p className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
                    {s.format === "currency"
                      ? formatCurrency(value)
                      : formatNumber(value)}
                  </p>
                  <p className="mt-1 text-xs font-medium text-slate-400">
                    {s.label}
                  </p>
                </Card>
              );
            })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="slide-up xl:col-span-2">
          <CardHeader>
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
                Grafik Penjualan Mingguan
              </h3>
              <p className="text-xs text-slate-400">Omset 7 hari terakhir</p>
            </div>
            <Badge tone="green">
              <i className="fi fi-rr-chart-line-up" /> Live
            </Badge>
          </CardHeader>
          <CardBody>
            {loading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart
                  data={weekly}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorOmset" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#6366f1"
                        stopOpacity={0.35}
                      />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94a3b8" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      fontSize: 12,
                    }}
                    formatter={(value) => [
                      formatCurrency(Number(value)),
                      "Omset",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="omset"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#colorOmset)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardBody>
        </Card>

        <Card className="slide-up">
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
              Produk Terlaris
            </h3>
          </CardHeader>
          <CardBody className="space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))
            ) : topProducts.length === 0 ? (
              <EmptyState
                icon="fi fi-rr-chart-pie"
                title="Belum ada penjualan"
              />
            ) : (
              topProducts.map((product, idx) => (
                <div
                  key={product.productId}
                  className="flex items-center gap-3"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {idx + 1}
                  </span>
                  <ProductAvatar
                    name={product.name}
                    className="h-10 w-10 shrink-0 rounded-lg"
                    textClassName="text-xs"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                      {product.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {product.qty} terjual
                    </p>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-300">
                    {formatCurrency(product.total)}
                  </p>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="slide-up xl:col-span-2">
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
              Aktivitas Terbaru
            </h3>
          </CardHeader>
          <CardBody className="space-y-1">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))
            ) : recent.length === 0 ? (
              <EmptyState
                icon="fi fi-rr-time-past"
                title="Belum ada aktivitas"
              />
            ) : (
              recent.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 border-b border-slate-50 py-3 last:border-0 dark:border-slate-800/60"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                    <i className="fi fi-rr-receipt text-sm" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {tx.code} - {tx.cashierName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {timeAgo(tx.date)} - {tx.items.length} item
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {formatCurrency(tx.total)}
                    </p>
                    <Badge
                      tone={
                        tx.status === "selesai"
                          ? "green"
                          : tx.status === "ditahan"
                            ? "amber"
                            : "red"
                      }
                    >
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardBody>
        </Card>

        <Card className="slide-up">
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
              Stok Perlu Perhatian
            </h3>
          </CardHeader>
          <CardBody className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))
            ) : lowStock.length === 0 ? (
              <EmptyState icon="fi fi-rr-box-check" title="Semua stok aman" />
            ) : (
              lowStock.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2.5">
                    <ProductAvatar
                      name={product.name}
                      className="h-9 w-9 rounded-lg"
                      textClassName="text-[11px]"
                    />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {product.name}
                    </p>
                  </div>
                  <Badge tone={product.stock === 0 ? "red" : "amber"}>
                    {product.stock === 0 ? "Habis" : `${product.stock} pcs`}
                  </Badge>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
