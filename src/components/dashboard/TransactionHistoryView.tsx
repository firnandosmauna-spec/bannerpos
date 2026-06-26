import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Calendar, Filter, Printer, Download, 
  ChevronLeft, ChevronRight, Eye, RefreshCw, ShoppingBag
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface TransactionHistoryViewProps {
  onPrint?: (data: any) => void;
}

export default function TransactionHistoryView({ onPrint }: TransactionHistoryViewProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (dateRange.start) {
        query = query.gte("created_at", `${dateRange.start}T00:00:00`);
      }
      if (dateRange.end) {
        query = query.lte("created_at", `${dateRange.end}T23:59:59`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Gagal memuat riwayat transaksi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [dateRange]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  const filtered = orders.filter(o => 
    o.order_no.toLowerCase().includes(search.toLowerCase()) ||
    o.items_summary.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] p-4 lg:p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-[#1E293B]" style={{ fontFamily: "Syne, sans-serif" }}>Riwayat Transaksi</h2>
          <p className="text-xs lg:text-sm text-[#64748B]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Daftar seluruh transaksi penjualan</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#FFFFFF] border border-[#E2E8F0] text-[#1E293B] hover:bg-[#F8FAFC] transition-all">
            <span className="text-lg">📊</span> Excel
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[#FF6B1A] text-white hover:bg-[#FFB347] transition-all shadow-lg shadow-orange-500/20">
            <span className="text-lg">🖨️</span> Cetak Laporan
          </button>
        </div>
      </div>

      <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#E2E8F0] mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input 
              type="text" 
              placeholder="Cari No. Order atau Produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl pl-10 pr-4 py-2 text-xs outline-none focus:border-[#FF6B1A]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[#64748B]" />
            <input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="flex-1 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs outline-none"
            />
            <span className="text-[#64748B] text-xs">s/d</span>
            <input 
              type="date" 
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="flex-1 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs outline-none"
            />
          </div>
          <button 
            onClick={fetchAllOrders}
            className="flex items-center justify-center gap-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl py-2 text-xs font-bold text-[#64748B] hover:text-[#FF6B1A] transition-all"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Waktu / No. Order</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Item Pesanan</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Metode</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Total</th>
                <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Status</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-[#F8FAFC] transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#FF6B1A]">{order.order_no}</span>
                      <span className="text-[10px] text-[#64748B]">{new Date(order.created_at).toLocaleString("id-ID")}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-[#1E293B] line-clamp-1">{order.items_summary}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-[#64748B] font-medium">
                    {order.payment_method}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#1E293B]">{formatCurrency(order.total_amount)}</span>
                      {order.remaining_amount > 0 && (
                        <span className="text-[9px] text-red-500 font-bold">Sisa: {formatCurrency(order.remaining_amount)}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                      order.status === 'selesai' ? 'bg-green-500/10 text-green-600' : 'bg-orange-500/10 text-orange-600'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => {
                        if (onPrint) {
                          onPrint({
                            orderNo: order.order_no,
                            kasirName: "Kasir",
                            items: [{ name: order.items_summary, qty: 1, price: order.total_amount, total: order.total_amount }],
                            total: order.total_amount,
                            paidAmount: order.paid_amount,
                            paymentMethod: order.payment_method,
                            date: new Date(order.created_at)
                          });
                        }
                      }}
                      className="p-2 hover:bg-[#FFFFFF] text-[#64748B] hover:text-[#FF6B1A] rounded-lg transition-all shadow-sm"
                      title="Cetak Ulang Nota"
                    >
                      <Printer size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-[#64748B]">
              <ShoppingBag size={48} className="mb-4 opacity-10" />
              <p className="text-sm font-medium">Tidak ada transaksi ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
