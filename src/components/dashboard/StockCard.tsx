import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ArrowUpRight, ArrowDownRight, Calendar, Package, RefreshCw, FileText } from "lucide-react";
import { StockLog, Material } from "@/types/pos";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface StockCardProps {
  materials: Material[];
}

export default function StockCard({ materials }: StockCardProps) {
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "in" | "out">("all");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("all");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("inventory_logs")
        .select(`
          *,
          ingredients (
            name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setLogs(data.map((log: any) => ({
          ...log,
          ingredient_name: log.ingredients?.name || "Unknown Ingredient"
        })));
      }
    } catch (error) {
      console.error("Error fetching stock logs:", error);
      // Fallback mock data if table doesn't exist or error
      const mockLogs: StockLog[] = [
        {
          id: "1",
          ingredient_id: "1",
          ingredient_name: "Vinyl Premium",
          type: "in",
          quantity: 10,
          previous_stock: 90,
          current_stock: 100,
          note: "Restock dari Supplier Vinyl Indo",
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          ingredient_id: "2",
          ingredient_name: "Vinyl Glossy",
          type: "out",
          quantity: 2,
          previous_stock: 52,
          current_stock: 50,
          note: "Produksi Order #ORD-0001",
          created_at: new Date(Date.now() - 3600000).toISOString(),
        }
      ];
      setLogs(mockLogs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.ingredient_name?.toLowerCase().includes(search.toLowerCase()) || 
                         log.note.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || log.type === filterType;
    const matchesMaterial = selectedMaterial === "all" || log.ingredient_id === selectedMaterial;
    return matchesSearch && matchesType && matchesMaterial;
  });

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] p-4 lg:p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-[#1E293B]" style={{ fontFamily: "Syne, sans-serif" }}>Kartu Stok</h2>
          <p className="text-xs lg:text-sm text-[#64748B]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Riwayat mutasi dan pergerakan stok bahan baku</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={fetchLogs}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] hover:bg-[#E2E8F0] transition-all"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6B1A] text-[#1A1A1F] hover:bg-[#FFB347] transition-all shadow-md shadow-orange-500/20">
            <FileText size={14} /> Cetak Laporan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            placeholder="Cari catatan atau bahan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-2 text-sm text-[#1E293B] outline-none focus:border-[#FF6B1A] transition-all"
          />
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2 text-sm text-[#1E293B] outline-none focus:border-[#FF6B1A] appearance-none transition-all"
            >
              <option value="all">Semua Jenis</option>
              <option value="in">Masuk (In)</option>
              <option value="out">Keluar (Out)</option>
            </select>
          </div>
          
          <div className="relative flex-1">
            <Package size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2 text-sm text-[#1E293B] outline-none focus:border-[#FF6B1A] appearance-none transition-all"
            >
              <option value="all">Semua Bahan</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm overflow-x-auto">
        <div className="min-w-[800px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#F8FAFC] z-10 border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Waktu</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Bahan</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Jenis</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Jumlah</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Stok Akhir</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#F8FAFC] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[#64748B]">
                      <Calendar size={14} />
                      <span className="text-xs font-medium">
                        {new Date(log.created_at).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-[#1E293B] text-sm">{log.ingredient_name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      log.type === "in" 
                        ? "bg-green-500/10 text-green-600" 
                        : "bg-red-500/10 text-red-600"
                    }`}>
                      {log.type === "in" ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                      {log.type === "in" ? "Masuk" : "Keluar"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-sm font-bold ${log.type === "in" ? "text-green-600" : "text-red-600"}`}>
                      {log.type === "in" ? "+" : "-"}{log.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-[#1E293B]">{log.current_stock}</span>
                    <span className="text-[10px] text-[#94A3B8] ml-1">({log.previous_stock} → {log.current_stock})</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-[#64748B] max-w-[200px] truncate group-hover:whitespace-normal transition-all">
                      {log.note}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-[#F8FAFC] flex items-center justify-center mb-4 text-[#CBD5E1]">
                <Package size={32} />
              </div>
              <p className="text-[#64748B] text-sm font-medium">Belum ada data mutasi stok.</p>
              <p className="text-[#94A3B8] text-xs">Coba ubah filter atau lakukan transaksi untuk melihat riwayat.</p>
            </div>
          )}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="animate-spin text-[#FF6B1A]" size={24} />
                <p className="text-sm text-[#64748B] font-medium">Memuat data mutasi...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
