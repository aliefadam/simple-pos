import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productService } from "../services/productService";
import { transactionService } from "../services/transactionService";
import { formatCurrency } from "../utils/format";

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!query.trim()) return { products: [], transactions: [] };
    const q = query.toLowerCase();
    const products = productService.getAll().filter((p) => p.name.toLowerCase().includes(q)).slice(0, 4);
    const transactions = transactionService
      .getAll()
      .filter((t) => t.code.toLowerCase().includes(q))
      .slice(0, 4);
    return { products, transactions };
  }, [query]);

  const hasResults = results.products.length > 0 || results.transactions.length > 0;

  return (
    <div className="relative hidden w-full max-w-sm sm:block">
      <i className="fi fi-rr-search absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        placeholder="Cari produk atau nomor transaksi..."
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-700 outline-none transition focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:focus:bg-slate-800"
      />
      {focused && query.trim() && (
        <div className="scale-in absolute top-[calc(100%+8px)] z-50 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
          {!hasResults && <p className="p-4 text-center text-sm text-slate-400">Tidak ada hasil ditemukan</p>}
          {results.products.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Produk</p>
              {results.products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate("/master/produk")}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <span className="text-slate-600 dark:text-slate-300">{p.name}</span>
                  <span className="text-xs text-slate-400">{formatCurrency(p.price)}</span>
                </button>
              ))}
            </div>
          )}
          {results.transactions.length > 0 && (
            <div className="border-t border-slate-100 p-2 dark:border-slate-800">
              <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Transaksi</p>
              {results.transactions.map((t) => (
                <button
                  key={t.id}
                  onClick={() => navigate("/kasir/riwayat")}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <span className="text-slate-600 dark:text-slate-300">{t.code}</span>
                  <span className="text-xs text-slate-400">{formatCurrency(t.total)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
