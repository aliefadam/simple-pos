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
import { ProductAvatar } from "../../components/ProductAvatar";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import { rawMaterialService } from "../../services/rawMaterialService";
import { formatCurrency } from "../../utils/format";
import type { Category, Product, RawMaterial } from "../../types";

const PAGE_SIZE = 8;

const emptyForm = {
  name: "",
  categoryId: "",
  price: "",
  stock: "",
  trackStock: true,
  image: "",
  active: true,
  recipe: [] as { rawMaterialId: string; qty: string }[],
};

export default function Produk() {
  const confirm = useConfirm();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const [allProducts, allCategories, activeRawMaterials] = await Promise.all([
      productService.getAll(),
      categoryService.getAll(),
      rawMaterialService.getActive(),
    ]);
    setProducts(allProducts);
    setCategories(allCategories);
    setRawMaterials(activeRawMaterials);
  }

  useEffect(() => {
    let active = true;
    const t = setTimeout(async () => {
      if (!active) return;
      await load();
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
      await load();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === "all" || p.categoryId === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [products, search, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function categoryName(id: string) {
    return categories.find((c) => c.id === id)?.name ?? "-";
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, categoryId: categories[0]?.id ?? "" });
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setForm({
      name: product.name,
      categoryId: product.categoryId,
      price: String(product.price),
      stock: String(product.stock),
      trackStock: product.trackStock,
      image: "",
      active: product.active,
      recipe: (product.recipe ?? []).map((r) => ({
        rawMaterialId: r.rawMaterialId,
        qty: String(r.qty),
      })),
    });
    setModalOpen(true);
  }

  function addRecipeRow() {
    setForm((f) => ({
      ...f,
      recipe: [...f.recipe, { rawMaterialId: "", qty: "1" }],
    }));
  }

  function updateRecipeRow(index: number, patch: Partial<{ rawMaterialId: string; qty: string }>) {
    setForm((f) => ({
      ...f,
      recipe: f.recipe.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    }));
  }

  function removeRecipeRow(index: number) {
    setForm((f) => ({
      ...f,
      recipe: f.recipe.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.categoryId || !form.price) {
      showToast("error", "Lengkapi data produk terlebih dahulu");
      return;
    }
    const recipe = form.recipe
      .filter((r) => r.rawMaterialId && Number(r.qty) > 0)
      .map((r) => ({ rawMaterialId: r.rawMaterialId, qty: Number(r.qty) }));
    const payload = {
      name: form.name,
      categoryId: form.categoryId,
      price: Number(form.price),
      stock: form.trackStock ? Number(form.stock) || 0 : 0,
      trackStock: form.trackStock,
      image: "",
      active: form.active,
      recipe,
    };
    if (editing) {
      await productService.update(editing.id, payload);
      showToast("success", "Produk diperbarui");
    } else {
      await productService.create(payload);
      showToast("success", "Produk ditambahkan");
    }
    setModalOpen(false);
    await load();
  }

  async function handleDelete(product: Product) {
    const ok = await confirm({
      title: `Hapus produk "${product.name}"?`,
      message: "Data transaksi lama tidak akan terpengaruh.",
      danger: true,
      confirmLabel: "Ya, Hapus",
    });
    if (!ok) return;
    await productService.remove(product.id);
    await load();
    showToast("success", "Produk dihapus");
  }

  return (
    <div className="fade-in space-y-5">
      <Breadcrumb items={[{ label: "Master Data" }, { label: "Produk" }]} />
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Produk</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Kelola daftar produk yang dijual.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <RefreshButton loading={refreshing} onClick={handleRefresh} />
          <Button icon="fi fi-rr-add" onClick={openCreate}>
            Tambah Produk
          </Button>
        </div>
      </div>

      <Card>
        <div className="flex flex-col gap-3 p-5 pb-0 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <i className="fi fi-rr-search absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Cari produk..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
            />
          </div>
          <SelectDropdown
            className="w-full sm:w-52"
            value={categoryFilter}
            onChange={(value) => {
              setCategoryFilter(value);
              setPage(1);
            }}
            options={[
              { value: "all", label: "Semua Kategori" },
              ...categories.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />
        </div>

        <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <Skeleton className="h-11 w-11 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))
          ) : paginated.length === 0 ? (
            <EmptyState icon="fi fi-rr-box-open" title="Produk tidak ditemukan" action={<Button size="sm" onClick={openCreate}>Tambah Produk</Button>} />
          ) : (
            paginated.map((product) => (
              <div key={product.id} className="flex items-start gap-3 p-4">
                <ProductAvatar name={product.name} className="h-11 w-11 shrink-0 rounded-lg" textClassName="text-xs" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-slate-700 dark:text-slate-200">{product.name}</p>
                    <div className="-mr-1.5 -mt-1.5 flex shrink-0 items-center gap-1">
                      <button onClick={() => openEdit(product)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800">
                        <i className="fi fi-rr-edit text-sm" />
                      </button>
                      <button onClick={() => handleDelete(product)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10">
                        <i className="fi fi-rr-trash text-sm" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">{categoryName(product.categoryId)}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formatCurrency(product.price)}</span>
                    <Badge tone={!product.trackStock ? "slate" : product.stock === 0 ? "red" : product.stock <= 10 ? "amber" : "green"}>
                      {!product.trackStock ? "Tanpa stok" : `${product.stock} pcs`}
                    </Badge>
                    <Badge tone={product.active ? "green" : "slate"}>{product.active ? "Aktif" : "Nonaktif"}</Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-3 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-y border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-800">
                <th className="px-5 py-3">Produk</th>
                <th className="px-5 py-3">Kategori</th>
                <th className="px-5 py-3">Harga</th>
                <th className="px-5 py-3">Stok</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState icon="fi fi-rr-box-open" title="Produk tidak ditemukan" action={<Button size="sm" onClick={openCreate}>Tambah Produk</Button>} />
                  </td>
                </tr>
              ) : (
                paginated.map((product) => (
                  <tr key={product.id} className="border-b border-slate-50 transition hover:bg-slate-50/60 dark:border-slate-800/60 dark:hover:bg-slate-800/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <ProductAvatar
                          name={product.name}
                          className="h-10 w-10 rounded-lg"
                          textClassName="text-xs"
                        />
                        <span className="font-medium text-slate-700 dark:text-slate-200">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{categoryName(product.categoryId)}</td>
                    <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-200">{formatCurrency(product.price)}</td>
                    <td className="px-5 py-3">
                      <Badge tone={!product.trackStock ? "slate" : product.stock === 0 ? "red" : product.stock <= 10 ? "amber" : "green"}>
                        {!product.trackStock ? "Tanpa stok" : `${product.stock} pcs`}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone={product.active ? "green" : "slate"}>{product.active ? "Aktif" : "Nonaktif"}</Badge>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(product)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800">
                          <i className="fi fi-rr-edit text-sm" />
                        </button>
                        <button onClick={() => handleDelete(product)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10">
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
        <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Produk" : "Tambah Produk"}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit}>{editing ? "Simpan" : "Tambah"}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <ProductAvatar
              name={form.name || "Produk Baru"}
              className="h-16 w-16"
              textClassName="text-lg"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Preview produk</p>
              <p className="mt-1 text-xs text-slate-400">Inisial akan dibuat otomatis dari nama produk.</p>
            </div>
          </div>
          <Input label="Nama Produk" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Contoh: Nasi Kucing" />
          <SelectDropdown
            label="Kategori"
            required
            placeholder="Pilih kategori"
            value={form.categoryId}
            onChange={(categoryId) => setForm((f) => ({ ...f, categoryId }))}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Harga (Rp)" type="number" required value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="3000" />
            <Input
              label="Stok (pcs)"
              type="number"
              value={form.stock}
              onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              placeholder={form.trackStock ? "0" : "Tidak digunakan"}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={form.trackStock}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  trackStock: e.target.checked,
                  stock: e.target.checked ? f.stock : "0",
                }))
              }
              className="h-4 w-4 rounded border-slate-300 text-indigo-600"
            />
            Produk ini menggunakan stok
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600"
            />
            Produk aktif dijual
          </label>

          <div className="space-y-2 border-t border-dashed border-slate-200 pt-4 dark:border-slate-700">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Resep Bahan Baku</p>
                <p className="text-xs text-slate-400">Opsional — bahan baku yang otomatis berkurang saat produk ini terjual.</p>
              </div>
              <Button variant="outline" size="sm" icon="fi fi-rr-add" onClick={addRecipeRow}>
                Tambah Bahan
              </Button>
            </div>
            {form.recipe.length === 0 ? (
              <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-400 dark:bg-slate-800/60">
                Belum ada bahan baku ditambahkan.
              </p>
            ) : (
              <div className="space-y-2">
                {form.recipe.map((row, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="flex-1">
                      <SelectDropdown
                        searchable
                        placeholder="Pilih bahan baku"
                        searchPlaceholder="Cari bahan baku..."
                        value={row.rawMaterialId}
                        onChange={(rawMaterialId) => updateRecipeRow(index, { rawMaterialId })}
                        options={rawMaterials.map((m) => ({
                          value: m.id,
                          label: `${m.name} (${m.unit})`,
                        }))}
                      />
                    </div>
                    <div className="w-20">
                      <Input
                        type="number"
                        min="0"
                        value={row.qty}
                        onChange={(e) => updateRecipeRow(index, { qty: e.target.value })}
                        placeholder="1"
                      />
                    </div>
                    <button
                      onClick={() => removeRecipeRow(index)}
                      className="flex h-[42px] w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                    >
                      <i className="fi fi-rr-trash text-sm" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
