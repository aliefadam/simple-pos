import { AppBrand } from "./AppBrand";
import { Button } from "./ui/Button";

export function AppOfflineScreen() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-4 dark:bg-[#0b0f19]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl dark:bg-amber-900/10" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-900/10" />
      </div>

      <div className="scale-in relative z-10 w-full max-w-sm rounded-3xl border border-slate-200/70 bg-white p-7 text-center shadow-2xl shadow-slate-300/30 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
        <div className="flex justify-center">
          <AppBrand compact />
        </div>

        <div className="mx-auto mt-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400">
          <i className="fi fi-rr-wifi-slash text-2xl" />
        </div>

        <h1 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
          Tidak Ada Koneksi Internet
        </h1>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          Aplikasi terbuka dari cache, tapi sinkronisasi data ke server belum
          bisa dilakukan. Periksa Wi-Fi atau data seluler Anda.
        </p>

        <Button
          className="mt-6 w-full"
          size="lg"
          icon="fi fi-rr-refresh"
          onClick={() => window.location.reload()}
        >
          Coba Lagi
        </Button>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
          Menunggu koneksi kembali…
        </p>
      </div>
    </div>
  );
}
