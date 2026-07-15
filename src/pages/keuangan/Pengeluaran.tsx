import { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input, Textarea } from "../../components/ui/Field";
import { SelectDropdown } from "../../components/ui/SelectDropdown";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton, SkeletonRow } from "../../components/ui/Skeleton";
import { Pagination } from "../../components/ui/Pagination";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { RefreshButton } from "../../components/ui/RefreshButton";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { expenseService } from "../../services/expenseService";
import { shiftService } from "../../services/shiftService";
import { EXPENSE_CATEGORIES } from "../../constants";
import {
  formatCurrency,
  formatDate,
  formatDateInput,
} from "../../utils/format";
import type { Expense } from "../../types";

const PAGE_SIZE = 8;
const RESTRICTED_EMPLOYEE_CATEGORIES = [
  "Sewa Tempat",
  "Gaji Karyawan",
  "Listrik & Air",
];

const emptyForm = {
  date: formatDateInput(new Date().toISOString()),
  category: EXPENSE_CATEGORIES[0],
  amount: "",
  note: "",
  receiptImage: "",
  receiptImageName: "",
};

export default function Pengeluaran() {
  const { user, isOwner } = useAuth();
  const confirm = useConfirm();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [totalThisMonth, setTotalThisMonth] = useState(0);
  const [totalToday, setTotalToday] = useState(0);
  const [viewingReceipt, setViewingReceipt] = useState<Expense | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  function visibleTo(list: Expense[]) {
    return isOwner
      ? list
      : list.filter((e) => e.createdByUserId === (user?.id ?? ""));
  }

  async function load() {
    const [allExpenses, monthExpenses, todayExpenses] = await Promise.all([
      expenseService.getAll(),
      expenseService.getThisMonth(),
      expenseService.getToday(),
    ]);
    setExpenses(visibleTo(allExpenses));
    setTotalThisMonth(
      visibleTo(monthExpenses).reduce((s, e) => s + e.amount, 0),
    );
    setTotalToday(visibleTo(todayExpenses).reduce((s, e) => s + e.amount, 0));
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

  const filtered = useMemo(
    () =>
      expenses
        .filter(
          (e) =>
            e.note.toLowerCase().includes(search.toLowerCase()) ||
            e.category.toLowerCase().includes(search.toLowerCase()),
        )
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
    [expenses, search],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const availableCategories = useMemo(
    () =>
      isOwner
        ? EXPENSE_CATEGORIES
        : EXPENSE_CATEGORIES.filter(
            (category) => !RESTRICTED_EMPLOYEE_CATEGORIES.includes(category),
          ),
    [isOwner],
  );

  async function ensureShiftOpenForKaryawan() {
    if (isOwner) return true;
    const open = await shiftService.getOpen();
    if (!open) {
      showToast(
        "warning",
        "Shift belum dibuka",
        "Buka shift di halaman Transaksi Baru sebelum mencatat pengeluaran",
      );
      return false;
    }
    return true;
  }

  async function openCreate() {
    if (!(await ensureShiftOpenForKaryawan())) return;
    setEditing(null);
    setForm({
      ...emptyForm,
      category: availableCategories[0] ?? EXPENSE_CATEGORIES[0],
    });
    setReceiptFile(null);
    setModalOpen(true);
  }

  function openEdit(exp: Expense) {
    if (!isOwner) {
      showToast(
        "warning",
        "Akses dibatasi",
        "Hanya owner yang dapat mengedit pengeluaran",
      );
      return;
    }
    setEditing(exp);
    setForm({
      date: formatDateInput(exp.date),
      category: exp.category,
      amount: String(exp.amount),
      note: exp.note,
      receiptImage: exp.receiptImage ?? "",
      receiptImageName: exp.receiptImageName ?? "",
    });
    setReceiptFile(null);
    setModalOpen(true);
  }

  function handleReceiptChange(file: File | null) {
    setReceiptFile(file);
    if (!file) {
      setForm((f) => ({ ...f, receiptImage: "", receiptImageName: "" }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({
        ...f,
        receiptImage: typeof reader.result === "string" ? reader.result : "",
        receiptImageName: file.name,
      }));
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    if (submitting) return;
    if (!form.amount || !form.note.trim()) {
      showToast("error", "Lengkapi data pengeluaran");
      return;
    }
    if (!editing && !form.receiptImage) {
      showToast("error", "Unggah gambar struk atau nota terlebih dahulu");
      return;
    }
    if (!isOwner && !availableCategories.includes(form.category)) {
      showToast(
        "warning",
        "Kategori dibatasi",
        "Karyawan tidak dapat memilih kategori ini",
      );
      return;
    }
    if (!editing && !(await ensureShiftOpenForKaryawan())) {
      return;
    }

    setSubmitting(true);
    try {
      const uploadedReceipt = receiptFile
        ? await expenseService.uploadReceipt(receiptFile)
        : {
            receiptImage: form.receiptImage,
            receiptImageName: form.receiptImageName,
          };
      const payload = {
        date: new Date(form.date).toISOString(),
        category: form.category,
        amount: Number(form.amount),
        note: form.note,
        createdByUserId: editing?.createdByUserId ?? user?.id ?? "",
        createdBy: user?.name ?? "Owner",
        createdByRole: editing?.createdByRole ?? user?.role ?? "owner",
        receiptImage: uploadedReceipt.receiptImage,
        receiptImageName: uploadedReceipt.receiptImageName,
        createdAt: editing?.createdAt ?? new Date().toISOString(),
      };
      if (editing) {
        if (!isOwner) {
          showToast(
            "warning",
            "Akses dibatasi",
            "Hanya owner yang dapat mengedit pengeluaran",
          );
          return;
        }
        await expenseService.update(editing.id, payload);
        showToast("success", "Pengeluaran diperbarui");
      } else {
        await expenseService.create(payload);
        showToast("success", "Pengeluaran ditambahkan");
      }
      setModalOpen(false);
      setPage(1);
      await load();
    } catch (error) {
      showToast(
        "error",
        "Gagal menyimpan pengeluaran",
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat menyimpan data",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(exp: Expense) {
    if (!isOwner) {
      showToast(
        "warning",
        "Akses dibatasi",
        "Hanya owner yang dapat menghapus pengeluaran",
      );
      return;
    }
    const ok = await confirm({
      title: "Hapus data pengeluaran ini?",
      danger: true,
      confirmLabel: "Ya, Hapus",
    });
    if (!ok) return;
    await expenseService.remove(exp.id);
    await load();
    showToast("success", "Pengeluaran dihapus");
  }

  return (
    <div className="fade-in space-y-5">
      <Breadcrumb items={[{ label: "Keuangan" }, { label: "Pengeluaran" }]} />
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Pengeluaran
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isOwner ? "Total bulan ini" : "Total hari ini"}:{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {formatCurrency(isOwner ? totalThisMonth : totalToday)}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <RefreshButton loading={refreshing} onClick={handleRefresh} />
          <Button icon="fi fi-rr-add" onClick={openCreate}>
            Tambah Pengeluaran
          </Button>
        </div>
      </div>

      <Card>
        <div className="p-5 pb-0">
          <div className="relative">
            <i className="fi fi-rr-search absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari kategori atau keterangan..."
              className="w-full max-w-sm rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
            />
          </div>
        </div>
        <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2 p-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))
          ) : paginated.length === 0 ? (
            <EmptyState
              icon="fi fi-rr-receipt"
              title="Belum ada pengeluaran"
              action={
                <Button size="sm" onClick={openCreate}>
                  Tambah Pengeluaran
                </Button>
              }
            />
          ) : (
            paginated.map((exp) => (
              <div key={exp.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Badge tone="indigo">{exp.category}</Badge>
                    <p className="mt-1 text-xs text-slate-400">{formatDate(exp.date)}</p>
                  </div>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(exp.amount)}</span>
                </div>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{exp.note}</p>
                <div className="mt-3 flex items-center gap-1">
                  {exp.receiptImage && (
                    <button
                      onClick={() => setViewingReceipt(exp)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                      title="Lihat struk/nota"
                    >
                      <i className="fi fi-rr-picture text-sm" />
                    </button>
                  )}
                  {isOwner && (
                    <>
                      <button
                        onClick={() => openEdit(exp)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                      >
                        <i className="fi fi-rr-edit text-sm" />
                      </button>
                      <button
                        onClick={() => handleDelete(exp)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                      >
                        <i className="fi fi-rr-trash text-sm" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-3 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-y border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-800">
                <th className="px-5 py-3">Tanggal</th>
                <th className="px-5 py-3">Kategori</th>
                <th className="px-5 py-3">Nominal</th>
                <th className="px-5 py-3">Keterangan</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} cols={5} />
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <EmptyState
                      icon="fi fi-rr-receipt"
                      title="Belum ada pengeluaran"
                      action={
                        <Button size="sm" onClick={openCreate}>
                          Tambah Pengeluaran
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                paginated.map((exp) => (
                  <tr
                    key={exp.id}
                    className="border-b border-slate-50 transition hover:bg-slate-50/60 dark:border-slate-800/60 dark:hover:bg-slate-800/30"
                  >
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                      {formatDate(exp.date)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone="indigo">{exp.category}</Badge>
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-700 dark:text-slate-200">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                      {exp.note}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {exp.receiptImage && (
                          <button
                            onClick={() => setViewingReceipt(exp)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                            title="Lihat struk/nota"
                          >
                            <i className="fi fi-rr-picture text-sm" />
                          </button>
                        )}
                        {isOwner && (
                          <>
                            <button
                              onClick={() => openEdit(exp)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                            >
                              <i className="fi fi-rr-edit text-sm" />
                            </button>
                            <button
                              onClick={() => handleDelete(exp)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                            >
                              <i className="fi fi-rr-trash text-sm" />
                            </button>
                          </>
                        )}
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
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Pengeluaran" : "Tambah Pengeluaran"}
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Batal
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              {editing ? "Simpan" : "Tambah"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Tanggal"
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
          <SelectDropdown
            label="Kategori"
            value={form.category}
            onChange={(category) => setForm((f) => ({ ...f, category }))}
            options={availableCategories.map((c) => ({ value: c, label: c }))}
          />
          <Input
            label="Nominal (Rp)"
            type="number"
            required
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            placeholder=""
          />
          <Textarea
            label="Keterangan"
            required
            value={form.note}
            onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
            placeholder=""
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
              Gambar Struk / Nota{" "}
              {!editing && <span className="text-red-500">*</span>}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleReceiptChange(e.target.files?.[0] ?? null)}
              className="block w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-indigo-600 hover:file:bg-indigo-100 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:file:bg-indigo-500/10 dark:file:text-indigo-300"
            />
            {form.receiptImageName && (
              <p className="text-xs text-slate-400">
                File terpilih: {form.receiptImageName}
              </p>
            )}
            {form.receiptImage && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900/40">
                <img
                  src={form.receiptImage}
                  alt="Preview struk atau nota"
                  className="max-h-72 w-full object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={!!viewingReceipt}
        onClose={() => setViewingReceipt(null)}
        title="Struk / Nota"
        size="md"
      >
        {viewingReceipt && (
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900/40">
              <img
                src={viewingReceipt.receiptImage}
                alt="Struk atau nota"
                className="max-h-[65vh] w-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">
                {viewingReceipt.category} &middot; {formatDate(viewingReceipt.date)}
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {formatCurrency(viewingReceipt.amount)}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
