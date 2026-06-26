import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Edit2, Trash2, X, User, Phone, MapPin } from "lucide-react";
import { Customer } from "@/types/pos";

interface MasterPelangganProps {
  customers: Customer[];
  onAdd: (item: Customer) => void;
  onUpdate: (item: Customer) => void;
  onDelete: (id: string) => void;
}

export default function MasterPelanggan({ customers, onAdd, onUpdate, onDelete }: MasterPelangganProps) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Customer | null>(null);

  const filtered = customers.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.phone.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] p-4 lg:p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-[#1E293B]" style={{ fontFamily: "Syne, sans-serif" }}>Master Pelanggan</h2>
          <p className="text-xs lg:text-sm text-[#64748B]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Database loyalitas pelanggan dan riwayat pesanan</p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-[#FF6B1A] text-[#FFFFFF] transition-all hover:bg-[#FFB347] shadow-md shadow-orange-500/20"
        >
          <Plus size={18} /> Tambah Pelanggan
        </button>
      </div>

      <div className="relative mb-6 shadow-sm">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" />
        <input
          type="text"
          placeholder="Cari pelanggan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-11 pr-4 py-2.5 text-sm text-[#1E293B] outline-none focus:border-[#FF6B1A] transition-all"
        />
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] overflow-x-auto shadow-sm">
        <div className="min-w-[700px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#F8FAFC] z-10 border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4 text-[10px] lg:text-xs font-bold text-[#64748B] uppercase tracking-wider">Nama Pelanggan</th>
                <th className="px-6 py-4 text-[10px] lg:text-xs font-bold text-[#64748B] uppercase tracking-wider">Kontak</th>
                <th className="px-6 py-4 text-[10px] lg:text-xs font-bold text-[#64748B] uppercase tracking-wider">Alamat</th>
                <th className="px-6 py-4 text-[10px] lg:text-xs font-bold text-[#64748B] uppercase tracking-wider text-center">Total Order</th>
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
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[#64748B] text-xs">
                      <Phone size={12} />
                      {item.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[#64748B] text-xs max-w-[200px] truncate">
                      <MapPin size={12} className="shrink-0" />
                      {item.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-2 py-0.5 rounded-full bg-[#FF6B1A]/10 text-[#FF6B1A] text-[10px] font-bold border border-[#FF6B1A]/20">
                      {item.totalOrders}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#FF6B1A]/10 hover:text-[#FF6B1A] transition-all"><Edit2 size={14} /></button>
                      <button onClick={() => window.confirm("Hapus pelanggan ini?") && onDelete(item.id)} className="p-1.5 rounded-lg text-[#64748B] hover:bg-red-50 hover:text-red-600 transition-all"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-[#8A8A95] text-sm">Tidak ada pelanggan ditemukan.</p>
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
              else onAdd({ ...data, id: Date.now().toString(), totalOrders: 0 } as Customer);
              setIsModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ item, onClose, onSave }: { item: Customer | null, onClose: () => void, onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    phone: item?.phone || "",
    address: item?.address || "",
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-md bg-[#242429] border border-[#2E2E36] rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-[#2E2E36]">
          <h3 className="text-lg font-bold text-[#F0EDE8]">{item ? "Edit Pelanggan" : "Tambah Pelanggan Baru"}</h3>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="text-[10px] font-bold text-[#8A8A95] uppercase mb-1.5 block tracking-wider">Nama Lengkap</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A95]" size={14} />
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#1A1A1F] border border-[#2E2E36] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#F0EDE8] outline-none focus:border-[#FF6B1A] transition-all" placeholder="Masukkan nama pelanggan" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#8A8A95] uppercase mb-1.5 block tracking-wider">Nomor Telepon</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8A95]" size={14} />
              <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-[#1A1A1F] border border-[#2E2E36] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#F0EDE8] outline-none focus:border-[#FF6B1A] transition-all" placeholder="Contoh: 0812..." />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#8A8A95] uppercase mb-1.5 block tracking-wider">Alamat</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-[#8A8A95]" size={14} />
              <textarea value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full bg-[#1A1A1F] border border-[#2E2E36] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#F0EDE8] outline-none focus:border-[#FF6B1A] transition-all h-24 resize-none" placeholder="Masukkan alamat lengkap" />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-[#2E2E36] flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#2E2E36] text-[#F0EDE8] text-sm font-medium hover:bg-[#1A1A1F] transition-all">Batal</button>
          <button onClick={() => onSave(formData)} className="flex-1 py-2.5 rounded-xl bg-[#FF6B1A] text-[#1A1A1F] font-bold text-sm transition-all hover:bg-[#FFB347]">Simpan Pelanggan</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
