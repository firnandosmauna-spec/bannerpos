import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Edit2, Trash2, X, User, Shield, Lock } from "lucide-react";
import { User as UserType } from "@/types/pos";

interface MasterPenggunaProps {
  users: UserType[];
  onAdd: (item: UserType) => void;
  onUpdate: (item: UserType) => void;
  onDelete: (id: string) => void;
}

export default function MasterPengguna({ users, onAdd, onUpdate, onDelete }: MasterPenggunaProps) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UserType | null>(null);

  const filtered = users.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-[#1E293B]">Daftar Pengguna Sistem</h3>
        </div>
        <button
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-bold bg-[#FF6B1A] text-[#FFFFFF] transition-all hover:bg-[#FFB347] shadow-md shadow-orange-500/20"
        >
          <Plus size={16} /> Tambah Pengguna
        </button>
      </div>

      <div className="relative mb-6 shadow-sm">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" />
        <input
          type="text"
          placeholder="Cari pengguna..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-11 pr-4 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#FF6B1A] transition-all"
        />
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] overflow-x-auto shadow-sm">
        <div className="min-w-[500px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#F8FAFC] z-10 border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4 text-[10px] lg:text-xs font-bold text-[#64748B] uppercase tracking-wider">Username</th>
                <th className="px-6 py-4 text-[10px] lg:text-xs font-bold text-[#64748B] uppercase tracking-wider">Nama Lengkap</th>
                <th className="px-6 py-4 text-[10px] lg:text-xs font-bold text-[#64748B] uppercase tracking-wider">Hak Akses</th>
                <th className="px-6 py-4 text-[10px] lg:text-xs font-bold text-[#64748B] uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-[#FF6B1A] text-sm font-bold bg-[#FF6B1A]/5 px-2 py-1 rounded">@{item.username}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#F1F5F9] flex items-center justify-center text-[#1E293B]">
                        <User size={14} />
                      </div>
                      <span className="font-bold text-[#1E293B] text-sm">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit ${item.role === "admin" ? "bg-purple-500/10 text-purple-500 border border-purple-500/20" : "bg-blue-500/10 text-blue-500 border border-blue-500/20"}`}>
                      <Shield size={10} />
                      {item.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#FF6B1A]/10 hover:text-[#FF6B1A] transition-all"><Edit2 size={14} /></button>
                      <button onClick={() => window.confirm("Hapus akun ini?") && onDelete(item.id)} className="p-1.5 rounded-lg text-[#64748B] hover:bg-red-50 hover:text-red-600 transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-[#8A8A95] text-sm">Tidak ada pengguna ditemukan.</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <Modal
            item={editingItem}
            onClose={() => setIsModalOpen(false)}
            onSave={(data) => {
              if (editingItem) onUpdate({ ...editingItem, ...data });
              else onAdd({ ...data, id: Date.now().toString() } as UserType);
              setIsModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ item, onClose, onSave }: { item: UserType | null, onClose: () => void, onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    username: item?.username || "",
    name: item?.name || "",
    role: item?.role || "kasir",
    password: "",
    permissions: item?.permissions || ["dashboard", "pos", "production-tracking", "report-transactions", "master-produk", "master-kategori", "master-bahan", "stock-card"],
  });

  const availablePermissions = [
    { id: "dashboard", label: "Dashboard Utama" },
    { id: "pos", label: "Kasir / POS" },
    { id: "production-tracking", label: "Antrian Produksi" },
    { id: "report-transactions", label: "Riwayat Transaksi" },
    { id: "master-produk", label: "Katalog Produk" },
    { id: "master-bahan", label: "Stok Bahan" },
    { id: "stock-card", label: "Kartu Stok" },
    { id: "purchase-materials", label: "Pembelian Bahan" },
    { id: "master-mesin", label: "Mesin Cetak" },
    { id: "master-karyawan", label: "Master Karyawan" },
    { id: "master-pelanggan", label: "Master Pelanggan" },
    { id: "master-supplier", label: "Master Supplier" },
    { id: "report-sales", label: "Laporan Penjualan" },
    { id: "report-purchases", label: "Laporan Pembelian" },
    { id: "report-damaged", label: "Laporan Barang Rusak" },
    { id: "report-profit", label: "Laporan Laba & Rugi" },
  ];

  const handleTogglePermission = (id: string) => {
    setFormData(prev => {
      const current = prev.permissions;
      if (current.includes(id)) {
        return { ...prev, permissions: current.filter(p => p !== id) };
      } else {
        return { ...prev, permissions: [...current, id] };
      }
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-md bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[#E2E8F0]">
          <h3 className="text-lg font-bold text-[#1E293B]">{item ? "Edit Pengguna" : "Tambah Pengguna Baru"}</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-[#64748B] uppercase mb-1.5 block tracking-wider">Username</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={14} />
              <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} disabled={!!item} className={`w-full border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none transition-all ${item ? 'bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed' : 'bg-[#F8FAFC] text-[#1E293B] focus:border-[#FF6B1A]'}`} placeholder="Contoh: kasir01" />
            </div>
            {item && <p className="text-[10px] text-[#8A8A95] mt-1.5">* Username tidak dapat diubah setelah akun dibuat.</p>}
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#64748B] uppercase mb-1.5 block tracking-wider">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={14} />
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#FF6B1A] transition-all" placeholder="Masukkan nama lengkap" />
            </div>
          </div>
          
          {item ? (
            <div>
              <label className="text-[10px] font-bold text-[#64748B] uppercase mb-1.5 block tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={14} />
                <input type="password" value="••••••••" disabled className="w-full bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#94A3B8] outline-none cursor-not-allowed" />
              </div>
              <p className="text-[10px] text-[#8A8A95] mt-1.5">* Password dienkripsi dengan aman oleh sistem. Hanya dapat diubah oleh pemilik akun saat login.</p>
            </div>
          ) : (
            <div>
              <label className="text-[10px] font-bold text-[#64748B] uppercase mb-1.5 block tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={14} />
                <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#FF6B1A] transition-all" placeholder="Minimal 6 karakter (opsional)" />
              </div>
            </div>
          )}
          <div>
            <label className="text-[10px] font-bold text-[#64748B] uppercase mb-1.5 block tracking-wider">Hak Akses (Role)</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={14} />
              <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as any })} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#FF6B1A] transition-all">
                <option value="admin">Admin (Akses Penuh)</option>
                <option value="kasir">Kasir (Akses Terbatas)</option>
              </select>
            </div>
          </div>

          <AnimatePresence>
            {formData.role === "kasir" && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="pt-2">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase mb-2 block tracking-wider">Kustomisasi Menu Kasir</label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                    {availablePermissions.map(perm => (
                      <label key={perm.id} className="flex items-center gap-2 text-xs text-[#1E293B] cursor-pointer hover:bg-[#F8FAFC] p-1.5 rounded-lg border border-transparent hover:border-[#E2E8F0] transition-all">
                        <input type="checkbox" checked={formData.permissions.includes(perm.id)} onChange={() => handleTogglePermission(perm.id)} className="rounded text-[#FF6B1A] focus:ring-[#FF6B1A]" />
                        <span className="truncate">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="p-6 border-t border-[#E2E8F0] flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-[#1E293B] text-sm font-medium hover:bg-[#F8FAFC] transition-all">Batal</button>
          <button onClick={() => onSave(formData)} className="flex-1 py-2.5 rounded-xl bg-[#FF6B1A] text-[#FFFFFF] font-bold text-sm transition-all hover:bg-[#FFB347] shadow-md shadow-orange-500/20">Simpan Pengguna</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
