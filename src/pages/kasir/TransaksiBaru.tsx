import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CartPanel } from "../../components/CartPanel";
import { ProductAvatar } from "../../components/ProductAvatar";
import { Card } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input, Textarea } from "../../components/ui/Field";
import { EmptyState } from "../../components/ui/EmptyState";
import { SkeletonCard } from "../../components/ui/Skeleton";
import { Spinner } from "../../components/ui/Spinner";
import { Badge } from "../../components/ui/Badge";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { productService } from "../../services/productService";
import { categoryService } from "../../services/categoryService";
import { transactionService } from "../../services/transactionService";
import { shiftService } from "../../services/shiftService";
import { formatCurrency, formatDate } from "../../utils/format";
import { cn } from "../../utils/cn";
import type {
  Category,
  PaymentMethod,
  Product,
  Shift,
  Transaction,
} from "../../types";

export default function TransaksiBaru() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const cart = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("tunai");
  const [extraCharge, setExtraCharge] = useState("");
  const [cashReceived, setCashReceived] = useState("");
  const [processing, setProcessing] = useState(false);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [cartMounted, setCartMounted] = useState(false);
  const [cartClosing, setCartClosing] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [poppingId, setPoppingId] = useState<string | null>(null);
  const [heldOpen, setHeldOpen] = useState(false);
  const [heldList, setHeldList] = useState<Transaction[]>([]);

  const [shift, setShift] = useState<Shift | null>(null);
  const [shiftLoading, setShiftLoading] = useState(true);
  const [openingCashInput, setOpeningCashInput] = useState("");
  const [openingShift, setOpeningShift] = useState(false);
  const [closeShiftOpen, setCloseShiftOpen] = useState(false);
  const [closePreview, setClosePreview] = useState<{
    totalCashSales: number;
    totalCashExpenses: number;
    expectedCash: number;
  } | null>(null);
  const [actualCashInput, setActualCashInput] = useState("");
  const [closeNotes, setCloseNotes] = useState("");
  const [closingShift, setClosingShift] = useState(false);

  const searchRef = useRef<HTMLInputElement>(null);
  const dragStartY = useRef<number | null>(null);

  useEffect(() => {
    if (mobileCartOpen) {
      setCartMounted(true);
      setCartClosing(false);
      return;
    }
    if (!cartMounted) return;
    setCartClosing(true);
    const t = setTimeout(() => {
      setCartMounted(false);
      setCartClosing(false);
      setDragY(0);
    }, 220);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileCartOpen]);

  function handleDragStart(e: React.TouchEvent) {
    dragStartY.current = e.touches[0].clientY;
  }

  function handleDragMove(e: React.TouchEvent) {
    if (dragStartY.current === null) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    if (delta > 0) setDragY(delta);
  }

  function handleDragEnd() {
    if (dragY > 90) {
      setMobileCartOpen(false);
    } else {
      setDragY(0);
    }
    dragStartY.current = null;
  }

  async function loadData() {
    const [activeProducts, activeCategories, heldTransactions] =
      await Promise.all([
        productService.getActive(),
        categoryService.getActive(),
        transactionService.getHeld(),
      ]);
    setProducts(activeProducts);
    setCategories(activeCategories);
    setHeldList(heldTransactions);
  }

  async function loadShift() {
    const open = await shiftService.getOpen();
    setShift(open ?? null);
    setShiftLoading(false);
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

  useEffect(() => {
    loadShift();
  }, []);

  async function handleOpenShift() {
    if (!user) return;
    const amount = Number(openingCashInput);
    if (!openingCashInput || Number.isNaN(amount) || amount < 0) {
      showToast("error", "Masukkan modal awal kas yang valid");
      return;
    }
    setOpeningShift(true);
    try {
      const opened = await shiftService.open(user, amount);
      setShift(opened);
      setOpeningCashInput("");
      showToast(
        "success",
        "Shift dibuka",
        `Modal awal ${formatCurrency(amount)}`,
      );
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Gagal membuka shift",
      );
      await loadShift();
    } finally {
      setOpeningShift(false);
    }
  }

  async function openCloseShiftModal() {
    if (!shift) return;
    setActualCashInput("");
    setCloseNotes("");
    setClosePreview(null);
    setCloseShiftOpen(true);
    const preview = await shiftService.previewClose(shift);
    setClosePreview(preview);
  }

  async function handleCloseShift() {
    if (!shift || !user) return;
    const amount = Number(actualCashInput);
    if (!actualCashInput || Number.isNaN(amount) || amount < 0) {
      showToast("error", "Masukkan jumlah uang fisik yang valid");
      return;
    }
    setClosingShift(true);
    try {
      const closed = await shiftService.close(
        shift.id,
        user,
        amount,
        closeNotes.trim() || undefined,
      );
      setCloseShiftOpen(false);
      setShift(null);
      const diff = closed.difference ?? 0;
      const diffLabel =
        diff === 0
          ? "Kas sesuai"
          : `${diff > 0 ? "Lebih" : "Kurang"} ${formatCurrency(Math.abs(diff))}`;
      showToast("success", "Shift berhasil ditutup", diffLabel);
    } catch (error) {
      showToast(
        "error",
        error instanceof Error ? error.message : "Gagal menutup shift",
      );
    } finally {
      setClosingShift(false);
    }
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      } else if (e.key === "F8") {
        e.preventDefault();
        handleHold();
      } else if (e.key === "F9") {
        e.preventDefault();
        handlePay();
      } else if (e.key === "Escape") {
        setMobileCartOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.items, paymentMethod, cashReceived, extraCharge]);

  const subtotal = cart.total;
  const extraChargeValue = Math.max(0, Number(extraCharge) || 0);
  const grandTotal = subtotal + extraChargeValue;

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        activeCategory === "all" || p.categoryId === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [products, search, activeCategory]);

  function getMaxStock(productId: string) {
    const product = products.find((item) => item.id === productId);
    return product?.trackStock ? product.stock : undefined;
  }

  function handleAdd(product: Product) {
    if (product.trackStock && product.stock <= 0) return;
    cart.addItem(product);
    setPoppingId(product.id);
    window.setTimeout(() => {
      setPoppingId((current) => (current === product.id ? null : current));
    }, 320);
  }

  function resetCashFields() {
    setCashReceived("");
    setExtraCharge("");
    setPaymentMethod("tunai");
  }

  function handleReset() {
    cart.clear();
    resetCashFields();
  }

  async function handleHold() {
    if (cart.items.length === 0 || !user || !shift) return;
    await transactionService.checkout(cart.items, paymentMethod, user, {
      extraCharge: extraChargeValue,
      status: "ditahan",
    });
    await loadData();
    showToast(
      "success",
      "Transaksi ditahan",
      "Anda bisa melanjutkannya nanti dari daftar hold",
    );
    handleReset();
  }

  function handlePay() {
    if (cart.items.length === 0 || !user || !shift) return;
    const cash = Number(cashReceived) || 0;
    if (paymentMethod === "tunai" && cash < grandTotal) return;
    setProcessing(true);
    setTimeout(async () => {
      const tx = await transactionService.checkout(
        cart.items,
        paymentMethod,
        user,
        {
          extraCharge: extraChargeValue,
          cashReceived: paymentMethod === "tunai" ? cash : undefined,
          status: "selesai",
        },
      );
      await loadData();
      handleReset();
      setProcessing(false);
      setMobileCartOpen(false);
      showToast(
        "success",
        "Pembayaran berhasil",
        `Transaksi ${tx.code} telah tersimpan`,
      );
    }, 500);
  }

  async function resumeHeld(tx: Transaction) {
    cart.loadItems(tx.items);
    setPaymentMethod(tx.paymentMethod);
    setExtraCharge(tx.extraCharge ? String(tx.extraCharge) : "");
    setCashReceived("");
    await transactionService.resumeHeld(tx.id);
    await loadData();
    setHeldOpen(false);
    showToast("info", "Transaksi hold dilanjutkan");
  }

  return (
    <div className="fade-in">
      <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Transaksi Baru
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Pilih produk lalu proses pembayaran.
          </p>
        </div>
        {shift && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <i className="fi fi-rr-cash-register" />
              Shift aktif sejak {formatDate(shift.openedAt, true)}
            </div>
            <Button variant="outline" size="sm" onClick={openCloseShiftModal}>
              Tutup Shift
            </Button>
            <button
              onClick={() => setHeldOpen(true)}
              className="relative flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <i className="fi fi-rr-time-quarter-past" /> Ditahan
              {heldList.length > 0 && (
                <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white">
                  {heldList.length}
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      {shiftLoading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : !shift ? (
        <div className="mx-auto max-w-md">
          <Card className="scale-in p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
              <i className="fi fi-rr-cash-register text-2xl" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
              Buka Shift Dulu
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Masukkan modal awal kas di laci sebelum mulai bertransaksi.
            </p>
            <div className="mt-5 text-left">
              <Input
                label="Modal Awal Kas (Rp)"
                type="number"
                min="0"
                value={openingCashInput}
                onChange={(e) => setOpeningCashInput(e.target.value)}
                placeholder="0"
              />
            </div>
            <Button
              className="mt-4 w-full"
              icon="fi fi-rr-lock-open-alt"
              onClick={handleOpenShift}
              loading={openingShift}
            >
              Buka Shift
            </Button>
          </Card>
        </div>
      ) : (
      <>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <i className="fi fi-rr-search absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari produk... "
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                >
                  <i className="fi fi-rr-cross-small text-xs" />
                </button>
              )}
            </div>
          </div>

          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveCategory("all")}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all duration-200",
                activeCategory === "all"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                  : "bg-white text-slate-500 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800",
              )}
            >
              Semua
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={cn(
                  "shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all duration-200",
                  activeCategory === c.id
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                    : "bg-white text-slate-500 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800",
                )}
              >
                <i className={`fi ${c.icon} mr-1.5`} />
                {c.name}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <EmptyState
              icon="fi fi-rr-search"
              title="Produk tidak ditemukan"
              description="Coba kata kunci atau kategori lain"
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => {
                const outOfStock = product.trackStock && product.stock <= 0;
                const lowStock =
                  product.trackStock &&
                  product.stock > 0 &&
                  product.stock <= 10;
                return (
                  <button
                    key={product.id}
                    onClick={() => handleAdd(product)}
                    disabled={outOfStock}
                    className={cn(
                      "group scale-in overflow-hidden rounded-2xl border border-slate-200/70 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 active:shadow-sm disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:active:scale-100 dark:border-slate-800 dark:bg-slate-900",
                      outOfStock && "grayscale-[0.95] opacity-75",
                      poppingId === product.id &&
                        "added-pop ring-2 ring-indigo-400 dark:ring-indigo-500",
                    )}
                  >
                    <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <ProductAvatar
                        name={product.name}
                        className={cn(
                          "h-full w-full rounded-none text-4xl transition-transform duration-300 group-hover:scale-105",
                        )}
                        textClassName="text-4xl"
                      />
                      <div className="absolute left-2 top-2">
                        <Badge
                          tone={
                            !product.trackStock
                              ? "slate"
                              : outOfStock
                                ? "red"
                                : lowStock
                                  ? "amber"
                                  : "green"
                          }
                        >
                          {!product.trackStock
                            ? "Tanpa stok"
                            : outOfStock
                              ? "Habis"
                              : `${product.stock} pcs`}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                        {product.name}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between">
                        <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(product.price)}
                        </p>
                        {outOfStock ? (
                          <span className="text-[10px] font-bold uppercase text-red-500">
                            Habis
                          </span>
                        ) : (
                          <span
                            className={cn(
                              "flex h-6 w-6 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-500/10",
                              poppingId === product.id &&
                                "added-bump bg-indigo-600 text-white",
                            )}
                          >
                            <i className="fi fi-rr-plus-small text-xs" />
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="hidden lg:block">
          <div className="sticky top-20 rounded-2xl border border-slate-200/70 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <CartPanel
              items={cart.items}
              subtotal={subtotal}
              extraCharge={extraCharge}
              total={grandTotal}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              onExtraChargeChange={setExtraCharge}
              cashReceived={cashReceived}
              onCashReceivedChange={setCashReceived}
              onUpdateQty={cart.updateQty}
              onUpdateNote={cart.updateNote}
              onRemove={cart.removeItem}
              onHold={handleHold}
              onPay={handlePay}
              onReset={handleReset}
              getMaxStock={getMaxStock}
              processing={processing}
            />
          </div>
        </div>
      </div>

      {cart.items.length > 0 && (
        <button
          onClick={() => setMobileCartOpen(true)}
          className="slide-up fixed inset-x-4 bottom-4 z-30 flex items-center justify-between rounded-2xl bg-indigo-600 px-5 py-4 text-white shadow-lg shadow-indigo-600/30 lg:hidden"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <i className="fi fi-rr-shopping-cart-check" />
            {cart.totalQty} item
          </span>
          <span className="text-sm font-bold">
            {formatCurrency(grandTotal)}
          </span>
        </button>
      )}

      {cartMounted &&
        createPortal(
          <div className="fixed inset-0 z-[90] lg:hidden">
            <div
              className={cn(
                "absolute inset-0 bg-slate-950/40 backdrop-blur-sm",
                cartClosing ? "fade-out" : "fade-in",
              )}
              onClick={() => setMobileCartOpen(false)}
            />
            <div
              className={cn(
                "absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl dark:bg-slate-900",
                cartClosing ? "sheet-out" : "sheet-in",
              )}
              style={
                dragY
                  ? { transform: `translateY(${dragY}px)`, transition: "none" }
                  : undefined
              }
            >
              <div
                className="relative flex shrink-0 items-center justify-center py-3"
                onTouchStart={handleDragStart}
                onTouchMove={handleDragMove}
                onTouchEnd={handleDragEnd}
              >
                <span className="h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                <button
                  onClick={() => setMobileCartOpen(false)}
                  className="absolute right-4 top-2 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                >
                  <i className="fi fi-rr-cross-small text-base" />
                </button>
              </div>
              <CartPanel
                className="min-h-0 flex-1"
                items={cart.items}
                subtotal={subtotal}
                extraCharge={extraCharge}
                total={grandTotal}
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
                onExtraChargeChange={setExtraCharge}
                cashReceived={cashReceived}
                onCashReceivedChange={setCashReceived}
                onUpdateQty={cart.updateQty}
                onUpdateNote={cart.updateNote}
                onRemove={cart.removeItem}
                onHold={handleHold}
                onPay={handlePay}
                onReset={handleReset}
                getMaxStock={getMaxStock}
                processing={processing}
              />
            </div>
          </div>,
          document.body,
        )}
      </>
      )}

      <Modal
        open={heldOpen}
        onClose={() => setHeldOpen(false)}
        title="Transaksi Ditahan"
        size="md"
      >
        {heldList.length === 0 ? (
          <EmptyState
            icon="fi fi-rr-time-quarter-past"
            title="Tidak ada transaksi ditahan"
          />
        ) : (
          <div className="space-y-2">
            {heldList.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-xl border border-slate-100 p-3 dark:border-slate-800"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    {tx.code}
                  </p>
                  <p className="text-xs text-slate-400">
                    {tx.items.length} item · {formatCurrency(tx.total)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => resumeHeld(tx)}
                >
                  Lanjutkan
                </Button>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal
        open={closeShiftOpen}
        onClose={() => {
          if (closingShift) return;
          setCloseShiftOpen(false);
        }}
        title="Tutup Shift"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setCloseShiftOpen(false)}
              disabled={closingShift}
            >
              Batal
            </Button>
            <Button onClick={handleCloseShift} loading={closingShift}>
              Tutup Shift
            </Button>
          </>
        }
      >
        {shift && (
          <div className="space-y-4">
            <div className="space-y-2 rounded-xl border border-slate-100 p-3 text-sm dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Modal Awal
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {formatCurrency(shift.openingCash)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Penjualan Tunai
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {closePreview ? formatCurrency(closePreview.totalCashSales) : "…"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">
                  Pengeluaran Tunai
                </span>
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {closePreview
                    ? `- ${formatCurrency(closePreview.totalCashExpenses)}`
                    : "…"}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-slate-200 pt-2 dark:border-slate-700">
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Uang Sistem
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-white">
                  {closePreview ? formatCurrency(closePreview.expectedCash) : "…"}
                </span>
              </div>
            </div>
            <Input
              label="Uang Fisik di Laci (Rp)"
              type="number"
              min="0"
              required
              value={actualCashInput}
              onChange={(e) => setActualCashInput(e.target.value)}
              placeholder="0"
            />
            <Textarea
              label="Catatan (opsional)"
              value={closeNotes}
              onChange={(e) => setCloseNotes(e.target.value)}
              placeholder="Contoh: selisih karena kembalian kurang"
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
