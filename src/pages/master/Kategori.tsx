import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input, Select } from "../../components/ui/Field";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonRow } from "../../components/ui/Skeleton";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { categoryService } from "../../services/categoryService";
import { CATEGORY_ICONS } from "../../constants";
import type { Category } from "../../types";

const emptyForm = { name: "", icon: CATEGORY_ICONS[0], active: true };

export default function Kategori() {
  const confirm = useConfirm();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function load() {
    setCategories(await categoryService.getAll());
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

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setForm({ name: cat.name, icon: cat.icon, active: cat.active });
    setModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      showToast("error", "Nama kategori wajib diisi");
      return;
    }
    if (editing) {
      await categoryService.update(editing.id, form);
      showToast("success", "Kategori diperbarui");
    } else {
      await categoryService.create(form);
      showToast("success", "Kategori ditambahkan");
    }
    setModalOpen(false);
    await load();
  }

  async function handleDelete(cat: Category) {
    const ok = await confirm({
      title: `Hapus kategori "${cat.name}"?`,
      message: "Produk pada kategori ini tidak akan otomatis terhapus.",
      danger: true,
      confirmLabel: "Ya, Hapus",
    });
    if (!ok) return;
    await categoryService.remove(cat.id);
    await load();
    showToast("success", "Kategori dihapus");
  }

  return (
    <div className="fade-in space-y-5">
      <Breadcrumb items={[{ label: "Master Data" }, { label: "Kategori" }]} />
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kategori Produk</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Kelola pengelompokan produk toko Anda.</p>
        </div>
        <Button icon="fi fi-rr-add" onClick={openCreate}>
          Tambah Kategori
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-800">
                <th className="px-5 py-3">Icon</th>
                <th className="px-5 py-3">Nama Kategori</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} cols={4} />)
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <EmptyState icon="fi fi-rr-apps-add" title="Belum ada kategori" action={<Button size="sm" onClick={openCreate}>Tambah Kategori</Button>} />
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-slate-50 transition hover:bg-slate-50/60 dark:border-slate-800/60 dark:hover:bg-slate-800/30">
                    <td className="px-5 py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                        <i className={`fi ${cat.icon}`} />
                      </div>
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-200">{cat.name}</td>
                    <td className="px-5 py-3">
                      <Badge tone={cat.active ? "green" : "slate"}>{cat.active ? "Aktif" : "Nonaktif"}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(cat)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800">
                          <i className="fi fi-rr-edit text-sm" />
                        </button>
                        <button onClick={() => handleDelete(cat)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10">
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
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Kategori" : "Tambah Kategori"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit}>{editing ? "Simpan" : "Tambah"}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="Nama Kategori"
            required
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Contoh: Makanan"
          />
          <Select
            label="Icon"
            value={form.icon}
            onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
          >
            {CATEGORY_ICONS.map((icon) => (
              <option key={icon} value={icon}>
                {icon}
              </option>
            ))}
          </Select>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <i className={`fi ${form.icon}`} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600"
            />
            Kategori aktif
          </label>
        </div>
      </Modal>
    </div>
  );
}
