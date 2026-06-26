import { motion } from "framer-motion";
import { 
  TrendingUp, Users, Package, DollarSign, 
  ShoppingCart, Clock, AlertTriangle, CheckCircle2,
  ArrowUpRight, ArrowDownRight, Printer, Activity
} from "lucide-react";

interface MainDashboardViewProps {
  stats: {
    totalSales: string;
    todayOrders: string;
    totalProducts: string;
    activeCustomers: string;
  };
  recentOrders: any[];
  lowStockItems: any[];
  onViewTransactions?: () => void;
}

export default function MainDashboardView({ stats, recentOrders, lowStockItems, onViewTransactions }: MainDashboardViewProps) {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-y-auto custom-scrollbar p-4 lg:p-5 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-black text-[#1E293B]" style={{ fontFamily: "Syne, sans-serif" }}>Dashboard Ringkasan</h2>
          <p className="text-sm text-[#64748B]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Selamat datang kembali! Berikut adalah ikhtisar bisnis Anda hari ini.</p>
        </div>
        <div className="bg-[#FFFFFF] px-4 py-2 rounded-xl border border-[#E2E8F0] shadow-sm flex items-center gap-2">
          <Clock size={16} className="text-[#FF6B1A]" />
          <span className="text-xs font-bold text-[#1E293B]">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Omzet Hari Ini", value: stats.totalSales, icon: DollarSign, color: "text-green-600", bg: "bg-green-500/10" },
          { label: "Order Hari Ini", value: stats.todayOrders, icon: ShoppingCart, color: "text-[#FF6B1A]", bg: "bg-[#FF6B1A]/10" },
          { label: "Total Produk", value: stats.totalProducts, icon: Package, color: "text-blue-600", bg: "bg-blue-500/10" },
          { label: "Pelanggan Aktif", value: stats.activeCustomers, icon: Users, color: "text-purple-600", bg: "bg-purple-500/10" },
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-[#FFFFFF] p-4 lg:p-5 rounded-2xl border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                <item.icon size={24} />
              </div>
            </div>
            <div>
              <p className="text-[9px] font-bold text-[#64748B] uppercase tracking-widest mb-1">{item.label}</p>
              <h4 className="text-lg font-black text-[#1E293B]" style={{ fontFamily: "Syne, sans-serif" }}>{item.value}</h4>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]/50">
            <h3 className="font-bold text-sm text-[#1E293B] flex items-center gap-2">
              <Clock size={18} className="text-[#FF6B1A]" /> Transaksi Terakhir
            </h3>
            {onViewTransactions && (
              <button onClick={onViewTransactions} className="text-[10px] font-bold text-[#FF6B1A] hover:underline uppercase tracking-wider">Lihat Semua</button>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F8FAFC]">
                  <th className="px-4 py-3 text-[9px] font-bold text-[#64748B] uppercase tracking-widest">No. Order</th>
                  <th className="px-4 py-3 text-[9px] font-bold text-[#64748B] uppercase tracking-widest">Item</th>
                  <th className="px-4 py-3 text-[9px] font-bold text-[#64748B] uppercase tracking-widest">Total</th>
                  <th className="px-4 py-3 text-[9px] font-bold text-[#64748B] uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {recentOrders.slice(0, 5).map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-[#F8FAFC] transition-colors"
                    onClick={onViewTransactions}
                    style={{ cursor: onViewTransactions ? "pointer" : "default" }}
                  >
                    <td className="px-4 py-3 text-xs font-bold text-[#1E293B]">{order.orderNo}</td>
                    <td className="px-4 py-3 text-[11px] text-[#64748B] truncate max-w-[200px]">{order.items}</td>
                    <td className="px-4 py-3 text-xs font-bold text-[#1E293B]">{formatCurrency(order.total)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${order.status === 'selesai' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-[#FF6B1A]'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts & Production Status */}
        <div className="space-y-4">
          {/* Low Stock Alert */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-sm p-4">
            <h3 className="font-bold text-sm text-[#1E293B] flex items-center gap-2 mb-3">
              <AlertTriangle size={18} className="text-red-500" /> Peringatan Stok Rendah
            </h3>
            <div className="space-y-3">
              {lowStockItems.length > 0 ? lowStockItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 rounded-xl bg-red-50 border border-red-100">
                  <div>
                    <p className="text-xs font-bold text-[#1E293B]">{item.name}</p>
                    <p className="text-[10px] text-red-600">Sisa: {item.stock} {item.unit}</p>
                  </div>
                  <button className="px-3 py-1 bg-white text-[10px] font-bold text-red-600 rounded-lg border border-red-200 hover:bg-red-50 transition-colors">Order</button>
                </div>
              )) : (
                <div className="text-center py-4 text-[#64748B]">
                  <CheckCircle2 size={32} className="mx-auto mb-2 text-green-500 opacity-20" />
                  <p className="text-[10px] font-medium">Semua stok aman</p>
                </div>
              )}
            </div>
          </div>

          {/* Machine Status */}
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-sm p-4">
            <h3 className="font-bold text-sm text-[#1E293B] flex items-center gap-2 mb-3">
              <Activity size={18} className="text-blue-500" /> Status Produksi
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#64748B]">Antrian Menunggu</span>
                <span className="px-2 py-0.5 bg-gray-100 rounded-lg text-[10px] font-bold text-[#1E293B]">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#64748B]">Sedang Dicetak</span>
                <span className="px-2 py-0.5 bg-blue-100 rounded-lg text-[10px] font-bold text-blue-600">3</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-[#64748B]">Siap Diambil</span>
                <span className="px-2 py-0.5 bg-green-100 rounded-lg text-[10px] font-bold text-green-600">12</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
