import { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Field";
import { SelectDropdown } from "../../components/ui/SelectDropdown";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton, SkeletonRow } from "../../components/ui/Skeleton";
import { Pagination } from "../../components/ui/Pagination";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { RefreshButton } from "../../components/ui/RefreshButton";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { rawMaterialService } from "../../services/rawMaterialService";
import { RAW_MATERIAL_UNITS } from "../../constants";
import type { RawMaterial } from "../../types";

const PAGE_SIZE = 8;

const emptyForm = {
  name: "",
  unit: "pcs",
  stock: "",
  active: true,
};

export default function BahanBaku() {
  const confirm = useConfirm();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<RawMaterial | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setRawMaterials(await rawMaterialService.getAll());
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

  const filtered = useMemo(() => {
    return rawMaterials.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [rawMaterials, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function stockTone(m: RawMaterial) {
    return m.stock === 0 ? "red" : m.stock <= 10 ? "amber" : "green";
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(m: RawMaterial) {
    setEditing(m);
    setForm({
      name: m.name,
      unit: m.unit,
      stock: String(m.stock),
      active: m.active,
    });
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.unit.trim()) {
      showToast("error", "Lengkapi data bahan baku terlebih dahulu");
      return;
    }
    const payload = {
      name: form.name,
      unit: form.unit,
      stock: Number(form.stock) || 0,
      active: form.active,
    };
    if (editing) {
      await rawMaterialService.update(editing.id, payload);
      showToast("success", "Bahan baku diperbarui");
    } else {
      await rawMaterialService.create(payload);
      showToast("success", "Bahan baku ditambahkan");
    }
    setModalOpen(false);
    await load();
  }

  async function handleDelete(m: RawMaterial) {
    const ok = await confirm({
      title: `Hapus bahan baku "${m.name}"?`,
      message:
        "Produk yang memakai resep bahan baku ini tidak otomatis terhapus.",
      danger: true,
      confirmLabel: "Ya, Hapus",
    });
    if (!ok) return;
    await rawMaterialService.remove(m.id);
    await load();
    showToast("success", "Bahan baku dihapus");
  }

  return (
    <div className="fade-in space-y-5">
      <Breadcrumb items={[{ label: "Master Data" }, { label: "Bahan Baku" }]} />
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Bahan Baku
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Kelola kemasan & bahan baku (cup, sedotan, sterofoam, dll).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <RefreshButton loading={refreshing} onClick={handleRefresh} />
          <Button icon="fi fi-rr-add" onClick={openCreate}>
            Tambah Bahan Baku
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
              placeholder="Cari bahan baku..."
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
              icon="fi fi-rr-box-open"
              title="Bahan baku tidak ditemukan"
              action={
                <Button size="sm" onClick={openCreate}>
                  Tambah Bahan Baku
                </Button>
              }
            />
          ) : (
            paginated.map((m) => (
              <div key={m.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-slate-700 dark:text-slate-200">
                    {m.name}
                  </p>
                  <div className="-mr-1.5 -mt-1.5 flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => openEdit(m)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                    >
                      <i className="fi fi-rr-edit text-sm" />
                    </button>
                    <button
                      onClick={() => handleDelete(m)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                    >
                      <i className="fi fi-rr-trash text-sm" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone={stockTone(m)}>
                    {m.stock} {m.unit}
                  </Badge>
                  <Badge tone={m.active ? "green" : "slate"}>
                    {m.active ? "Aktif" : "Nonaktif"}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-3 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-y border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-800">
                <th className="px-5 py-3">Nama</th>
                <th className="px-5 py-3">Satuan</th>
                <th className="px-5 py-3">Stok</th>
                <th className="px-5 py-3">Status</th>
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
                      icon="fi fi-rr-box-open"
                      title="Bahan baku tidak ditemukan"
                      action={
                        <Button size="sm" onClick={openCreate}>
                          Tambah Bahan Baku
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                paginated.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-slate-50 transition hover:bg-slate-50/60 dark:border-slate-800/60 dark:hover:bg-slate-800/30"
                  >
                    <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-200">
                      {m.name}
                    </td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                      {m.unit}
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={stockTone(m)}>
                        {m.stock} {m.unit}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={m.active ? "green" : "slate"}>
                        {m.active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(m)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800"
                        >
                          <i className="fi fi-rr-edit text-sm" />
                        </button>
                        <button
                          onClick={() => handleDelete(m)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                        >
                          <i className="fi fi-rr-trash text-sm" />
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
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
        />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Bahan Baku" : "Tambah Bahan Baku"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>
              {editing ? "Simpan" : "Tambah"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nama Bahan Baku"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Contoh: Cup 16oz"
          />
          <div className="grid grid-cols-2 gap-3">
            <SelectDropdown
              label="Satuan"
              required
              value={form.unit}
              onChange={(unit) => setForm((f) => ({ ...f, unit }))}
              options={RAW_MATERIAL_UNITS.map((unit) => ({ value: unit, label: unit }))}
            />
            <Input
              label="Stok"
              type="number"
              value={form.stock}
              onChange={(e) =>
                setForm((f) => ({ ...f, stock: e.target.value }))
              }
              placeholder="0"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm((f) => ({ ...f, active: e.target.checked }))
              }
              className="h-4 w-4 rounded border-slate-300 text-indigo-600"
            />
            Bahan baku aktif digunakan
          </label>
        </div>
      </Modal>
    </div>
  );
}
