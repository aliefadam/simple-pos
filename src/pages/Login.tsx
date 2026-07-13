import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import { Button } from "../components/ui/Button";

export default function Login() {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState("owner");
  const [password, setPassword] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      login(username, password, remember)
        .then((user) => {
          showToast(
            "success",
            `Selamat datang, ${user.name}`,
            "Anda berhasil masuk ke Kasirku POS",
          );
          navigate("/");
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        })
        .finally(() => {
          setLoading(false);
        });
    }, 500);
  }

  function fillDemo(role: "owner" | "kasir") {
    if (role === "owner") {
      setUsername("owner");
      setPassword("password");
    } else {
      setUsername("kasir");
      setPassword("password");
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 p-4 dark:bg-[#0b0f19]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-200/40 blur-3xl dark:bg-indigo-900/20" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-violet-200/40 blur-3xl dark:bg-violet-900/20" />
      </div>

      <button
        onClick={toggleTheme}
        className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
      >
        <i
          className={`fi ${theme === "dark" ? "fi-rr-sun" : "fi-rr-moon"} text-base`}
        />
      </button>

      <div className="relative z-10 grid w-full max-w-4xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-2xl shadow-slate-300/30 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none lg:grid-cols-2">
        <div className="hidden flex-col justify-between bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-10 text-white lg:flex">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <i className="fi fi-rr-shop text-lg" />
            </div>
            <span className="text-lg font-bold">Kasirku POS</span>
          </div>

          <div className="slide-up space-y-6">
            <div className="grid grid-cols-2 gap-3"></div>
            <h2 className="text-2xl font-bold leading-snug">
              Kelola kasir warung & angkringan Anda dengan lebih mudah.
            </h2>
            <p className="text-sm text-indigo-100">
              Catat transaksi, pantau stok, dan lihat laporan usaha kapan saja —
              semua dalam satu aplikasi.
            </p>
          </div>

          <p className="text-xs text-indigo-200">
            © {new Date().getFullYear()} Kasirku POS. Internal use only.
          </p>
        </div>

        <div className="p-8 sm:p-10">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <i className="fi fi-rr-shop text-lg" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              Kasirku POS
            </span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Masuk ke akun Anda
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Silakan login menggunakan akun karyawan atau owner.
          </p>

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={() => fillDemo("owner")}
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400"
            >
              Isi akun Owner
            </button>
            <button
              type="button"
              onClick={() => fillDemo("kasir")}
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400"
            >
              Isi akun Karyawan
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Username
              </label>
              <div className="relative">
                <i className="fi fi-rr-user absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Password
              </label>
              <div className="relative">
                <i className="fi fi-rr-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                >
                  <i
                    className={`fi ${showPassword ? "fi-rr-eye-crossed" : "fi-rr-eye"} text-sm`}
                  />
                </button>
              </div>
            </div>

            {error && (
              <div className="fade-in flex items-center gap-2 rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                <i className="fi fi-rr-triangle-warning" />
                {error}
              </div>
            )}

            <div className="flex items-center">
              <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Ingat saya
              </label>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={loading}
            >
              Masuk
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
