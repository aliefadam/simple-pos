import { Button } from "./ui/Button";
import { EmptyState } from "./ui/EmptyState";
import { ProductAvatar } from "./ProductAvatar";
import { PAYMENT_METHODS } from "../constants";
import { formatCurrency } from "../utils/format";
import type { CartItem, PaymentMethod } from "../types";
import { cn } from "../utils/cn";

interface CartPanelProps {
  items: CartItem[];
  subtotal: number;
  extraCharge: string;
  total: number;
  paymentMethod: PaymentMethod;
  onPaymentMethodChange: (m: PaymentMethod) => void;
  onExtraChargeChange: (v: string) => void;
  cashReceived: string;
  onCashReceivedChange: (v: string) => void;
  onUpdateQty: (productId: string, qty: number, maxStock?: number) => void;
  onUpdateNote: (productId: string, note: string) => void;
  onRemove: (productId: string) => void;
  onHold: () => void;
  onPay: () => void;
  onReset: () => void;
  getMaxStock: (productId: string) => number | undefined;
  processing?: boolean;
}

export function CartPanel({
  items,
  subtotal,
  extraCharge,
  total,
  paymentMethod,
  onPaymentMethodChange,
  onExtraChargeChange,
  cashReceived,
  onCashReceivedChange,
  onUpdateQty,
  onUpdateNote,
  onRemove,
  onHold,
  onPay,
  onReset,
  getMaxStock,
  processing,
}: CartPanelProps) {
  const cash = Number(cashReceived) || 0;
  const extra = Math.max(0, Number(extraCharge) || 0);
  const change = cash - total;
  const cashPresets = [
    { label: "Uang pas", value: total },
    { label: "Bulat 1rb", value: Math.ceil(total / 1000) * 1000 },
    { label: "Bulat 5rb", value: Math.ceil(total / 5000) * 5000 },
  ].filter(
    (preset, index, arr) =>
      arr.findIndex((item) => item.value === preset.value) === index,
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-white">
          <i className="fi fi-rr-shopping-cart-check text-indigo-500" />
          Keranjang
        </h3>
        {items.length > 0 && (
          <button
            onClick={onReset}
            className="text-xs font-medium text-slate-400 transition hover:text-red-500"
          >
            Kosongkan
          </button>
        )}
      </div>

      <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {items.length === 0 ? (
          <EmptyState
            icon="fi fi-rr-shopping-cart"
            title="Keranjang kosong"
            description="Pilih produk untuk mulai transaksi"
          />
        ) : (
          items.map((item) => {
            const maxStock = getMaxStock(item.productId);
            return (
              <div
                key={item.productId}
                className="slide-up flex gap-3 rounded-xl border border-slate-100 p-2.5 dark:border-slate-800"
              >
                <ProductAvatar
                  name={item.name}
                  className="h-14 w-14 shrink-0 rounded-lg"
                  textClassName="text-sm"
                />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                      {item.name}
                    </p>
                    <button
                      onClick={() => onRemove(item.productId)}
                      className="text-slate-300 transition hover:text-red-500"
                    >
                      <i className="fi fi-rr-trash text-xs" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">
                    {formatCurrency(item.price)}
                  </p>
                  <input
                    value={item.note ?? ""}
                    onChange={(e) =>
                      onUpdateNote(item.productId, e.target.value)
                    }
                    placeholder="Catatan (contoh: pedas)"
                    className="w-full rounded-lg border border-slate-100 bg-slate-50 px-2 py-1 text-[11px] text-slate-500 outline-none focus:border-indigo-300 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          onUpdateQty(item.productId, item.qty - 1, maxStock)
                        }
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                      >
                        <i className="fi fi-rr-minus-small text-xs" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium text-slate-700 dark:text-slate-200">
                        {item.qty}
                      </span>
                      <button
                        onClick={() =>
                          onUpdateQty(item.productId, item.qty + 1, maxStock)
                        }
                        disabled={
                          maxStock !== undefined && item.qty >= maxStock
                        }
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-500 transition hover:bg-slate-200 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-300"
                      >
                        <i className="fi fi-rr-plus-small text-xs" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-white">
                      {formatCurrency(item.price * item.qty)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="space-y-3 border-t border-slate-100 px-5 py-4 dark:border-slate-800">
        <div className="grid grid-cols-2 gap-2">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.value}
              onClick={() => onPaymentMethodChange(m.value as PaymentMethod)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-xs font-medium transition-all duration-200",
                paymentMethod === m.value
                  ? "border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400",
              )}
            >
              <i className={`${m.icon} text-base`} />
              {m.label}
            </button>
          ))}
        </div>

        <div className="space-y-1.5">
          <input
            type="number"
            min="0"
            value={extraCharge}
            onChange={(e) => onExtraChargeChange(e.target.value)}
            placeholder="Biaya tambahan"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
          />
          <p className="text-[11px] text-slate-400">
            Contoh: biaya layanan, bungkus, atau ongkir lokal.
          </p>
        </div>

        {paymentMethod === "tunai" && (
          <div className="space-y-1.5">
            <input
              type="number"
              value={cashReceived}
              onChange={(e) => onCashReceivedChange(e.target.value)}
              placeholder="Jumlah uang diterima"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
            />
            <div className="flex flex-wrap gap-2">
              {cashPresets.map((preset) => (
                <button
                  key={`${preset.label}-${preset.value}`}
                  type="button"
                  onClick={() => onCashReceivedChange(String(preset.value))}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-[11px] font-medium transition",
                    cash === preset.value
                      ? "border-indigo-500 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
                      : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800",
                  )}
                >
                  {preset.label}: {formatCurrency(preset.value)}
                </button>
              ))}
            </div>
            {cash > 0 && (
              <p
                className={cn(
                  "text-xs font-medium",
                  change < 0 ? "text-red-500" : "text-emerald-600",
                )}
              >
                {change < 0 ? "Kurang: " : "Kembalian: "}
                {formatCurrency(Math.abs(change))}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2 border-t border-dashed border-slate-200 pt-3 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Subtotal
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-white">
              {formatCurrency(subtotal)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Biaya tambahan
            </span>
            <span className="text-sm font-semibold text-slate-800 dark:text-white">
              {formatCurrency(extra)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total
            </span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            icon="fi fi-rr-time-quarter-past"
            onClick={onHold}
            disabled={items.length === 0}
          >
            Tahan
          </Button>
          <Button
            icon="fi fi-rr-check"
            onClick={onPay}
            loading={processing}
            disabled={
              items.length === 0 || (paymentMethod === "tunai" && cash < total)
            }
          >
            Bayar
          </Button>
        </div>
      </div>
    </div>
  );
}
