import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Edit2, Trash2, X, User, Phone, Briefcase } from "lucide-react";
import { Employee } from "@/types/pos";

interface MasterKaryawanProps {
  employees: Employee[];
  onAdd: (item: Employee) => void;
  onUpdate: (item: Employee) => void;
  onDelete: (id: string) => void;
}

export default function MasterKaryawan({ employees, onAdd, onUpdate, onDelete }: MasterKaryawanProps) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Employee | null>(null);

  const filtered = employees.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] p-4 lg:p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-[#1E293B]" style={{ fontFamily: "Syne, sans-serif" }}>Master Karyawan</h2>
          <p className="text-xs lg:text-sm text-[#64748B]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Kelola data staf dan tim percetakan</p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-[#FF6B1A] text-[#FFFFFF] transition-all hover:bg-[#FFB347] shadow-md shadow-orange-500/20"
        >
          <Plus size={18} /> Tambah Karyawan
        </button>
      </div>

      <div className="relative mb-6 shadow-sm">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" />
        <input
          type="text"
          placeholder="Cari karyawan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-11 pr-4 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#FF6B1A] transition-all"
        />
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] overflow-x-auto shadow-sm">
        <div className="min-w-[600px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#F8FAFC] z-10 border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4 text-[10px] lg:text-xs font-bold text-[#64748B] uppercase tracking-wider">Karyawan</th>
                <th className="px-6 py-4 text-[10px] lg:text-xs font-bold text-[#64748B] uppercase tracking-wider">Jabatan</th>
                <th className="px-6 py-4 text-[10px] lg:text-xs font-bold text-[#64748B] uppercase tracking-wider">Kontak</th>
                <th className="px-6 py-4 text-[10px] lg:text-xs font-bold text-[#64748B] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[10px] lg:text-xs font-bold text-[#64748B] uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FF6B1A]/10 flex items-center justify-center text-[#FF6B1A]">
                        <User size={14} />
                      </div>
                      <span className="font-bold text-[#1E293B] text-sm">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#1E293B] text-sm">{item.role}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[#64748B] text-sm">
                      <Phone size={12} />
                      {item.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${item.status === "aktif" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#FF6B1A]/10 hover:text-[#FF6B1A] transition-all"><Edit2 size={14} /></button>
                      <button onClick={() => window.confirm("Hapus karyawan ini?") && onDelete(item.id)} className="p-1.5 rounded-lg text-[#64748B] hover:bg-red-50 hover:text-red-600 transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-[#8A8A95] text-sm">Tidak ada karyawan ditemukan.</p>
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
              else onAdd({ ...data, id: Date.now().toString() } as Employee);
              setIsModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ item, onClose, onSave }: { item: Employee | null, onClose: () => void, onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    role: item?.role || "",
    phone: item?.phone || "",
    status: item?.status || "aktif",
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-md bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[#E2E8F0]">
          <h3 className="text-lg font-bold text-[#1E293B]">{item ? "Edit Karyawan" : "Tambah Karyawan Baru"}</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-[#64748B] uppercase mb-1.5 block tracking-wider">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={14} />
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#FF6B1A] transition-all" placeholder="Masukkan nama karyawan" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#64748B] uppercase mb-1.5 block tracking-wider">Posisi / Jabatan</label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={14} />
              <input 
                type="text"
                list="role-suggestions"
                value={formData.role} 
                onChange={(e) => setFormData({ ...formData, role: e.target.value })} 
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#FF6B1A] transition-all"
                placeholder="Pilih atau ketik jabatan manual"
              />
              <datalist id="role-suggestions">
                <option value="Operator Mesin" />
                <option value="Desainer Grafis" />
                <option value="Kasir" />
                <option value="Admin Produksi" />
                <option value="Manajer" />
              </datalist>
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#64748B] uppercase mb-1.5 block tracking-wider">Nomor Telepon</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={14} />
              <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#FF6B1A] transition-all" placeholder="Contoh: 0812..." />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#64748B] uppercase mb-1.5 block tracking-wider">Status</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#FF6B1A] transition-all">
              <option value="aktif">Aktif</option>
              <option value="nonaktif">Non-Aktif</option>
            </select>
          </div>
        </div>
        <div className="p-6 border-t border-[#E2E8F0] flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-[#1E293B] text-sm font-medium hover:bg-[#F8FAFC] transition-all">Batal</button>
          <button onClick={() => onSave(formData)} className="flex-1 py-2.5 rounded-xl bg-[#FF6B1A] text-[#FFFFFF] font-bold text-sm transition-all hover:bg-[#FFB347] shadow-md shadow-orange-500/20">Simpan Karyawan</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
