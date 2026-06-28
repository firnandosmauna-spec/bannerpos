import { useState, useEffect } from "react";
import { X } from "lucide-react";
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
  role?: string;
  permissions?: string[];
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ currentView, onViewChange, onLogout, role = "kasir", permissions = [], isOpen = false, onClose }: SidebarProps) {
  const isAdmin = role.toLowerCase() === "admin";
  const hasPermission = (id: string) => isAdmin || permissions.includes(id);

  const [companyName, setCompanyName] = useState("BANNERPOS");

  useEffect(() => {
    const loadCompany = () => {
      setCompanyName(localStorage.getItem("companyName") || "BANNERPOS");
    };
    loadCompany();
    window.addEventListener("companyProfileUpdated", loadCompany);
    return () => window.removeEventListener("companyProfileUpdated", loadCompany);
  }, []);

  const allMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "pos", label: "Kasir / POS", icon: "🖥️" },
    { id: "production-tracking", label: "Antrian Produksi", icon: "🏗️" },
    { id: "divider1", type: "divider", label: "Manajemen Data" },
    { id: "master-produk", label: "Katalog Produk", icon: "📦" },
    { id: "master-kategori", label: "Kategori", icon: "📂" },
    { id: "master-bahan", label: "Master Bahan", icon: "🏗️" },
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
    { id: "report-profit", label: "Laba & Rugi Lama", icon: "💰" },
    { id: "divider-acc", type: "divider", label: "Akuntansi (Baru)" },
    { id: "accounting-coa", label: "Kode Akun (COA)", icon: "🏷️" },
    { id: "accounting-journal", label: "Jurnal Umum", icon: "📓" },
    { id: "accounting-ledger", label: "Buku Besar", icon: "📘" },
    { id: "accounting-statements", label: "Laporan Keuangan", icon: "📊" },
    { id: "divider3", type: "divider", label: "Konfigurasi" },
    { id: "settings", label: "Pengaturan Sistem", icon: "⚙️" },
  ];

  // Filter out dividers if they have no items under them, and filter items based on permissions
  const menuItems = allMenuItems.filter(item => item.type === "divider" || hasPermission(item.id));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 lg:w-56 bg-[#FFFFFF] border-r border-[#E2E8F0] h-full flex flex-col shadow-2xl lg:shadow-xl
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="p-5 border-b border-[#E2E8F0] bg-gradient-to-br from-white to-orange-50/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF6B1A] flex items-center justify-center shadow-lg shadow-orange-500/30 rotate-3 shrink-0">
              <span className="text-lg font-black text-[#FFFFFF]">{companyName.charAt(0).toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-base lg:text-lg font-bold text-[#1E293B] tracking-tight leading-none truncate" style={{ fontFamily: "Syne, sans-serif" }}>
                {companyName}
              </h1>
              <p className="text-[9px] text-[#64748B] uppercase tracking-widest mt-1 font-bold opacity-70 truncate">Premium Printing</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {menuItems.map((item) => {
          if (item.type === "divider") {
            return (
              <div key={item.id} className="pt-4 pb-1.5 px-3">
                <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-[0.15em] opacity-80">{item.label}</span>
              </div>
            );
          }

          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id);
                if (window.innerWidth < 1024 && onClose) onClose(); // Auto close on mobile
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group relative ${
                isActive 
                  ? 'bg-[#FF6B1A] text-[#FFFFFF] shadow-md shadow-orange-500/20 translate-x-1' 
                  : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B] hover:translate-x-1'
              }`}
            >
              <span className={`text-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${isActive ? 'brightness-125 drop-shadow-md' : 'grayscale-[0.3] group-hover:grayscale-0'}`}>
                {item.icon as string}
              </span>
              <span className="text-[13px] font-bold tracking-tight" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
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

      <div className="p-3 border-t border-[#E2E8F0] bg-[#F8FAFC]/50">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[#64748B] hover:bg-red-50 hover:text-red-600 transition-all duration-300 group"
        >
          <span className="text-lg group-hover:rotate-12 transition-transform">🚪</span>
          <span className="text-[13px] font-bold" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Keluar Sistem</span>
        </button>
      </div>
      </div>
    </>
  );
}
