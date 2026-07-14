import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input, Select, Textarea } from "../../components/ui/Field";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton, SkeletonRow } from "../../components/ui/Skeleton";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { RefreshButton } from "../../components/ui/RefreshButton";
import { ProductAvatar } from "../../components/ProductAvatar";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { productService } from "../../services/productService";
import { stockService } from "../../services/stockService";
import { formatDate } from "../../utils/format";
import type { Product, StockMovement } from "../../types";

const ADJUST_REASONS = [
  "Barang rusak",
  "Salah input",
  "Pemakaian pribadi",
  "Lainnya",
];

export default function Stok() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [modalType, setModalType] = useState<"masuk" | "penyesuaian" | null>(
    null,
  );
  const [form, setForm] = useState({ productId: "", qty: "", reason: "" });
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const [activeProducts, allMovements] = await Promise.all([
      productService.getActive(),
      stockService.getAll(),
    ]);
    setProducts(activeProducts);
    setMovements(allMovements);
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

  function openModal(type: "masuk" | "penyesuaian") {
    const stockProducts = products.filter((product) => product.trackStock);
    setForm({
      productId: stockProducts[0]?.id ?? "",
      qty: "",
      reason: type === "masuk" ? "" : ADJUST_REASONS[0],
    });
    setModalType(type);
  }

  async function handleSubmit() {
    if (!user || !form.productId || !form.qty) {
      showToast("error", "Lengkapi data terlebih dahulu");
      return;
    }
    const qty = Number(form.qty);
    try {
      if (modalType === "masuk") {
        await stockService.stockIn(
          form.productId,
          qty,
          form.reason || "Stok masuk",
          user,
        );
        showToast("success", "Stok masuk dicatat");
      } else if (modalType === "penyesuaian") {
        await stockService.adjust(
          form.productId,
          -Math.abs(qty),
          form.reason,
          user,
        );
        showToast("success", "Penyesuaian stok dicatat");
      }
    } catch (error) {
      showToast(
        "error",
        error instanceof Error
          ? error.message
          : "Perubahan stok gagal disimpan",
      );
      return;
    }
    setModalType(null);
    await load();
  }

  function productName(id: string) {
    return (
      products.find((p) => p.id === id)?.name ??
      movements.find((m) => m.productId === id)?.productName ??
      "-"
    );
  }

  return (
    <div className="fade-in space-y-5">
      <Breadcrumb items={[{ label: "Master Data" }, { label: "Stok" }]} />
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Manajemen Stok
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Semua satuan menggunakan PCS.
          </p>
        </div>
        <div className="flex gap-2">
          <RefreshButton loading={refreshing} onClick={handleRefresh} />
          <Button
            variant="outline"
            icon="fi fi-rr-package"
            onClick={() => openModal("masuk")}
          >
            Stok Masuk
          </Button>
          <Button
            variant="outline"
            icon="fi fi-rr-settings-sliders"
            onClick={() => openModal("penyesuaian")}
          >
            Penyesuaian
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="skeleton h-16 w-full rounded-lg" />
              </Card>
            ))
          : products.slice(0, 4).map((p) => (
              <Card key={p.id} className="p-4">
                <div className="flex items-center gap-3">
                  <ProductAvatar
                    name={p.name}
                    className="h-12 w-12 rounded-lg"
                    textClassName="text-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                      {p.name}
                    </p>
                    <Badge
                      tone={
                        !p.trackStock
                          ? "slate"
                          : p.stock === 0
                            ? "red"
                            : p.stock <= 10
                              ? "amber"
                              : "green"
                      }
                    >
                      {!p.trackStock ? "Tanpa stok" : `${p.stock} pcs`}
                    </Badge>
                  </div>
                </div>
              </Card>
            ))}
      </div>

      <Card>
        <div className="p-5 pb-0">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
            Riwayat Perubahan Stok
          </h3>
        </div>
        <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2 p-4">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            ))
          ) : movements.length === 0 ? (
            <EmptyState icon="fi fi-rr-boxes" title="Belum ada riwayat stok" />
          ) : (
            movements.slice(0, 30).map((m) => (
              <div key={m.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-slate-700 dark:text-slate-200">
                    {productName(m.productId)}
                  </p>
                  <span
                    className={`shrink-0 font-semibold ${m.qty >= 0 ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {m.qty >= 0 ? `+${m.qty}` : m.qty} pcs
                  </span>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span>{formatDate(m.date, true)}</span>
                  <Badge
                    tone={
                      m.type === "masuk"
                        ? "green"
                        : m.type === "penyesuaian"
                          ? "amber"
                          : "slate"
                    }
                  >
                    {m.type}
                  </Badge>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  {m.reason}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Oleh: {m.userName}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="mt-3 hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-y border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-800">
                <th className="px-5 py-3">Tanggal</th>
                <th className="px-5 py-3">Produk</th>
                <th className="px-5 py-3">Tipe</th>
                <th className="px-5 py-3">Jumlah</th>
                <th className="px-5 py-3">Keterangan</th>
                <th className="px-5 py-3">Oleh</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <SkeletonRow key={i} cols={6} />
                ))
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon="fi fi-rr-boxes"
                      title="Belum ada riwayat stok"
                    />
                  </td>
                </tr>
              ) : (
                movements.slice(0, 30).map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-slate-50 dark:border-slate-800/60"
                  >
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                      {formatDate(m.date, true)}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-200">
                      {productName(m.productId)}
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        tone={
                          m.type === "masuk"
                            ? "green"
                            : m.type === "penyesuaian"
                              ? "amber"
                              : "slate"
                        }
                      >
                        {m.type}
                      </Badge>
                    </td>
                    <td
                      className={`px-5 py-3 font-semibold ${m.qty >= 0 ? "text-emerald-600" : "text-red-500"}`}
                    >
                      {m.qty >= 0 ? `+${m.qty}` : m.qty} pcs
                    </td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                      {m.reason}
                    </td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                      {m.userName}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={!!modalType}
        onClose={() => setModalType(null)}
        title={modalType === "masuk" ? "Stok Masuk" : "Penyesuaian Stok"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalType(null)}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>Simpan</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Produk"
            required
            value={form.productId}
            onChange={(e) =>
              setForm((f) => ({ ...f, productId: e.target.value }))
            }
          >
            {products
              .filter((p) => p.trackStock)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (stok: {p.stock})
                </option>
              ))}
          </Select>
          <Input
            label="Jumlah (pcs)"
            type="number"
            required
            value={form.qty}
            onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))}
            placeholder="10"
          />
          {modalType === "penyesuaian" ? (
            <Select
              label="Alasan"
              value={form.reason}
              onChange={(e) =>
                setForm((f) => ({ ...f, reason: e.target.value }))
              }
            >
              {ADJUST_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          ) : (
            <Textarea
              label="Keterangan"
              value={form.reason}
              onChange={(e) =>
                setForm((f) => ({ ...f, reason: e.target.value }))
              }
              placeholder="Contoh: Restock dari supplier"
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
