import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton, SkeletonRow } from "../../components/ui/Skeleton";
import { Pagination } from "../../components/ui/Pagination";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { RefreshButton } from "../../components/ui/RefreshButton";
import { shiftService } from "../../services/shiftService";
import { formatCurrency, formatDate } from "../../utils/format";
import { cn } from "../../utils/cn";
import type { Shift } from "../../types";

const PAGE_SIZE = 8;

export default function RiwayatShift() {
  const [loading, setLoading] = useState(true);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<Shift | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setShifts(await shiftService.getAll());
  }

  useEffect(() => {
    let active = true;
    const t = setTimeout(async () => {
      if (!active) return;
      await load();
      if (active) setLoading(false);
    }, 300);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    setLoading(true);
    try {
      await load();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(shifts.length / PAGE_SIZE));
  const paginated = shifts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function differenceTone(shift: Shift) {
    if (shift.status === "buka") return "amber";
    const diff = shift.difference ?? 0;
    if (diff === 0) return "green";
    return diff > 0 ? "blue" : "red";
  }

  function differenceLabel(shift: Shift) {
    if (shift.status === "buka") return "Sedang berjalan";
    const diff = shift.difference ?? 0;
    if (diff === 0) return "Sesuai";
    return `${diff > 0 ? "Lebih" : "Kurang"} ${formatCurrency(Math.abs(diff))}`;
  }

  const HERO_TONE_CLASSES: Record<string, string> = {
    green: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    red: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  };

  return (
    <div className="fade-in space-y-5">
      <Breadcrumb items={[{ label: "Kasir" }, { label: "Riwayat Shift" }]} />
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Riwayat Shift
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Rekonsiliasi kas setiap buka/tutup shift.
          </p>
        </div>
        <RefreshButton loading={refreshing} onClick={handleRefresh} />
      </div>

      <Card>
        <div className="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2 p-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))
          ) : paginated.length === 0 ? (
            <EmptyState
              icon="fi fi-rr-cash-register"
              title="Belum ada riwayat shift"
            />
          ) : (
            paginated.map((shift) => (
              <div key={shift.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-700 dark:text-slate-200">
                      {shift.cashierName}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDate(shift.openedAt, true)}
                    </p>
                  </div>
                  <Badge tone={differenceTone(shift)}>
                    {differenceLabel(shift)}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    Modal Awal
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {formatCurrency(shift.openingCash)}
                  </span>
                </div>
                <button
                  onClick={() => setDetail(shift)}
                  className="mt-3 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  Lihat detail
                </button>
              </div>
            ))
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-y border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-800">
                <th className="px-5 py-3">Dibuka</th>
                <th className="px-5 py-3">Ditutup</th>
                <th className="px-5 py-3">Kasir</th>
                <th className="px-5 py-3">Modal Awal</th>
                <th className="px-5 py-3">Selisih</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} cols={6} />
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon="fi fi-rr-cash-register"
                      title="Belum ada riwayat shift"
                    />
                  </td>
                </tr>
              ) : (
                paginated.map((shift) => (
                  <tr
                    key={shift.id}
                    className="border-b border-slate-50 transition hover:bg-slate-50/60 dark:border-slate-800/60 dark:hover:bg-slate-800/30"
                  >
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                      {formatDate(shift.openedAt, true)}
                    </td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                      {shift.closedAt ? formatDate(shift.closedAt, true) : "-"}
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-700 dark:text-slate-200">
                        {shift.cashierName}
                      </p>
                      {shift.closedByCashierName &&
                        shift.closedByCashierName !== shift.cashierName && (
                          <p className="text-xs text-slate-400">
                            Ditutup oleh {shift.closedByCashierName}
                          </p>
                        )}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-200">
                      {formatCurrency(shift.openingCash)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={differenceTone(shift)}>
                        {differenceLabel(shift)}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDetail(shift)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                          title="Detail"
                        >
                          <i className="fi fi-rr-eye text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          totalItems={shifts.length}
          pageSize={PAGE_SIZE}
        />
      </Card>

      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title="Detail Shift"
        size="sm"
      >
        {detail && (
          <div className="space-y-4">
            <div className="space-y-1.5 text-sm">
              <p className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <i className="fi fi-rr-calendar-clock text-slate-400" />
                {formatDate(detail.openedAt, true)}
                {detail.closedAt && ` – ${formatDate(detail.closedAt, true)}`}
              </p>
              <p className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <i className="fi fi-rr-user text-slate-400" />
                {detail.cashierName}
                {detail.closedByCashierName &&
                  detail.closedByCashierName !== detail.cashierName &&
                  ` · ditutup oleh ${detail.closedByCashierName}`}
              </p>
            </div>

            {detail.status === "buka" ? (
              <div className={cn("rounded-2xl p-5 text-center", HERO_TONE_CLASSES.amber)}>
                <p className="text-xs font-semibold uppercase tracking-wide">
                  Status
                </p>
                <p className="mt-1 text-xl font-bold">Sedang Berjalan</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Modal awal {formatCurrency(detail.openingCash)}
                </p>
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    "rounded-2xl p-5 text-center",
                    HERO_TONE_CLASSES[differenceTone(detail)],
                  )}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide">
                    Selisih Kas
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {differenceLabel(detail)}
                  </p>
                </div>

                <div className="space-y-2 rounded-xl border border-slate-100 p-3 text-sm dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">
                      Modal Awal
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {formatCurrency(detail.openingCash)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">
                      Penjualan Tunai
                    </span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      + {formatCurrency(detail.totalCashSales ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">
                      Pengeluaran Tunai
                    </span>
                    <span className="font-medium text-red-500">
                      {(detail.totalCashExpenses ?? 0) > 0
                        ? `- ${formatCurrency(detail.totalCashExpenses ?? 0)}`
                        : formatCurrency(0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-2 dark:border-slate-700">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      Uang Sistem
                    </span>
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {formatCurrency(detail.expectedCash ?? 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">
                      Uang Fisik di Laci
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {formatCurrency(detail.actualCash ?? 0)}
                    </span>
                  </div>
                </div>
              </>
            )}

            {detail.notes && (
              <div>
                <p className="text-xs text-slate-400">Catatan</p>
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  {detail.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
