import { motion } from "framer-motion";
import { 
  Monitor, Box, FolderTree, Layers, ClipboardList, 
  ShoppingCart, Printer, UserCheck, Users, Truck, 
  History, BarChart3, FileText, AlertCircle, PieChart, 
  Sliders, LogOut, Tag, LayoutDashboard, UserCircle, Settings, TrendingUp, DollarSign
} from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: any) => void;
  onLogout: () => void;
}

export default function Sidebar({ currentView, onViewChange, onLogout }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "pos", label: "Kasir / POS", icon: "🖥️" },
    { id: "production-tracking", label: "Antrian Produksi", icon: "🏗️" },
    { id: "divider1", type: "divider", label: "Manajemen Data" },
    { id: "master-produk", label: "Katalog Produk", icon: "📦" },
    { id: "master-kategori", label: "Kategori", icon: "📂" },
    { id: "master-bahan", label: "Stok Bahan", icon: "🏗️" },
    { id: "stock-card", label: "Kartu Stok", icon: "📑" },
    { id: "purchase-materials", label: "Pembelian Bahan", icon: "🛒" },
    { id: "master-mesin", label: "Mesin Cetak", icon: "🖨️" },
    { id: "divider1.5", type: "divider", label: "Sumber Daya" },
    { id: "master-karyawan", label: "Karyawan", icon: "👷" },
    { id: "master-pelanggan", label: "Pelanggan", icon: "👥" },
    { id: "master-supplier", label: "Supplier", icon: "🚚" },
    { id: "divider2", type: "divider", label: "Analitik & Laporan" },
    { id: "report-transactions", label: "Riwayat Transaksi", icon: "📜" },
    { id: "report-sales", label: "Laporan Penjualan", icon: "📈" },
    { id: "report-purchases", label: "Laporan Pembelian", icon: "📄" },
    { id: "report-damaged", label: "Barang Rusak", icon: "⚠️" },
    { id: "report-profit", label: "Laba & Rugi", icon: "💰" },
    { id: "divider3", type: "divider", label: "Konfigurasi" },
    { id: "settings", label: "Pengaturan Sistem", icon: "⚙️" },
  ];

  return (
    <div className="hidden lg:flex flex-col w-64 bg-[#FFFFFF] border-r border-[#E2E8F0] h-full overflow-hidden shadow-xl z-20">
      <div className="p-6 border-b border-[#E2E8F0] bg-gradient-to-br from-white to-orange-50/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF6B1A] flex items-center justify-center shadow-lg shadow-orange-500/30 rotate-3">
            <span className="text-xl font-black text-[#FFFFFF]">B</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight leading-none" style={{ fontFamily: "Syne, sans-serif" }}>BANNER<span className="text-[#FF6B1A]">POS</span></h1>
            <p className="text-[10px] text-[#64748B] uppercase tracking-widest mt-1.5 font-bold opacity-70">Premium Printing System</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 custom-scrollbar">
        {menuItems.map((item) => {
          if (item.type === "divider") {
            return (
              <div key={item.id} className="pt-5 pb-2 px-4">
                <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.15em] opacity-80">{item.label}</span>
              </div>
            );
          }

          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 group relative ${
                isActive 
                  ? 'bg-[#FF6B1A] text-[#FFFFFF] shadow-lg shadow-orange-500/20 translate-x-1' 
                  : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B] hover:translate-x-1'
              }`}
            >
              <span className={`text-xl transition-transform duration-300 group-hover:scale-125 group-hover:rotate-6 ${isActive ? 'brightness-125 drop-shadow-md' : 'grayscale-[0.3] group-hover:grayscale-0'}`}>
                {item.icon as string}
              </span>
              <span className="text-sm font-bold tracking-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                {item.label}
              </span>
              {isActive && (
                <motion.div 
                  layoutId="activeNav" 
                  className="ml-auto w-2 h-2 rounded-full bg-[#FFFFFF] shadow-[0_0_10px_rgba(255,255,255,0.8)]" 
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC]/50">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-[#64748B] hover:bg-red-50 hover:text-red-600 transition-all duration-300 group"
        >
          <span className="text-xl group-hover:rotate-12 transition-transform">🚪</span>
          <span className="text-sm font-bold" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Keluar Sistem</span>
        </button>
      </div>
    </div>
  );
}
