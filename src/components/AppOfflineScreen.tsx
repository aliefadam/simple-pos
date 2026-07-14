export function AppOfflineScreen() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-red-500/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md rounded-[28px] border border-white/10 bg-white/5 p-7 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Logo aplikasi"
            className="h-14 w-14 rounded-2xl object-cover ring-1 ring-white/10"
          />
          <div>
            <p className="text-lg font-bold">Angkringan POS</p>
            <p className="text-sm text-slate-300">Aplikasi sedang offline</p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
          <p className="text-sm font-semibold text-red-100">
            Tidak ada koneksi internet
          </p>
          <p className="mt-1 text-sm leading-6 text-red-50/85">
            Aplikasi berhasil dibuka, tetapi sinkronisasi data ke server tidak
            bisa dilakukan sekarang. Sambungkan internet lalu coba lagi.
          </p>
        </div>

        <div className="mt-5 space-y-2 text-sm text-slate-300">
          <p>Apa yang bisa Anda lakukan:</p>
          <p>1. Pastikan data seluler atau Wi-Fi aktif.</p>
          <p>2. Buka ulang aplikasi setelah koneksi kembali.</p>
          <p>3. Tekan tombol di bawah untuk mencoba memuat ulang.</p>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-2xl bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 active:scale-[0.98]"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}
