import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { formatCurrency, formatDate } from "../utils/format";
import { settingsService } from "../services/settingsService";
import type { Transaction } from "../types";
import { useEffect, useState } from "react";
import type { BusinessProfile } from "../types";

export function ReceiptModal({ open, onClose, transaction }: { open: boolean; onClose: () => void; transaction: Transaction | null }) {
  const [business, setBusiness] = useState<BusinessProfile>({
    name: "Usaha Saya",
    address: "-",
    phone: "-",
    footerNote: "Terima kasih atas kunjungan Anda",
  });

  useEffect(() => {
    let active = true;
    settingsService.get().then((settings) => {
      if (active) setBusiness(settings.businessProfile);
    });
    return () => {
      active = false;
    };
  }, []);

  if (!transaction) return null;

  return (
    <Modal open={open} onClose={onClose} title="Struk Transaksi" size="sm">
      <div id="receipt-print" className="space-y-3 font-mono text-xs text-slate-700 dark:text-slate-200">
        <div className="text-center">
          <p className="text-sm font-bold">{business.name}</p>
          <p className="text-[11px] text-slate-400">{business.address}</p>
          <p className="text-[11px] text-slate-400">{business.phone}</p>
        </div>
        <div className="border-t border-dashed border-slate-300 pt-2 dark:border-slate-700">
          <div className="flex justify-between">
            <span>No. Struk</span>
            <span>{transaction.code}</span>
          </div>
          <div className="flex justify-between">
            <span>Tanggal</span>
            <span>{formatDate(transaction.date, true)}</span>
          </div>
          <div className="flex justify-between">
            <span>Kasir</span>
            <span>{transaction.cashierName}</span>
          </div>
        </div>
        <div className="space-y-1.5 border-t border-dashed border-slate-300 pt-2 dark:border-slate-700">
          {transaction.items.map((item) => (
            <div key={item.productId}>
              <div className="flex justify-between">
                <span>{item.name}</span>
                <span>{formatCurrency(item.price * item.qty)}</span>
              </div>
              <div className="text-[11px] text-slate-400">
                {item.qty} x {formatCurrency(item.price)} {item.note ? `· ${item.note}` : ""}
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-1 border-t border-dashed border-slate-300 pt-2 dark:border-slate-700">
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Subtotal</span>
            <span>{formatCurrency(transaction.subtotal ?? transaction.total - (transaction.extraCharge ?? 0))}</span>
          </div>
          {(transaction.extraCharge ?? 0) > 0 && (
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Biaya Tambahan</span>
              <span>{formatCurrency(transaction.extraCharge ?? 0)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold">
            <span>TOTAL</span>
            <span>{formatCurrency(transaction.total)}</span>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>Metode</span>
            <span className="uppercase">{transaction.paymentMethod}</span>
          </div>
          {transaction.cashReceived !== undefined && (
            <>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Bayar</span>
                <span>{formatCurrency(transaction.cashReceived)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Kembali</span>
                <span>{formatCurrency(transaction.change ?? 0)}</span>
              </div>
            </>
          )}
        </div>
        <p className="border-t border-dashed border-slate-300 pt-2 text-center text-[11px] text-slate-400 dark:border-slate-700">
          {business.footerNote}
        </p>
      </div>
      <div className="mt-5 flex gap-2">
        <Button variant="outline" className="flex-1" icon="fi fi-rr-print" onClick={() => window.print()}>
          Cetak
        </Button>
        <Button className="flex-1" onClick={onClose}>
          Selesai
        </Button>
      </div>
    </Modal>
  );
}
