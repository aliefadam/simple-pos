import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import { ConfirmProvider } from "./context/ConfirmContext";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "./components/ui/ToastContainer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardLayout } from "./layouts/DashboardLayout";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TransaksiBaru from "./pages/kasir/TransaksiBaru";
import RiwayatTransaksi from "./pages/kasir/RiwayatTransaksi";
import Kategori from "./pages/master/Kategori";
import Produk from "./pages/master/Produk";
import Stok from "./pages/master/Stok";
import Pengeluaran from "./pages/keuangan/Pengeluaran";
import Laporan from "./pages/keuangan/Laporan";
import UserManagement from "./pages/pengaturan/User";
import Profil from "./pages/pengaturan/Profil";
import Tema from "./pages/pengaturan/Tema";

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ConfirmProvider>
          <AuthProvider>
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
                    path="/master/stok"
                    element={
                      <ProtectedRoute roles={["owner"]}>
                        <Stok />
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
            <ToastContainer />
          </AuthProvider>
        </ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
