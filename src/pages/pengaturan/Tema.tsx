import { useRef } from "react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { useTheme } from "../../context/ThemeContext";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { resetDummyData } from "../../dummy-data/seed";
import { backupService } from "../../services/settingsService";
import { cn } from "../../utils/cn";

export default function Tema() {
  const { theme, setTheme } = useTheme();
  const confirm = useConfirm();
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleReset() {
    const ok = await confirm({
      title: "Reset data demo?",
      message: "Semua data (produk, transaksi, pengeluaran, user) akan dikembalikan ke kondisi awal.",
      danger: true,
      confirmLabel: "Ya, Reset",
    });
    if (!ok) return;
    await resetDummyData();
    showToast("success", "Data demo berhasil direset");
    setTimeout(() => window.location.reload(), 800);
  }

  async function handleBackup() {
    await backupService.downloadBackup();
    showToast("success", "Backup berhasil diunduh");
  }

  async function handleRestore(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const ok = await confirm({
      title: "Restore data dari file?",
      message: "Data saat ini akan ditimpa dengan data dari file backup.",
      danger: true,
      confirmLabel: "Ya, Restore",
    });
    if (!ok) {
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    try {
      await backupService.restoreFromFile(file);
      showToast("success", "Data berhasil direstore");
      setTimeout(() => window.location.reload(), 800);
    } catch {
      showToast("error", "File backup tidak valid");
    }
  }

  return (
    <div className="fade-in space-y-5">
      <Breadcrumb items={[{ label: "Pengaturan" }, { label: "Tema & Data" }]} />
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tema & Data</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sesuaikan tampilan dan kelola data aplikasi.</p>
      </div>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Preferensi Tema</h3>
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            onClick={() => setTheme("light")}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200",
              theme === "light" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-slate-200 dark:border-slate-700"
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-amber-500 shadow-sm">
              <i className="fi fi-rr-sun" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Light Mode</p>
              <p className="text-xs text-slate-400">Tampilan terang, cocok untuk siang hari</p>
            </div>
          </button>
          <button
            onClick={() => setTheme("dark")}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-4 text-left transition-all duration-200",
              theme === "dark" ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-slate-200 dark:border-slate-700"
            )}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-indigo-400 shadow-sm">
              <i className="fi fi-rr-moon" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Dark Mode</p>
              <p className="text-xs text-slate-400">Tampilan gelap, nyaman di mata</p>
            </div>
          </button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Backup & Restore Data</h3>
        </CardHeader>
        <CardBody className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Backup Data</p>
            <p className="mt-1 text-xs text-slate-400">Unduh seluruh data aplikasi dalam format JSON.</p>
            <Button variant="outline" className="mt-3" icon="fi fi-rr-download" onClick={handleBackup}>
              Download Backup
            </Button>
          </div>
          <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Restore Data</p>
            <p className="mt-1 text-xs text-slate-400">Unggah file backup JSON untuk mengembalikan data.</p>
            <input ref={fileRef} type="file" accept="application/json" onChange={handleRestore} className="hidden" id="restore-input" />
            <Button variant="outline" className="mt-3" icon="fi fi-rr-upload" onClick={() => fileRef.current?.click()}>
              Upload Backup
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Reset Data Demo</h3>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-dashed border-red-200 bg-red-50/50 p-4 dark:border-red-500/30 dark:bg-red-500/5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">Reset ke Data Awal</p>
              <p className="mt-1 text-xs text-red-500/80 dark:text-red-400/70">Semua perubahan akan hilang dan diganti data dummy.</p>
            </div>
            <Button variant="danger" icon="fi fi-rr-refresh" onClick={handleReset}>
              Reset Sekarang
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
