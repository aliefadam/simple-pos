import { useEffect, useMemo, useState } from "react";
import { Card, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton, SkeletonRow } from "../../components/ui/Skeleton";
import { Pagination } from "../../components/ui/Pagination";
import { Modal } from "../../components/ui/Modal";
import { RefreshButton } from "../../components/ui/RefreshButton";
import { ReceiptModal } from "../../components/ReceiptModal";
import { ProductAvatar } from "../../components/ProductAvatar";
import { useAuth } from "../../context/AuthContext";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { transactionService } from "../../services/transactionService";
import { formatCurrency, formatDate } from "../../utils/format";
import { PAYMENT_METHODS } from "../../constants";
import type { Transaction } from "../../types";

const PAGE_SIZE = 8;

export default function RiwayatTransaksi() {
  const { user, isOwner } = useAuth();
  const confirm = useConfirm();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<Transaction | null>(null);
  const [receipt, setReceipt] = useState<Transaction | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    const all = isOwner ? await transactionService.getAll() : await transactionService.getByCashier(user?.id ?? "");
    setTransactions(all);
  }

  useEffect(() => {
    let active = true;
    const t = setTimeout(async () => {
      if (!active) return;
      await loadData();
      if (active) setLoading(false);
    }, 350);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    setLoading(true);
    try {
      await loadData();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const matchSearch =
        t.code.toLowerCase().includes(search.toLowerCase()) ||
        t.cashierName.toLowerCase().includes(search.toLowerCase());
      const matchDate = !dateFilter || t.date.slice(0, 10) === dateFilter;
      const matchStatus = statusFilter === "all" || t.status === statusFilter;
      return matchSearch && matchDate && matchStatus;
    });
  }, [transactions, search, dateFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleCancel(tx: Transaction) {
    if (!user) return;
    const ok = await confirm({
      title: "Batalkan transaksi?",
      message: `Transaksi ${tx.code} akan dibatalkan. Tindakan ini hanya bisa dilakukan Owner.`,
      danger: true,
      confirmLabel: "Ya, Batalkan",
    });
    if (!ok) return;
    await transactionService.cancel(tx.id, user);
    await loadData();
    showToast("success", "Transaksi dibatalkan");
  }

  function paymentLabel(value: string) {
    return PAYMENT_METHODS.find((p) => p.value === value)?.label ?? value;
  }

  return (
    <div className="fade-in space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Riwayat Transaksi</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isOwner ? "Seluruh transaksi kasir." : "Transaksi yang Anda proses."}
          </p>
        </div>
        <RefreshButton loading={refreshing} onClick={handleRefresh} />
      </div>

      <Card>
        <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <i className="fi fi-rr-search absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari no. transaksi atau kasir..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
            />
          </div>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => {
              setDateFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
          >
            <option value="all">Semua Status</option>
            <option value="selesai">Selesai</option>
            <option value="ditahan">Ditahan</option>
            <option value="dibatalkan">Dibatalkan</option>
          </select>
        </CardBody>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2 p-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))
          ) : paginated.length === 0 ? (
            <EmptyState icon="fi fi-rr-receipt" title="Belum ada transaksi" description="Transaksi akan muncul di sini" />
          ) : (
            paginated.map((tx) => (
              <div key={tx.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-200">{tx.code}</p>
                    <p className="text-xs text-slate-400">{formatDate(tx.date, true)}</p>
                  </div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(tx.total)}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone={tx.status === "selesai" ? "green" : tx.status === "ditahan" ? "amber" : "red"}>
                    {tx.status}
                  </Badge>
                  <span className="text-xs text-slate-400">{tx.cashierName} &middot; {paymentLabel(tx.paymentMethod)}</span>
                </div>
                <div className="mt-3 flex items-center gap-1">
                  <button
                    onClick={() => setDetail(tx)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                    title="Detail"
                  >
                    <i className="fi fi-rr-eye text-sm" />
                  </button>
                  <button
                    onClick={() => setReceipt(tx)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                    title="Cetak ulang struk"
                  >
                    <i className="fi fi-rr-print text-sm" />
                  </button>
                  {isOwner && tx.status === "selesai" && (
                    <button
                      onClick={() => handleCancel(tx)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                      title="Batalkan"
                    >
                      <i className="fi fi-rr-cross-circle text-sm" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-y border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-800">
                <th className="px-5 py-3">No. Transaksi</th>
                <th className="px-5 py-3">Tanggal</th>
                <th className="px-5 py-3">Kasir</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Metode</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={7} />)
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState icon="fi fi-rr-receipt" title="Belum ada transaksi" description="Transaksi akan muncul di sini" />
                  </td>
                </tr>
              ) : (
                paginated.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-50 transition hover:bg-slate-50/60 dark:border-slate-800/60 dark:hover:bg-slate-800/30">
                    <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-200">{tx.code}</td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{formatDate(tx.date, true)}</td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{tx.cashierName}</td>
                    <td className="px-5 py-3 font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(tx.total)}</td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{paymentLabel(tx.paymentMethod)}</td>
                    <td className="px-5 py-3">
                      <Badge tone={tx.status === "selesai" ? "green" : tx.status === "ditahan" ? "amber" : "red"}>
                        {tx.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDetail(tx)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                          title="Detail"
                        >
                          <i className="fi fi-rr-eye text-sm" />
                        </button>
                        <button
                          onClick={() => setReceipt(tx)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                          title="Cetak ulang struk"
                        >
                          <i className="fi fi-rr-print text-sm" />
                        </button>
                        {isOwner && tx.status === "selesai" && (
                          <button
                            onClick={() => handleCancel(tx)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                            title="Batalkan"
                          >
                            <i className="fi fi-rr-cross-circle text-sm" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
      </Card>

      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Detail Transaksi ${detail?.code ?? ""}`} size="md">
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-400">Tanggal</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{formatDate(detail.date, true)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Kasir</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{detail.cashierName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Metode</p>
                <p className="font-medium text-slate-700 dark:text-slate-200">{paymentLabel(detail.paymentMethod)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Status</p>
                <Badge tone={detail.status === "selesai" ? "green" : detail.status === "ditahan" ? "amber" : "red"}>
                  {detail.status}
                </Badge>
              </div>
            </div>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 dark:divide-slate-800 dark:border-slate-800">
              {detail.items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 p-3">
                  <ProductAvatar
                    name={item.name}
                    className="h-10 w-10 rounded-lg"
                    textClassName="text-xs"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.name}</p>
                    <p className="text-xs text-slate-400">{item.qty} x {formatCurrency(item.price)}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(item.price * item.qty)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t border-dashed border-slate-200 pt-3 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Subtotal</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(detail.subtotal ?? detail.total - (detail.extraCharge ?? 0))}
                </span>
              </div>
              {(detail.extraCharge ?? 0) > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500">Biaya tambahan</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(detail.extraCharge ?? 0)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Total</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(detail.total)}</span>
              </div>
            </div>
            <Button className="w-full" icon="fi fi-rr-print" onClick={() => setReceipt(detail)}>
              Cetak Ulang Struk
            </Button>
          </div>
        )}
      </Modal>

      <ReceiptModal open={!!receipt} onClose={() => setReceipt(null)} transaction={receipt} />
    </div>
  );
}
