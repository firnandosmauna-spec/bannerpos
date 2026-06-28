import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Edit2, Trash2, X, Tag, Box, Hash, History, RefreshCw, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Material, StockLog } from "@/types/pos";
import { supabase } from "@/lib/supabase";

interface MasterBahanProps {
  materials: Material[];
  onAdd: (item: Material) => void;
  onUpdate: (item: Material) => void;
  onDelete: (id: string) => void;
}

export default function MasterBahan({ materials, onAdd, onUpdate, onDelete }: MasterBahanProps) {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Material | null>(null);
  const [viewHistoryItem, setViewHistoryItem] = useState<Material | null>(null);

  const filtered = materials.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] p-3 lg:p-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h2 className="text-lg lg:text-xl font-bold text-[#1E293B]" style={{ fontFamily: "Syne, sans-serif" }}>Master Bahan</h2>
          <p className="text-[11px] lg:text-xs text-[#64748B]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Kelola stok bahan baku cetak</p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-[#0EA5E9] text-[#FFFFFF] transition-all hover:bg-[#38BDF8] shadow-md shadow-blue-500/20"
        >
          <Plus size={18} /> Tambah Bahan
        </button>
      </div>

      <div className="relative mb-4 shadow-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
        <input
          type="text"
          placeholder="Cari bahan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-3 py-2 text-xs text-[#1E293B] outline-none focus:border-[#0EA5E9] transition-all"
        />
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] overflow-x-auto shadow-sm">
        <div className="min-w-[500px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#F8FAFC] z-10 border-b border-[#E2E8F0]">
              <tr>
                <th className="px-4 py-2.5 text-[9px] lg:text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Nama Bahan</th>
                <th className="px-4 py-2.5 text-[9px] lg:text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Stok</th>
                <th className="px-4 py-2.5 text-[9px] lg:text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Satuan</th>
                <th className="px-4 py-2.5 text-[9px] lg:text-[10px] font-bold text-[#64748B] uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#0EA5E9]/10 flex items-center justify-center text-[#0EA5E9]">
                        <Box size={14} />
                      </div>
                      <span className="font-bold text-[#1E293B] text-[11px] lg:text-xs">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex flex-col">
                      <span className={`text-[11px] lg:text-xs font-bold ${item.stock <= item.minStock ? "text-red-500" : "text-[#1E293B]"}`}>
                        {item.stock}
                      </span>
                      {item.stock <= item.minStock && (
                        <span className="text-[8px] text-red-500 uppercase font-bold tracking-tight">Stok Menipis</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-[#64748B] text-[10px] lg:text-[11px]">{item.unit}</td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setViewHistoryItem(item)} title="Kartu Stok / Riwayat" className="p-1 rounded-lg text-[#64748B] hover:bg-indigo-50 hover:text-indigo-600 transition-all"><History size={12} /></button>
                      <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-1 rounded-lg text-[#64748B] hover:bg-[#0EA5E9]/10 hover:text-[#0EA5E9] transition-all"><Edit2 size={12} /></button>
                      <button onClick={() => window.confirm("Hapus bahan ini?") && onDelete(item.id)} className="p-1 rounded-lg text-[#64748B] hover:bg-red-50 hover:text-red-600 transition-all"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-[#8A8A95] text-sm">Tidak ada bahan ditemukan.</p>
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
              else onAdd({ ...data, id: Date.now().toString() } as Material);
              setIsModalOpen(false);
            }}
          />
        )}
        {viewHistoryItem && (
          <HistoryModal 
            material={viewHistoryItem} 
            onClose={() => setViewHistoryItem(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ item, onClose, onSave }: { item: Material | null, onClose: () => void, onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    stock: item?.stock || 0,
    unit: item?.unit || "roll",
    minStock: item?.minStock || 0,
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-sm bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-3 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <h3 className="text-base font-bold text-[#1E293B]">{item ? "Edit Bahan" : "Tambah Bahan Baru"}</h3>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-[10px] font-bold text-[#64748B] uppercase mb-1 block tracking-wider">Nama Bahan</label>
            <div className="relative">
              <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B]" size={12} />
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-8 pr-3 py-2 text-xs text-[#1E293B] outline-none focus:border-[#0EA5E9] transition-all" placeholder="Contoh: Vinyl Glossy" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-[#64748B] uppercase mb-1 block tracking-wider">Stok Saat Ini</label>
              <div className="relative">
                <Box className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B]" size={12} />
                <input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-8 pr-3 py-2 text-xs text-[#1E293B] outline-none focus:border-[#0EA5E9] transition-all" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-[#64748B] uppercase mb-1 block tracking-wider">Satuan</label>
              <input type="text" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#1E293B] outline-none focus:border-[#0EA5E9] transition-all" placeholder="roll / pcs" />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-[#64748B] uppercase mb-1 block tracking-wider">Minimal Stok</label>
            <div className="relative">
              <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#64748B]" size={12} />
              <input type="number" value={formData.minStock} onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-8 pr-3 py-2 text-xs text-[#1E293B] outline-none focus:border-[#0EA5E9] transition-all" />
            </div>
          </div>
        </div>
        <div className="p-5 border-t border-[#E2E8F0] flex gap-2 bg-[#F8FAFC]">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-[#E2E8F0] text-[#64748B] text-xs font-medium hover:bg-[#FFFFFF] transition-all">Batal</button>
          <button onClick={() => onSave(formData)} className="flex-1 py-2 rounded-xl bg-[#0EA5E9] text-[#FFFFFF] font-bold text-xs transition-all hover:bg-[#38BDF8] shadow-md shadow-blue-500/20">Simpan Bahan</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function HistoryModal({ material, onClose }: { material: Material, onClose: () => void }) {
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("inventory_logs")
        .select("*")
        .eq("ingredient_id", material.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [material.id]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-2xl bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-base font-bold text-[#1E293B]">Riwayat Stok: {material.name}</h3>
            <p className="text-xs text-[#64748B]">Menampilkan mutasi keluar masuk bahan</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-[#E2E8F0] transition-colors"><X size={16} /></button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-0">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#F8FAFC] z-10 border-b border-[#E2E8F0]">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Waktu</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Mutasi</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Jml</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Stok Akhir</th>
                <th className="px-4 py-3 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F8FAFC]">
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-[#64748B]">
                      {new Date(log.created_at).toLocaleString("id-ID", {
                        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
                      })}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      log.type === "in" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                    }`}>
                      {log.type === "in" ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                      {log.type === "in" ? "Masuk" : "Keluar"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${log.type === "in" ? "text-green-600" : "text-red-600"}`}>
                      {log.type === "in" ? "+" : "-"}{log.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-bold text-[#1E293B]">{log.current_stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-xs text-[#64748B] max-w-[200px] truncate" title={log.note}>{log.note}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <RefreshCw className="animate-spin text-[#0EA5E9]" size={20} />
              <p className="text-xs text-[#64748B]">Memuat riwayat...</p>
            </div>
          )}
          
          {!loading && logs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-[#8A8A95] text-sm">Belum ada riwayat mutasi untuk bahan ini.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
