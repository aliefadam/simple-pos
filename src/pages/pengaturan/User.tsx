import { useEffect, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { Input } from "../../components/ui/Field";
import { SelectDropdown } from "../../components/ui/SelectDropdown";
import { EmptyState } from "../../components/ui/EmptyState";
import { Skeleton, SkeletonRow } from "../../components/ui/Skeleton";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { RefreshButton } from "../../components/ui/RefreshButton";
import { useConfirm } from "../../context/ConfirmContext";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { userService } from "../../services/userService";
import { formatDate } from "../../utils/format";
import type { Role, User } from "../../types";

const emptyForm = { name: "", username: "", password: "", role: "karyawan" as Role, active: true };

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const confirm = useConfirm();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [resetTarget, setResetTarget] = useState<User | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resettingPassword, setResettingPassword] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setUsers(await userService.getAll());
  }

  useEffect(() => {
    let active = true;
    const t = setTimeout(async () => {
      if (!active) return;
      await load();
      if (active) setLoading(false);
    }, 300);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    setLoading(true);
    try {
      await load();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(u: User) {
    setEditing(u);
    setForm({ name: u.name, username: u.username, password: "", role: u.role, active: u.active });
    setModalOpen(true);
  }

  function openResetPassword(u: User) {
    setResetTarget(u);
    setResetPassword("");
    setResetModalOpen(true);
  }

  async function handleSubmit() {
    if (!form.name.trim() || !form.username.trim()) {
      showToast("error", "Lengkapi data user");
      return;
    }
    if (!editing && !form.password.trim()) {
      showToast("error", "Password wajib diisi untuk user baru");
      return;
    }
    if (editing) {
      await userService.update(editing.id, {
        name: form.name,
        username: form.username,
        role: form.role,
        active: form.active,
      });
      showToast("success", "User diperbarui");
    } else {
      await userService.create(form);
      showToast("success", "User ditambahkan");
    }
    setModalOpen(false);
    await load();
  }

  async function handleDelete(u: User) {
    if (u.id === currentUser?.id) {
      showToast("error", "Tidak dapat menghapus akun sendiri");
      return;
    }
    const ok = await confirm({ title: `Hapus user "${u.name}"?`, danger: true, confirmLabel: "Ya, Hapus" });
    if (!ok) return;
    await userService.remove(u.id);
    await load();
    showToast("success", "User dihapus");
  }

  async function handleResetPassword() {
    if (!resetTarget) return;
    if (!resetPassword.trim()) {
      showToast("error", "Masukkan password baru");
      return;
    }

    setResettingPassword(true);
    try {
      await userService.update(resetTarget.id, { password: resetPassword });
      showToast("success", `Password ${resetTarget.name} berhasil direset`);
      setResetModalOpen(false);
      setResetTarget(null);
      setResetPassword("");
      await load();
    } finally {
      setResettingPassword(false);
    }
  }

  return (
    <div className="fade-in space-y-5">
      <Breadcrumb items={[{ label: "Pengaturan" }, { label: "User" }]} />
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manajemen User</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Kelola akses Owner dan Karyawan.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <RefreshButton loading={refreshing} onClick={handleRefresh} />
          <Button icon="fi fi-rr-user-add" onClick={openCreate}>
            Tambah User
          </Button>
        </div>
      </div>

      <Card>
        <div className="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4">
                <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))
          ) : users.length === 0 ? (
            <EmptyState icon="fi fi-rr-users" title="Belum ada user" />
          ) : (
            users.map((u) => (
              <div key={u.id} className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-xs font-semibold text-white">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-700 dark:text-slate-200">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.username}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button onClick={() => openResetPassword(u)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-500/10" title="Reset password">
                      <i className="fi fi-rr-key text-sm" />
                    </button>
                    <button onClick={() => openEdit(u)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800">
                      <i className="fi fi-rr-edit text-sm" />
                    </button>
                    <button onClick={() => handleDelete(u)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10">
                      <i className="fi fi-rr-trash text-sm" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone={u.role === "owner" ? "indigo" : "blue"}>{u.role}</Badge>
                  <Badge tone={u.active ? "green" : "slate"}>{u.active ? "Aktif" : "Nonaktif"}</Badge>
                  <span className="text-xs text-slate-400">Bergabung {formatDate(u.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400 dark:border-slate-800">
                <th className="px-5 py-3">Nama</th>
                <th className="px-5 py-3">Username</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Bergabung</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState icon="fi fi-rr-users" title="Belum ada user" />
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-50 transition hover:bg-slate-50/60 dark:border-slate-800/60 dark:hover:bg-slate-800/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-xs font-semibold text-white">
                          {u.name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{u.username}</td>
                    <td className="px-5 py-3"><Badge tone={u.role === "owner" ? "indigo" : "blue"}>{u.role}</Badge></td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-3"><Badge tone={u.active ? "green" : "slate"}>{u.active ? "Aktif" : "Nonaktif"}</Badge></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openResetPassword(u)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-500/10" title="Reset password">
                          <i className="fi fi-rr-key text-sm" />
                        </button>
                        <button onClick={() => openEdit(u)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800">
                          <i className="fi fi-rr-edit text-sm" />
                        </button>
                        <button onClick={() => handleDelete(u)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10">
                          <i className="fi fi-rr-trash text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit User" : "Tambah User"}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit}>{editing ? "Simpan" : "Tambah"}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Nama Lengkap" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Username" required value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
          <Input label={editing ? "Password" : "Password Baru"} type="password" required={!editing} value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder={editing ? "Kosongkan, gunakan reset password jika ingin mengubah" : "Masukkan password"} />
          <SelectDropdown
            label="Role"
            value={form.role}
            onChange={(role) => setForm((f) => ({ ...f, role: role as Role }))}
            options={[
              { value: "karyawan", label: "Karyawan" },
              { value: "owner", label: "Owner" },
            ]}
          />
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="h-4 w-4 rounded border-slate-300 text-indigo-600" />
            Akun aktif
          </label>
        </div>
      </Modal>

      <Modal
        open={resetModalOpen}
        onClose={() => {
          if (resettingPassword) return;
          setResetModalOpen(false);
          setResetTarget(null);
          setResetPassword("");
        }}
        title="Reset Password User"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setResetModalOpen(false);
                setResetTarget(null);
                setResetPassword("");
              }}
              disabled={resettingPassword}
            >
              Batal
            </Button>
            <Button onClick={handleResetPassword} loading={resettingPassword}>
              Simpan Password Baru
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Masukkan password baru untuk{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {resetTarget?.name}
            </span>
            .
          </p>
          <Input
            label="Password Baru"
            type="password"
            required
            value={resetPassword}
            onChange={(e) => setResetPassword(e.target.value)}
            placeholder="Masukkan password baru"
          />
        </div>
      </Modal>
    </div>
  );
}
