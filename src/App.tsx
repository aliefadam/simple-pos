import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { ConfirmProvider } from "./context/ConfirmContext";
import { AuthProvider } from "./context/AuthContext";
import { AppOfflineScreen } from "./components/AppOfflineScreen";
import { ToastContainer } from "./components/ui/ToastContainer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TransaksiBaru from "./pages/kasir/TransaksiBaru";
import RiwayatTransaksi from "./pages/kasir/RiwayatTransaksi";
import RiwayatShift from "./pages/kasir/RiwayatShift";
import Kategori from "./pages/master/Kategori";
import Produk from "./pages/master/Produk";
import StokProduk from "./pages/master/StokProduk";
import BahanBaku from "./pages/master/BahanBaku";
import StokBahanBaku from "./pages/master/StokBahanBaku";
import Pengeluaran from "./pages/keuangan/Pengeluaran";
import Laporan from "./pages/keuangan/Laporan";
import UserManagement from "./pages/pengaturan/User";
import Profil from "./pages/pengaturan/Profil";
import Tema from "./pages/pengaturan/Tema";

function AppRouter() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOnline) {
    return <AppOfflineScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/kasir/transaksi-baru" element={<TransaksiBaru />} />
          <Route path="/kasir/riwayat" element={<RiwayatTransaksi />} />
          <Route
            path="/kasir/riwayat-shift"
            element={
              <ProtectedRoute roles={["owner"]}>
                <RiwayatShift />
              </ProtectedRoute>
            }
          />

          <Route
            path="/master/kategori"
            element={
              <ProtectedRoute roles={["owner"]}>
                <Kategori />
              </ProtectedRoute>
            }
          />
          <Route
            path="/master/produk"
            element={
              <ProtectedRoute roles={["owner"]}>
                <Produk />
              </ProtectedRoute>
            }
          />
          <Route
            path="/master/bahan-baku"
            element={
              <ProtectedRoute roles={["owner"]}>
                <BahanBaku />
              </ProtectedRoute>
            }
          />
          <Route
            path="/master/stok/produk"
            element={
              <ProtectedRoute roles={["owner"]}>
                <StokProduk />
              </ProtectedRoute>
            }
          />
          <Route
            path="/master/stok/bahan-baku"
            element={
              <ProtectedRoute roles={["owner"]}>
                <StokBahanBaku />
              </ProtectedRoute>
            }
          />
          <Route
            path="/keuangan/pengeluaran"
            element={
              <ProtectedRoute>
                <Pengeluaran />
              </ProtectedRoute>
            }
          />
          <Route
            path="/keuangan/laporan"
            element={
              <ProtectedRoute roles={["owner"]}>
                <Laporan />
              </ProtectedRoute>
            }
          />

          <Route
            path="/pengaturan/user"
            element={
              <ProtectedRoute roles={["owner"]}>
                <UserManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pengaturan/profil"
            element={
              <ProtectedRoute roles={["owner"]}>
                <Profil />
              </ProtectedRoute>
            }
          />
          <Route path="/pengaturan/tema" element={<Tema />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ConfirmProvider>
          <AuthProvider>
            <AppRouter />
            <ToastContainer />
          </AuthProvider>
        </ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
