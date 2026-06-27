import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Clock, CheckCircle2, PlayCircle, AlertCircle, 
  ChevronRight, Printer, User, Filter, RefreshCw
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ProductionTrackingViewProps {
  onPrintSPK?: (order: any) => void;
  machines?: any[];
  employees?: any[];
}

export default function ProductionTrackingView({ onPrintSPK, machines = [], employees = [] }: ProductionTrackingViewProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  
  // Machine Assignment State
  const [isMachineModalOpen, setIsMachineModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedMachine, setSelectedMachine] = useState("");
  const [selectedOperator, setSelectedOperator] = useState("");

  const fetchProductionOrders = async () => {
    setLoading(true);
    try {
      // Clean up mock data first
      await supabase.from("orders").delete().like("order_no", "ORD-DEMO-%");

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .neq("status", "selesai") // Only show active production
        .order("created_at", { ascending: true });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching production orders:", error);
      toast.error("Gagal memuat antrian produksi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductionOrders();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
      
      toast.success(`Status diperbarui ke ${newStatus.toUpperCase()}`);
      fetchProductionOrders();
    } catch (error) {
      toast.error("Gagal memperbarui status");
    }
  };

  const handleAssignMachine = async () => {
    if (!selectedMachine || !selectedOperator) {
      toast.error("Pilih mesin dan operator terlebih dahulu");
      return;
    }

    try {
      // 1. Simpan log penggunaan mesin
      const { error: logError } = await supabase.from("machine_logs").insert([{
        machine_id: selectedMachine,
        order_no: selectedOrder.order_no,
        item_name: selectedOrder.items_summary,
        operator_name: selectedOperator,
        status: "Proses Cetak"
      }]);

      if (logError) throw logError;

      // 2. Ubah status pesanan menjadi processing
      await updateStatus(selectedOrder.id, "processing");
      
      setIsMachineModalOpen(false);
      setSelectedOrder(null);
      setSelectedMachine("");
      setSelectedOperator("");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mencatat penggunaan mesin");
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending': 
      case 'dp': // Legacy support for orders created before the fix
        return { label: 'Menunggu', color: 'bg-orange-500', icon: <Clock size={14} />, next: 'processing', nextLabel: 'Proses Cetak' };
      case 'processing': 
        return { label: 'Proses Cetak', color: 'bg-blue-500', icon: <PlayCircle size={14} />, next: 'ready', nextLabel: 'Siap Ambil' };
      case 'ready': 
        return { label: 'Siap Ambil', color: 'bg-green-500', icon: <CheckCircle2 size={14} />, next: 'selesai', nextLabel: 'Selesaikan' };
      default: 
        return { label: status, color: 'bg-gray-500', icon: <AlertCircle size={14} />, next: null, nextLabel: '' };
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchSearch = o.order_no.toLowerCase().includes(search.toLowerCase()) || 
                       o.items_summary.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || o.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B]" style={{ fontFamily: "Syne, sans-serif" }}>Antrian Produksi</h2>
          <p className="text-sm text-[#64748B]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Pantau progress cetakan dari awal hingga siap diambil</p>
        </div>
        <button 
          onClick={fetchProductionOrders}
          className="p-2.5 rounded-xl border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-all text-[#64748B]"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
          <input 
            type="text"
            placeholder="Cari No. Order atau Item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl outline-none focus:border-[#FF6B1A] transition-all"
          />
        </div>
        <div className="flex gap-2 p-1 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
          {['all', 'pending', 'processing', 'ready'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
                filter === f ? 'bg-white text-[#FF6B1A] shadow-sm' : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              {f === 'all' ? 'Semua' : getStatusConfig(f).label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order) => {
              const config = getStatusConfig(order.status);
              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
                >
                  <div className="p-3 flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest">No. Order</span>
                        <h4 className="text-sm font-bold text-[#FF6B1A]">{order.order_no}</h4>
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold text-white ${config.color}`}>
                        {config.icon}
                        {config.label.toUpperCase()}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <p className="text-[11px] text-[#1E293B] font-medium leading-tight">{order.items_summary}</p>
                      </div>

                      <div className="flex items-center gap-3 pt-2 border-t border-dashed border-[#E2E8F0]">
                        <div className="flex items-center gap-1">
                          <Clock size={12} className="text-[#94A3B8]" />
                          <span className="text-[10px] text-[#64748B]">{new Date(order.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-1 border-l border-[#E2E8F0] pl-3">
                          <User size={12} className="text-[#94A3B8]" />
                          <span className="text-[10px] text-[#64748B]">Pelanggan Umum</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 bg-[#F8FAFC] flex gap-2">
                    <button 
                      onClick={() => onPrintSPK && onPrintSPK(order)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#1E293B] hover:bg-[#F1F5F9] transition-all text-[10px] font-bold"
                    >
                      <Printer size={12} /> Cetak SPK
                    </button>
                    {config.next && (
                      <button 
                        onClick={() => {
                          if (config.next === "processing") {
                            setSelectedOrder(order);
                            setSelectedMachine("");
                            setSelectedOperator("");
                            setIsMachineModalOpen(true);
                          } else {
                            updateStatus(order.id, config.next!);
                          }
                        }}
                        className="flex-[1.5] flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#1E293B] text-white hover:bg-black transition-all text-[10px] font-bold shadow-sm"
                      >
                        {config.nextLabel} <ChevronRight size={12} />
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredOrders.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-[#F8FAFC] rounded-3xl border border-dashed border-[#E2E8F0]">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-3xl mb-4 shadow-sm">🏗️</div>
            <p className="text-sm font-bold text-[#64748B]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Tidak ada antrian di tahap ini</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isMachineModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMachineModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[#FFFFFF] rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <h3 className="text-lg font-bold text-[#1E293B]">
                  Pilih Mesin & Operator
                </h3>
                <p className="text-xs text-[#64748B] mt-1">Order: {selectedOrder?.order_no}</p>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Mesin Cetak</label>
                  <select 
                    value={selectedMachine}
                    onChange={(e) => setSelectedMachine(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FF6B1A]"
                  >
                    <option value="">-- Pilih Mesin --</option>
                    {machines.filter(m => m.status === 'aktif').map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.type})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Operator Cetak</label>
                  <select 
                    value={selectedOperator}
                    onChange={(e) => setSelectedOperator(e.target.value)}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#FF6B1A]"
                  >
                    <option value="">-- Pilih Operator --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.name}>{emp.name} ({emp.role})</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setIsMachineModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[#E2E8F0] text-sm font-bold text-[#64748B] hover:bg-[#F8FAFC]"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleAssignMachine}
                    className="flex-2 px-8 py-2.5 bg-[#FF6B1A] text-white text-sm font-bold rounded-xl hover:bg-[#FFB347] transition-all shadow-lg shadow-orange-500/20"
                  >
                    Mulai Cetak
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
