import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Receipt, Database, Save, Upload, Download, RefreshCw, Trash2, ShieldCheck, Users, CreditCard, QrCode, Landmark } from "lucide-react";
import { toast } from "sonner";
import MasterPengguna from "./MasterPengguna";
import { User } from "@/types/pos";

interface SettingsViewProps {
  users: User[];
  onAddUser: (item: any) => void;
  onUpdateUser: (item: any) => void;
  onDeleteUser: (id: string) => void;
}

export default function SettingsView({ users, onAddUser, onUpdateUser, onDeleteUser }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<"company" | "receipt" | "payments" | "database" | "users" | "services">("company");
  const [enableManualInvoice, setEnableManualInvoice] = useState(() => {
    return localStorage.getItem("enableManualInvoice") === "true";
  });
  const [autoInvoicePrefix, setAutoInvoicePrefix] = useState(() => localStorage.getItem("autoInvoicePrefix") || "ORD-");
  const [autoInvoiceCounter, setAutoInvoiceCounter] = useState(() => localStorage.getItem("currentInvoiceCounter") || "1");

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] overflow-hidden">
      <div className="p-6 border-b border-[#E2E8F0] bg-[#FFFFFF]">
        <h2 className="text-xl lg:text-2xl font-bold text-[#1E293B]" style={{ fontFamily: "Syne, sans-serif" }}>Pengaturan Sistem</h2>
        <p className="text-xs lg:text-sm text-[#64748B]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Konfigurasi profil perusahaan, format nota, dan manajemen database</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sub-tabs Sidebar */}
        <div className="w-full lg:w-64 bg-[#FFFFFF] border-r border-[#E2E8F0] p-4 flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("company")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'company' ? 'bg-[#FF6B1A] text-[#FFFFFF] shadow-md shadow-orange-500/20' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}
          >
            <span className="text-lg">🏢</span>
            <span className="text-sm font-bold">Perusahaan</span>
          </button>
          <button
            onClick={() => setActiveTab("receipt")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'receipt' ? 'bg-[#FF6B1A] text-[#FFFFFF] shadow-md shadow-orange-500/20' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}
          >
            <span className="text-lg">🧾</span>
            <span className="text-sm font-bold">Format Nota</span>
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'payments' ? 'bg-[#FF6B1A] text-[#FFFFFF] shadow-md shadow-orange-500/20' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}
          >
            <span className="text-lg">💳</span>
            <span className="text-sm font-bold">Pembayaran</span>
          </button>
          <button
            onClick={() => setActiveTab("database")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'database' ? 'bg-[#FF6B1A] text-[#FFFFFF] shadow-md shadow-orange-500/20' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}
          >
            <span className="text-lg">💾</span>
            <span className="text-sm font-bold">Database</span>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-[#FF6B1A] text-[#FFFFFF] shadow-md shadow-orange-500/20' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}
          >
            <span className="text-lg">👥</span>
            <span className="text-sm font-bold">Manajemen Pengguna</span>
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${activeTab === 'services' ? 'bg-[#FF6B1A] text-[#FFFFFF] shadow-md shadow-orange-500/20' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}
          >
            <span className="text-lg">🛠️</span>
            <span className="text-sm font-bold">Layanan & Biaya</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === "company" && (
              <motion.div
                key="company"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#1E293B]">Profil Perusahaan</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Nama Bisnis</label>
                      <input type="text" defaultValue="BANNERPOS Percetakan" className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm text-[#1E293B] focus:border-[#FF6B1A] outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Alamat Lengkap</label>
                      <textarea rows={3} defaultValue="Jl. Raya Percetakan No. 123, Jakarta Pusat" className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm text-[#1E293B] focus:border-[#FF6B1A] outline-none resize-none transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Telepon / WA</label>
                        <input type="text" defaultValue="0812-3456-7890" className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm text-[#1E293B] focus:border-[#FF6B1A] outline-none transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Email</label>
                        <input type="email" defaultValue="admin@bannerpos.com" className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm text-[#1E293B] focus:border-[#FF6B1A] outline-none transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={() => toast.success("Profil perusahaan diperbarui")} className="flex items-center gap-2 px-6 py-2.5 bg-[#FF6B1A] text-[#FFFFFF] rounded-xl font-bold text-sm hover:bg-[#FFB347] transition-all shadow-md shadow-orange-500/20">
                  <Save size={18} /> Simpan Perubahan
                </button>
              </motion.div>
            )}

            {activeTab === "receipt" && (
              <motion.div
                key="receipt"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#1E293B]">Pengaturan Nota</h3>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Header Nota (Baris 1)</label>
                      <input type="text" defaultValue="TERIMA KASIH TELAH MEMESAN" className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm text-[#1E293B] focus:border-[#FF6B1A] outline-none transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Footer / Pesan Bawah</label>
                      <textarea rows={2} defaultValue="Barang yang sudah dibeli tidak dapat ditukar. Harap cek pesanan sebelum pulang." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm text-[#1E293B] focus:border-[#FF6B1A] outline-none resize-none transition-all" />
                      <div className="flex items-center gap-4 p-4 bg-[#FF6B1A]/5 rounded-2xl border border-[#FF6B1A]/20">
                        <Receipt className="text-[#FF6B1A]" size={24} />
                        <div>
                          <p className="text-sm font-bold text-[#1E293B]">Ukuran Kertas</p>
                          <p className="text-xs text-[#64748B]">Thermal 58mm / 80mm didukung otomatis</p>
                        </div>
                      </div>
                      
                      <div className="space-y-1.5 pt-4 border-t border-[#E2E8F0]">
                        <div className="flex items-center justify-between">
                          <div>
                            <label className="text-sm font-bold text-[#1E293B]">Nomor Invoice Manual</label>
                            <p className="text-[10px] text-[#64748B]">Izinkan kasir memasukkan nomor invoice secara manual.</p>
                          </div>
                          <button 
                            onClick={() => setEnableManualInvoice(!enableManualInvoice)}
                            className={`w-10 h-5 rounded-full relative transition-all ${enableManualInvoice ? 'bg-[#2ECC71]' : 'bg-[#CBD5E1]'}`}
                          >
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${enableManualInvoice ? 'right-1' : 'left-1'}`} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#E2E8F0]">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Prefix Invoice Otomatis</label>
                          <input 
                            type="text" 
                            value={autoInvoicePrefix}
                            onChange={(e) => setAutoInvoicePrefix(e.target.value)}
                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm text-[#1E293B] focus:border-[#FF6B1A] outline-none transition-all" 
                            placeholder="Contoh: ORD-"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Mulai dari Nomor</label>
                          <input 
                            type="number" 
                            value={autoInvoiceCounter}
                            onChange={(e) => setAutoInvoiceCounter(e.target.value)}
                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm text-[#1E293B] focus:border-[#FF6B1A] outline-none transition-all" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={() => {
                  localStorage.setItem("enableManualInvoice", enableManualInvoice.toString());
                  localStorage.setItem("autoInvoicePrefix", autoInvoicePrefix);
                  localStorage.setItem("currentInvoiceCounter", autoInvoiceCounter);
                  toast.success("Format nota disimpan");
                }} className="flex items-center gap-2 px-6 py-2.5 bg-[#FF6B1A] text-[#FFFFFF] rounded-xl font-bold text-sm hover:bg-[#FFB347] transition-all shadow-md shadow-orange-500/20">
                  <Save size={18} /> Simpan Konfigurasi
                </button>
              </motion.div>
            )}
            
            {activeTab === "payments" && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl space-y-8"
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#1E293B]">Pengaturan Pembayaran</h3>
                  
                  {/* QRIS Configuration */}
                  <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E2E8F0] space-y-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-[#FF6B1A]">
                        <QrCode size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1E293B]">Konfigurasi QRIS</h4>
                        <p className="text-[10px] text-[#64748B]">Metode pembayaran non-tunai via kode QR</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Nama Merchant</label>
                        <input type="text" defaultValue="BANNERPOS PRINTING" className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2 text-sm text-[#1E293B] focus:border-[#FF6B1A] outline-none transition-all" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">ID Merchant (NMID)</label>
                        <input type="text" defaultValue="ID1020304050607" className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2 text-sm text-[#1E293B] focus:border-[#FF6B1A] outline-none transition-all" />
                      </div>
                    </div>
                    
                    <div className="p-4 border-2 border-dashed border-[#E2E8F0] rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-[#FF6B1A]/40 transition-all cursor-pointer bg-[#F8FAFC]">
                      <Upload className="text-[#94A3B8]" size={24} />
                      <p className="text-[10px] font-bold text-[#64748B] uppercase">Unggah Gambar QRIS</p>
                      <p className="text-[9px] text-[#94A3B8]">Format JPG/PNG, Maks 2MB</p>
                    </div>
                  </div>

                  {/* Bank Transfer */}
                  <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E2E8F0] space-y-4 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Landmark size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#1E293B]">Rekening Bank</h4>
                        <p className="text-[10px] text-[#64748B]">Daftar rekening untuk transfer bank</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                        <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center font-bold text-[10px] text-blue-600">BCA</div>
                        <div className="flex-1">
                          <p className="text-[11px] font-bold text-[#1E293B]">8820991234</p>
                          <p className="text-[9px] text-[#64748B]">a.n. PT BANNER PRATAMA SEJAHTERA</p>
                        </div>
                        <button className="text-[#94A3B8] hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
                        <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center font-bold text-[10px] text-[#FF6B1A]">MDR</div>
                        <div className="flex-1">
                          <p className="text-[11px] font-bold text-[#1E293B]">1230009988776</p>
                          <p className="text-[9px] text-[#64748B]">a.n. BANNERPOS PRINTING</p>
                        </div>
                        <button className="text-[#94A3B8] hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                      </div>
                    </div>
                    
                    <button className="w-full py-2 rounded-xl border border-dashed border-[#E2E8F0] text-[#64748B] text-[10px] font-bold uppercase hover:bg-[#F8FAFC] transition-all">
                      + Tambah Rekening Baru
                    </button>
                  </div>

                  {/* Payment Method Toggle */}
                  <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E2E8F0] space-y-4 shadow-sm">
                    <h4 className="font-bold text-[#1E293B] text-sm">Aktivasi Metode Pembayaran</h4>
                    <div className="space-y-3">
                      {[
                        { name: "Tunai / Cash", enabled: true },
                        { name: "QRIS Dinamis", enabled: true },
                        { name: "Transfer Bank", enabled: true },
                        { name: "Down Payment (DP)", enabled: true },
                        { name: "Piutang Pelanggan", enabled: false }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl">
                          <span className="text-xs font-medium text-[#1E293B]">{item.name}</span>
                          <button className={`w-10 h-5 rounded-full relative transition-all ${item.enabled ? 'bg-[#2ECC71]' : 'bg-[#CBD5E1]'}`}>
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${item.enabled ? 'right-1' : 'left-1'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <button onClick={() => toast.success("Pengaturan pembayaran berhasil disimpan")} className="flex items-center gap-2 px-6 py-2.5 bg-[#FF6B1A] text-[#FFFFFF] rounded-xl font-bold text-sm hover:bg-[#FFB347] transition-all shadow-md shadow-orange-500/20">
                  <Save size={18} /> Simpan Pengaturan Pembayaran
                </button>
              </motion.div>
            )}

            {activeTab === "database" && (
              <motion.div
                key="database"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E2E8F0] space-y-4 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Download size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1E293B]">Backup Data</h4>
                      <p className="text-xs text-[#64748B] mt-1">Ekspor seluruh data ke file JSON untuk cadangan lokal.</p>
                    </div>
                    <button onClick={() => toast.info("Memulai proses backup...")} className="w-full py-2.5 rounded-xl border border-[#E2E8F0] text-[#1E293B] text-sm font-bold hover:bg-[#F8FAFC] transition-all flex items-center justify-center gap-2">
                      Unduh Cadangan
                    </button>
                  </div>

                  <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E2E8F0] space-y-4 shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                      <Upload size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#1E293B]">Restore Data</h4>
                      <p className="text-xs text-[#64748B] mt-1">Impor data dari file backup sebelumnya.</p>
                    </div>
                    <button onClick={() => toast.info("Pilih file backup untuk restore")} className="w-full py-2.5 rounded-xl border border-[#E2E8F0] text-[#1E293B] text-sm font-bold hover:bg-[#F8FAFC] transition-all flex items-center justify-center gap-2">
                      Unggah File
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-red-500/5 rounded-2xl border border-red-500/20 space-y-4">
                  <div className="flex items-center gap-3 text-red-500">
                    <ShieldCheck size={20} />
                    <h4 className="font-bold">Pemeliharaan Sistem</h4>
                  </div>
                  <p className="text-xs text-[#64748B]">Tindakan di bawah ini bersifat permanen. Harap berhati-hati sebelum memproses.</p>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => window.confirm("Bersihkan cache?")} className="px-4 py-2 rounded-xl border border-red-500/20 text-red-500 text-xs font-bold hover:bg-red-500/10">
                      Bersihkan Cache
                    </button>
                    <button onClick={() => window.confirm("Reset Database ke awal?")} className="px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600">
                      Reset Semua Data
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <MasterPengguna
                  users={users}
                  onAdd={onAddUser}
                  onUpdate={onUpdateUser}
                  onDelete={onDeleteUser}
                />
              </motion.div>
            )}
            {activeTab === "services" && (
              <motion.div
                key="services"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl space-y-6"
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-[#1E293B]">Pengaturan Layanan</h3>
                  <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-[#E2E8F0] space-y-4 shadow-sm">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Biaya Desain Standar (IDR)</label>
                      <input type="text" defaultValue="25.000" className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-sm text-[#FF6B1A] font-bold focus:border-[#FF6B1A] outline-none transition-all" />
                      <p className="text-[10px] text-[#94A3B8]">Biaya ini akan menjadi nilai default saat opsi permintaan desain diaktifkan di kasir.</p>
                    </div>

                    <div className="pt-6 border-t border-[#E2E8F0] space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-[#1E293B]">Skema Biaya Berbasis Waktu</h4>
                        <span className="px-2 py-0.5 rounded bg-green-50 text-[9px] font-bold text-green-600 uppercase border border-green-100">Otomatis Aktif</span>
                      </div>
                      
                      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl overflow-hidden">
                        <table className="w-full text-left text-[11px]">
                          <thead className="bg-[#FFFFFF] border-b border-[#E2E8F0]">
                            <tr>
                              <th className="px-4 py-2.5 font-bold text-[#64748B]">Durasi (Menit)</th>
                              <th className="px-4 py-2.5 font-bold text-[#64748B]">Biaya Jasa (IDR)</th>
                              <th className="px-4 py-2.5"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E2E8F0]">
                            <tr>
                              <td className="px-4 py-2.5 text-[#1E293B]">0 - 30 Menit</td>
                              <td className="px-4 py-2.5 font-bold text-[#FF6B1A]">Rp 10.000</td>
                              <td className="px-4 py-2.5 text-right"><button className="text-[#94A3B8] hover:text-red-500 transition-colors"><Trash2 size={14}/></button></td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2.5 text-[#1E293B]">31 - 60 Menit</td>
                              <td className="px-4 py-2.5 font-bold text-[#FF6B1A]">Rp 20.000</td>
                              <td className="px-4 py-2.5 text-right"><button className="text-[#94A3B8] hover:text-red-500 transition-colors"><Trash2 size={14}/></button></td>
                            </tr>
                            <tr>
                              <td className="px-4 py-2.5 text-[#1E293B]">61 - 120 Menit</td>
                              <td className="px-4 py-2.5 font-bold text-[#FF6B1A]">Rp 35.000</td>
                              <td className="px-4 py-2.5 text-right"><button className="text-[#94A3B8] hover:text-red-500 transition-colors"><Trash2 size={14}/></button></td>
                            </tr>
                          </tbody>
                        </table>
                        <div className="p-3 bg-[#FFFFFF] flex items-center gap-2">
                           <div className="flex-1 flex gap-2">
                             <input placeholder="Menit (Contoh: 30)" className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-[10px] outline-none focus:border-[#FF6B1A]" />
                             <input placeholder="Harga (Contoh: 10000)" className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-1.5 text-[10px] outline-none focus:border-[#FF6B1A]" />
                           </div>
                           <button className="px-3 py-1.5 bg-[#FF6B1A] text-white rounded-lg text-[10px] font-bold hover:bg-[#FFB347] transition-all">Tambah Aturan</button>
                        </div>
                      </div>
                      <p className="text-[10px] text-[#94A3B8] italic">* Sistem akan menyarankan biaya berdasarkan durasi timer di halaman intake desain.</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => toast.success("Pengaturan layanan disimpan")} className="flex items-center gap-2 px-6 py-2.5 bg-[#FF6B1A] text-[#FFFFFF] rounded-xl font-bold text-sm hover:bg-[#FFB347] transition-all shadow-md shadow-orange-500/20">
                  <Save size={18} /> Simpan Pengaturan
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
