import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, Edit2, Trash2, Printer, 
  Settings2, Activity, ShieldAlert, CheckCircle2, 
  Cpu, Database, Wifi, Clock, History
} from "lucide-react";
import { Machine } from "@/types/pos";
import { useEffect } from "react";

interface MasterMesinProps {
  machines: Machine[];
  onAdd: (item: any) => void;
  onUpdate: (item: any) => void;
  onDelete: (id: string) => void;
  fetchLogs?: () => Promise<any>;
}

export default function MasterMesin({ machines, onAdd, onUpdate, onDelete, fetchLogs }: MasterMesinProps) {
  const [activeTab, setActiveTab] = useState<"list" | "history">("list");
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [editingItem, setEditingItem] = useState<Machine | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "Outdoor",
    status: "aktif" as const,
    ipAddress: "",
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({ name: "", type: "Outdoor", status: "aktif", ipAddress: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Machine) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      type: item.type,
      status: item.status,
      ipAddress: item.ipAddress || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name) return;
    if (editingItem) {
      onUpdate({ ...editingItem, ...formData });
    } else {
      onAdd(formData);
    }
    setIsModalOpen(false);
  };

  const statusColors = {
    aktif: { bg: "bg-green-500/10", text: "text-green-600", icon: CheckCircle2 },
    maintenance: { bg: "bg-yellow-500/10", text: "text-yellow-600", icon: Activity },
    rusak: { bg: "bg-red-500/10", text: "text-red-600", icon: ShieldAlert },
  };

  const filtered = machines.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.type.toLowerCase().includes(search.toLowerCase())
  );

  const loadLogs = async () => {
    if (fetchLogs) {
      setLoadingLogs(true);
      const { data } = await fetchLogs();
      console.log("Fetched Logs in Component:", data);
      if (data) setLogs(data);
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") loadLogs();
  }, [activeTab]);

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] p-4 lg:p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-[#1E293B]" style={{ fontFamily: "Syne, sans-serif" }}>Pengaturan Mesin Cetak</h2>
          <p className="text-xs lg:text-sm text-[#64748B]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Kelola armada mesin produksi Anda</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#FF6B1A] text-[#FFFFFF] hover:bg-[#FFB347] transition-all shadow-lg shadow-orange-500/20"
        >
          <Plus size={18} /> Tambah Mesin
        </button>
      </div>

      <div className="flex gap-2 mb-6 p-1 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] w-fit">
        <button
          onClick={() => setActiveTab("list")}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'list' ? 'bg-white text-[#FF6B1A] shadow-sm' : 'text-[#64748B]'}`}
        >
          <Printer size={14} /> Daftar Mesin
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === 'history' ? 'bg-white text-[#FF6B1A] shadow-sm' : 'text-[#64748B]'}`}
        >
          <History size={14} /> Riwayat Penggunaan
        </button>
      </div>

      {activeTab === "list" ? (
        <>
          <div className="relative mb-6">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Cari nama mesin atau tipe..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-12 pr-4 py-3 text-sm text-[#1E293B] outline-none focus:border-[#FF6B1A] transition-all shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto pr-2 custom-scrollbar">
            {filtered.map((machine) => {
              const StatusIcon = statusColors[machine.status].icon;
              return (
                <motion.div
                  layout
                  key={machine.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-[#FF6B1A]">
                      <Printer size={24} />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenEdit(machine)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => onDelete(machine.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-[#1E293B] text-lg">{machine.name}</h3>
                      <p className="text-xs text-[#64748B] flex items-center gap-1.5 mt-1">
                        <Cpu size={12} /> {machine.type} Machine
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-[#F1F5F9]">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase ${statusColors[machine.status].bg} ${statusColors[machine.status].text}`}>
                        <StatusIcon size={12} />
                        {machine.status}
                      </span>
                      
                      {machine.ipAddress && (
                        <span className="text-[10px] text-[#64748B] font-medium flex items-center gap-1">
                          <Wifi size={10} /> {machine.ipAddress}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-y-auto rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Waktu</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Mesin</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">No. Order</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Item</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Operator</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F8FAFC] transition-all">
                    <td className="px-6 py-4 text-xs text-[#1E293B]">
                      {new Date(log.created_at).toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-[#FF6B1A]">{log.machines?.name}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-[#64748B]">
                      {log.order_no}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#1E293B] font-medium">
                      {log.item_name}
                    </td>
                    <td className="px-6 py-4 text-xs text-[#64748B]">
                      {log.operator_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase bg-green-500/10 text-green-600">
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && !loadingLogs && (
              <div className="flex flex-col items-center justify-center py-20 text-[#64748B]">
                <Clock size={48} className="mb-4 opacity-10" />
                <p className="text-sm font-medium">Belum ada riwayat penggunaan</p>
              </div>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#FFFFFF] rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <h3 className="text-lg font-bold text-[#1E293B]">
                  {editingItem ? "Edit Data Mesin" : "Tambah Mesin Baru"}
                </h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Nama Mesin</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Contoh: Outdoor Konica 512i"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FF6B1A]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Tipe Mesin</label>
                    <input 
                      type="text"
                      list="machine-type-suggestions"
                      value={formData.type}
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2 text-sm outline-none focus:border-[#FF6B1A]"
                      placeholder="Pilih atau ketik tipe"
                    />
                    <datalist id="machine-type-suggestions">
                      <option value="Outdoor" />
                      <option value="Indoor" />
                      <option value="UV Printer" />
                      <option value="Cutting Plotter" />
                      <option value="Laser Cutting" />
                    </datalist>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2 text-sm outline-none focus:border-[#FF6B1A]"
                    >
                      <option value="aktif">Aktif</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="rusak">Rusak</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">IP Address (Opsional)</label>
                  <input 
                    type="text" 
                    value={formData.ipAddress}
                    onChange={(e) => setFormData({...formData, ipAddress: e.target.value})}
                    placeholder="192.168.1.10"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FF6B1A]"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-bold text-[#64748B] hover:bg-[#F8FAFC]"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleSubmit}
                    className="flex-2 px-8 py-2.5 bg-[#FF6B1A] text-white text-sm font-bold rounded-xl hover:bg-[#FFB347] transition-all shadow-lg shadow-orange-500/20"
                  >
                    {editingItem ? "Simpan Perubahan" : "Tambah Mesin"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
