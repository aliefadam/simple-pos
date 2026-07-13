import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton } from "../../components/ui/Skeleton";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { useToast } from "../../context/ToastContext";
import { reportService, type TopProduct } from "../../services/reportService";
import { transactionService } from "../../services/transactionService";
import { formatCurrency, formatNumber } from "../../utils/format";

export default function Laporan() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [monthly, setMonthly] = useState<{ label: string; omset: number }[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [leastSold, setLeastSold] = useState<TopProduct[]>([]);
  const [profit, setProfit] = useState({ pendapatan: 0, pengeluaran: 0, laba: 0 });
  const [todayStats, setTodayStats] = useState({ omset: 0, transaksi: 0, produkTerjual: 0 });

  useEffect(() => {
    let active = true;
    const t = setTimeout(async () => {
      const [monthlySales, top, least, profitSummary, todayTx] = await Promise.all([
        reportService.getMonthlySales(),
        reportService.getTopProducts(undefined, 6),
        reportService.getLeastSoldProducts(6),
        reportService.getProfitSimple(),
        transactionService.getToday(),
      ]);
      if (!active) return;
      setMonthly(monthlySales);
      setTopProducts(top);
      setLeastSold(least);
      setProfit(profitSummary);
      setTodayStats({
        omset: todayTx.reduce((s, t) => s + t.total, 0),
        transaksi: todayTx.length,
        produkTerjual: todayTx.reduce((s, t) => s + t.items.reduce((si, it) => si + it.qty, 0), 0),
      });
      setLoading(false);
    }, 400);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, []);

  function exportExcel() {
    const rows = [["Bulan", "Omset"], ...monthly.map((m) => [m.label, String(m.omset)])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "laporan-penjualan.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("success", "Laporan diekspor", "File CSV/Excel berhasil diunduh");
  }

  function exportPDF() {
    showToast("info", "Menyiapkan PDF", "Gunakan dialog print untuk simpan sebagai PDF");
    setTimeout(() => window.print(), 400);
  }

  return (
    <div className="fade-in space-y-5">
      <Breadcrumb items={[{ label: "Keuangan" }, { label: "Laporan" }]} />
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Laporan Usaha</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Ringkasan penjualan, produk, dan laba sederhana.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon="fi fi-rr-file-spreadsheet" onClick={exportExcel}>Export Excel</Button>
          <Button variant="outline" icon="fi fi-rr-file-pdf" onClick={exportPDF}>Export PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-medium text-slate-400">Omset Hari Ini</p>
          {loading ? <Skeleton className="mt-2 h-7 w-28" /> : <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(todayStats.omset)}</p>}
          <p className="mt-1 text-xs text-slate-400">{todayStats.transaksi} transaksi · {todayStats.produkTerjual} produk terjual</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium text-slate-400">Pendapatan Bulan Ini</p>
          {loading ? <Skeleton className="mt-2 h-7 w-28" /> : <p className="mt-1 text-2xl font-bold text-emerald-600">{formatCurrency(profit.pendapatan)}</p>}
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium text-slate-400">Laba Sederhana (Penjualan - Pengeluaran)</p>
          {loading ? (
            <Skeleton className="mt-2 h-7 w-28" />
          ) : (
            <p className={`mt-1 text-2xl font-bold ${profit.laba >= 0 ? "text-indigo-600" : "text-red-500"}`}>
              {formatCurrency(profit.laba)}
            </p>
          )}
          <p className="mt-1 text-xs text-slate-400">Pengeluaran: {formatCurrency(profit.pengeluaran)}</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Penjualan Bulanan (6 Bulan Terakhir)</h3>
        </CardHeader>
        <CardBody>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthly} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Omset"]} contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
                <Bar dataKey="omset" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Produk Terlaris</h3>
            <Badge tone="green">Top {topProducts.length}</Badge>
          </CardHeader>
          <CardBody className="space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
            ) : topProducts.length === 0 ? (
              <EmptyState icon="fi fi-rr-chart-pie" title="Belum ada data" />
            ) : (
              topProducts.map((p, idx) => (
                <div key={p.productId} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-600 dark:bg-emerald-500/10">
                      {idx + 1}
                    </span>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.name}</p>
                  </div>
                  <p className="text-xs text-slate-400">{formatNumber(p.qty)} pcs</p>
                </div>
              ))
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Produk Kurang Laku</h3>
            <Badge tone="amber">Perhatian</Badge>
          </CardHeader>
          <CardBody className="space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
            ) : leastSold.length === 0 ? (
              <EmptyState icon="fi fi-rr-chart-pie" title="Belum ada data" />
            ) : (
              leastSold.map((p) => (
                <div key={p.productId} className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{p.name}</p>
                  <p className="text-xs text-slate-400">{formatNumber(p.qty)} pcs terjual</p>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
