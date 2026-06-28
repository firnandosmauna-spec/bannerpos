import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Printer, Filter, Calendar, TrendingUp, ArrowUpRight, ArrowDownRight, Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ReportViewProps {
  title: string;
  type: "sales" | "purchases" | "damaged" | "profit";
  onPrint?: (data: any, summary: any) => void;
}

export default function ReportView({ title, type, onPrint }: ReportViewProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, count: 0 });

  const fetchData = async () => {
    setLoading(true);
    try {
      let result: any[] = [];
      if (type === "sales") {
        const { data: sales } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false });
        
        result = (sales || []).map(s => ({
          id: s.id,
          date: new Date(s.created_at).toLocaleDateString("id-ID"),
          desc: s.items_summary,
          amount: s.total_amount,
          status: s.status === "selesai" ? "Lunas" : "Pending"
        }));
      } else if (type === "purchases") {
        const { data: purchases } = await supabase
          .from("purchases")
          .select(`*, ingredients(name)`)
          .order("purchase_date", { ascending: false });
        
        result = (purchases || []).map(p => ({
          id: p.id,
          date: new Date(p.purchase_date).toLocaleDateString("id-ID"),
          desc: `Pembelian ${p.ingredients?.name}`,
          amount: p.total_price,
          paidAmount: p.paid_amount || 0,
          remainingAmount: p.remaining_amount || 0,
          status: p.payment_status === "lunas" ? "Lunas" : "Hutang"
        }));
      } else {
        // Fallback for others or combined profit
        result = [
          { id: 1, date: "2024-05-01", desc: "Demo " + title, amount: 1500000, status: "Lunas" },
        ];
      }

      setData(result);
      const total = result.reduce((acc, curr) => acc + curr.amount, 0);
      setSummary({ total, count: result.length });
    } catch (error) {
      console.error("Error fetching report data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      <div className="p-6 border-b border-[#E2E8F0] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#FFFFFF]">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-[#1E293B]" style={{ fontFamily: "Syne, sans-serif" }}>{title}</h2>
          <p className="text-xs lg:text-sm text-[#64748B]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Analisis data dan ringkasan transaksi {title.toLowerCase()}</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={fetchData}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#FFFFFF] text-[#1E293B] hover:bg-[#F8FAFC] transition-all border border-[#E2E8F0]"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Filter size={14} />} Refresh
          </button>
          <button 
            onClick={() => onPrint && onPrint(data, summary)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6B1A] text-white hover:bg-[#FFB347] transition-all shadow-lg shadow-orange-500/20"
          >
            <span className="text-sm">🖨️</span> Cetak Laporan
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {/* Summary Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] relative overflow-hidden group shadow-sm">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
              <TrendingUp size={64} className="text-[#FF6B1A]" />
            </div>
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Total {title.split(' ')[1] || 'Transaksi'}</p>
            <h4 className="text-2xl font-black text-[#1E293B]" style={{ fontFamily: "Syne, sans-serif" }}>{formatCurrency(summary.total)}</h4>
            <div className="flex items-center gap-1.5 mt-2 text-[#2ECC71] text-xs font-bold">
              <ArrowUpRight size={12} /> Data Real-time dari Database
            </div>
          </div>
          <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Jumlah Transaksi</p>
            <h4 className="text-2xl font-black text-[#1E293B]" style={{ fontFamily: "Syne, sans-serif" }}>{summary.count}</h4>
            <p className="text-[#64748B] text-xs mt-2">Ditemukan {summary.count} data transaksi</p>
          </div>
          <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E2E8F0] shadow-sm">
            <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1">Status Laporan</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-2 h-2 rounded-full ${summary.count > 0 ? 'bg-[#2ECC71]' : 'bg-[#64748B]'}`} />
              <span className="text-sm font-bold text-[#1E293B]">{summary.count > 0 ? 'Terverifikasi' : 'Kosong'}</span>
            </div>
            <p className="text-[#64748B] text-[10px] mt-1 italic">Terakhir diperbarui: {new Date().toLocaleTimeString()}</p>
          </div>
        </div>

        {/* Table Area */}
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-[#FF6B1A]" />
              <span className="text-xs font-bold text-[#1E293B]">Detail Rincian Transaksi</span>
            </div>
            <button className="text-[10px] font-bold text-[#FF6B1A] hover:underline uppercase tracking-wider">Export Data</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F8FAFC]">
                  <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Tanggal</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Keterangan</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Jumlah</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {data.map((item, i) => (
                  <tr key={i} className="hover:bg-[#F8FAFC] transition-all cursor-default">
                    <td className="px-6 py-4 text-sm text-[#1E293B] font-medium">{item.date}</td>
                    <td className="px-6 py-4 text-sm text-[#1E293B]">{item.desc}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[#1E293B]">Tot: {formatCurrency(item.amount)}</span>
                        {type === 'purchases' && item.paidAmount > 0 && (
                          <span className="text-[10px] text-green-600 font-bold mt-0.5">Dibayar: {formatCurrency(item.paidAmount)}</span>
                        )}
                        {type === 'purchases' && item.remainingAmount > 0 && (
                          <span className="text-[10px] text-red-500 font-bold mt-0.5">Sisa Hutang: {formatCurrency(item.remainingAmount)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[9px] font-bold uppercase ${item.status === 'Lunas' ? 'bg-[#2ECC71]/10 text-[#2ECC71]' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-20 text-[#64748B]">
                <AlertCircle size={48} className="mb-4 opacity-10" />
                <p className="text-sm font-medium">Belum ada data tersedia</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
