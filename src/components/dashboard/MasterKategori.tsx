import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Edit2, Trash2, X, Tag, Info } from "lucide-react";
import { Category } from "@/types/pos";

interface MasterKategoriProps {
  categories: Category[];
  onAdd: (item: Category) => void;
  onUpdate: (item: Category) => void;
  onDelete: (id: string) => void;
}

export default function MasterKategori({ categories, onAdd, onUpdate, onDelete }: MasterKategoriProps) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Category | null>(null);

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] p-3 lg:p-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h2 className="text-lg lg:text-xl font-bold text-[#1E293B]" style={{ fontFamily: "Syne, sans-serif" }}>Master Kategori</h2>
          <p className="text-[11px] lg:text-xs text-[#64748B]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Kelola kategori produk dan layanan</p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-[#0EA5E9] text-[#FFFFFF] transition-all hover:bg-[#38BDF8] shadow-md shadow-blue-500/20"
        >
          <Plus size={18} /> Tambah Kategori
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
        <input
          type="text"
          placeholder="Cari kategori..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1E293B] outline-none focus:border-[#0EA5E9] transition-all"
        />
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-[#F8FAFC] z-10 border-b border-[#E2E8F0]">
            <tr>
              <th className="px-4 py-2.5 text-[9px] lg:text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Nama Kategori</th>
              <th className="px-4 py-2.5 text-[9px] lg:text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Deskripsi</th>
              <th className="px-4 py-2.5 text-[9px] lg:text-[10px] font-bold text-[#64748B] uppercase tracking-wider text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#0EA5E9]/10 flex items-center justify-center text-[#0EA5E9]">
                      <Tag size={14} />
                    </div>
                    <span className="font-bold text-[#1E293B] text-[11px] lg:text-xs">{item.name}</span>
                  </div>
                </td>
                <td className="px-4 py-2 text-[#64748B] text-[10px] lg:text-[11px]">{item.description}</td>
                <td className="px-4 py-2 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-1 rounded-lg text-[#64748B] hover:bg-[#0EA5E9]/10 hover:text-[#0EA5E9] transition-all"><Edit2 size={12} /></button>
                    <button onClick={() => window.confirm("Hapus kategori ini?") && onDelete(item.id)} className="p-1 rounded-lg text-[#64748B] hover:bg-red-50 hover:text-red-600 transition-all"><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <Modal
            item={editingItem}
            onClose={() => setIsModalOpen(false)}
            onSave={(data) => {
              if (editingItem) onUpdate({ ...editingItem, ...data });
              else onAdd({ ...data, id: Date.now().toString() } as Category);
              setIsModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ item, onClose, onSave }: { item: Category | null, onClose: () => void, onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    description: item?.description || "",
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-sm bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <h3 className="text-base font-bold text-[#1E293B]">{item ? "Edit Kategori" : "Tambah Kategori Baru"}</h3>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-[10px] font-bold text-[#64748B] uppercase mb-1 block tracking-wider">Nama Kategori</label>
            <div className="relative">
              <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B]" size={12} />
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-8 pr-3 py-2 text-xs text-[#1E293B] outline-none focus:border-[#0EA5E9] transition-all" placeholder="Contoh: Banner" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#64748B] uppercase mb-1 block tracking-wider">Deskripsi</label>
            <div className="relative">
              <Info className="absolute left-2.5 top-2.5 text-[#64748B]" size={12} />
              <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-8 pr-3 py-2 text-xs text-[#1E293B] outline-none focus:border-[#0EA5E9] transition-all h-20 resize-none" placeholder="Deskripsi kategori..." />
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-[#E2E8F0] flex gap-2 bg-[#F8FAFC]">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-[#E2E8F0] text-[#64748B] text-xs font-medium hover:bg-[#FFFFFF] transition-all">Batal</button>
          <button onClick={() => onSave(formData)} className="flex-1 py-2 rounded-xl bg-[#0EA5E9] text-[#FFFFFF] font-bold text-xs transition-all hover:bg-[#38BDF8] shadow-md shadow-blue-500/20">Simpan Kategori</button>
        </div>
      </motion.div>
    </motion.div>
  );
}
