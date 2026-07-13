import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input, Textarea } from "../../components/ui/Field";
import { Breadcrumb } from "../../components/ui/Breadcrumb";
import { useToast } from "../../context/ToastContext";
import { settingsService } from "../../services/settingsService";

export default function Profil() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", address: "", phone: "", footerNote: "" });

  useEffect(() => {
    const profile = settingsService.get().businessProfile;
    setForm(profile);
  }, []);

  function handleSave() {
    settingsService.update(form);
    showToast("success", "Profil usaha disimpan");
  }

  return (
    <div className="fade-in space-y-5">
      <Breadcrumb items={[{ label: "Pengaturan" }, { label: "Profil Usaha" }]} />
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profil Usaha</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Informasi ini akan tampil di struk transaksi.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Informasi Usaha</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            <Input label="Nama Usaha" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            <Textarea label="Alamat" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            <Input label="No. Telepon" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            <Textarea label="Catatan Kaki Struk" value={form.footerNote} onChange={(e) => setForm((f) => ({ ...f, footerNote: e.target.value }))} />
            <Button icon="fi fi-rr-disk" onClick={handleSave}>Simpan Perubahan</Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">Preview Struk</h3>
          </CardHeader>
          <CardBody>
            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center font-mono text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
              <p className="text-sm font-bold">{form.name || "Nama Usaha"}</p>
              <p className="mt-1 text-slate-400">{form.address || "Alamat usaha"}</p>
              <p className="text-slate-400">{form.phone || "No. Telepon"}</p>
              <div className="my-3 border-t border-dashed border-slate-300 dark:border-slate-700" />
              <p className="text-slate-400">{form.footerNote || "Catatan kaki struk"}</p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
