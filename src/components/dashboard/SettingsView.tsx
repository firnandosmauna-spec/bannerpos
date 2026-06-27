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

  // State Perusahaan
  const [companyName, setCompanyName] = useState(() => localStorage.getItem("companyName") || "BANNERPOS");
  const [companyAddress, setCompanyAddress] = useState(() => localStorage.getItem("companyAddress") || "Jl. Raya Percetakan No. 123, Jakarta Pusat");
  const [companyPhone, setCompanyPhone] = useState(() => localStorage.getItem("companyPhone") || "0812-3456-7890");
  const [companyEmail, setCompanyEmail] = useState(() => localStorage.getItem("companyEmail") || "admin@bannerpos.com");

  // State Nota
  const [storeName, setStoreName] = useState(() => localStorage.getItem("receiptStoreName") || "BANNERPOS PERCETAKAN");
  const [storeAddress, setStoreAddress] = useState(() => localStorage.getItem("receiptStoreAddress") || "Jl. Raya Percetakan No. 123\nJakarta Pusat");
  const [storeContact, setStoreContact] = useState(() => localStorage.getItem("receiptStoreContact") || "WA: 0812-3456-7890");
  const [footerMessage, setFooterMessage] = useState(() => localStorage.getItem("receiptFooterMessage") || "Barang yang sudah dicetak\ntidak dapat dikembalikan.\nTerima Kasih!");
  const [showKasir, setShowKasir] = useState(() => localStorage.getItem("receiptShowKasir") !== "false");

  const saveReceiptSettings = () => {
    localStorage.setItem("receiptStoreName", storeName);
    localStorage.setItem("receiptStoreAddress", storeAddress);
    localStorage.setItem("receiptStoreContact", storeContact);
    localStorage.setItem("receiptFooterMessage", footerMessage);
    localStorage.setItem("receiptShowKasir", showKasir.toString());
    toast.success("Pengaturan Nota berhasil disimpan");
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] overflow-hidden">
      <div className="p-4 border-b border-[#E2E8F0] bg-[#FFFFFF]">
        <h2 className="text-lg lg:text-xl font-bold text-[#1E293B]" style={{ fontFamily: "Syne, sans-serif" }}>Pengaturan Sistem</h2>
        <p className="text-[11px] lg:text-xs text-[#64748B]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Konfigurasi profil perusahaan, format nota, dan manajemen database</p>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Sub-tabs Sidebar */}
        <div className="w-full lg:w-56 bg-[#FFFFFF] border-r border-[#E2E8F0] p-3 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-y-auto no-scrollbar">
          <button
            onClick={() => setActiveTab("company")}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all whitespace-nowrap ${activeTab === 'company' ? 'bg-[#FF6B1A] text-[#FFFFFF] shadow-md shadow-orange-500/20' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}
          >
            <span className="text-base">🏢</span>
            <span className="text-xs font-bold">Perusahaan</span>
          </button>
          <button
            onClick={() => setActiveTab("receipt")}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all whitespace-nowrap ${activeTab === 'receipt' ? 'bg-[#FF6B1A] text-[#FFFFFF] shadow-md shadow-orange-500/20' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}
          >
            <span className="text-base">🧾</span>
            <span className="text-xs font-bold">Format Nota</span>
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all whitespace-nowrap ${activeTab === 'payments' ? 'bg-[#FF6B1A] text-[#FFFFFF] shadow-md shadow-orange-500/20' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}
          >
            <span className="text-base">💳</span>
            <span className="text-xs font-bold">Pembayaran</span>
          </button>
          <button
            onClick={() => setActiveTab("database")}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all whitespace-nowrap ${activeTab === 'database' ? 'bg-[#FF6B1A] text-[#FFFFFF] shadow-md shadow-orange-500/20' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}
          >
            <span className="text-base">💾</span>
            <span className="text-xs font-bold">Database</span>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-[#FF6B1A] text-[#FFFFFF] shadow-md shadow-orange-500/20' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}
          >
            <span className="text-base">👥</span>
            <span className="text-xs font-bold">Pengguna</span>
          </button>
          <button
            onClick={() => setActiveTab("services")}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all whitespace-nowrap ${activeTab === 'services' ? 'bg-[#FF6B1A] text-[#FFFFFF] shadow-md shadow-orange-500/20' : 'text-[#64748B] hover:bg-[#F8FAFC]'}`}
          >
            <span className="text-base">🛠️</span>
            <span className="text-xs font-bold">Layanan</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-6 custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === "company" && (
              <motion.div
                key="company"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl space-y-4"
              >
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-[#1E293B]">Profil Perusahaan</h3>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Nama Bisnis</label>
                      <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2 text-xs text-[#1E293B] focus:border-[#FF6B1A] outline-none transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Alamat Lengkap</label>
                      <textarea rows={2} value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2 text-xs text-[#1E293B] focus:border-[#FF6B1A] outline-none resize-none transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Telepon / WA</label>
                        <input type="text" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2 text-xs text-[#1E293B] focus:border-[#FF6B1A] outline-none transition-all" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Email</label>
                        <input type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2 text-xs text-[#1E293B] focus:border-[#FF6B1A] outline-none transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={() => {
                  localStorage.setItem("companyName", companyName);
                  localStorage.setItem("companyAddress", companyAddress);
                  localStorage.setItem("companyPhone", companyPhone);
                  localStorage.setItem("companyEmail", companyEmail);
                  window.dispatchEvent(new Event("companyProfileUpdated"));
                  toast.success("Profil perusahaan diperbarui");
                }} className="flex items-center gap-2 px-5 py-2 bg-[#FF6B1A] text-[#FFFFFF] rounded-xl font-bold text-xs hover:bg-[#FFB347] transition-all shadow-md shadow-orange-500/20">
                  <Save size={16} /> Simpan Perubahan
                </button>
              </motion.div>
            )}

            {activeTab === "receipt" && (
              <motion.div
                key="receipt"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl space-y-4"
              >
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-[#1E293B]">Pengaturan Template Nota (Termal 80mm)</h3>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Nama Toko / Judul Header</label>
                      <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2 text-xs text-[#1E293B] focus:border-[#FF6B1A] outline-none transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Alamat Toko</label>
                      <textarea rows={2} value={storeAddress} onChange={(e) => setStoreAddress(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2 text-xs text-[#1E293B] focus:border-[#FF6B1A] outline-none resize-none transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Kontak (Telp/WA)</label>
                      <input type="text" value={storeContact} onChange={(e) => setStoreContact(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2 text-xs text-[#1E293B] focus:border-[#FF6B1A] outline-none transition-all" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Catatan Kaki (Footer / S&K)</label>
                      <textarea rows={2} value={footerMessage} onChange={(e) => setFooterMessage(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2 text-xs text-[#1E293B] focus:border-[#FF6B1A] outline-none resize-none transition-all" />
                    </div>
                    <label className="flex items-center gap-2 p-2 border border-[#E2E8F0] rounded-xl cursor-pointer hover:bg-[#F8FAFC]">
                      <input type="checkbox" checked={showKasir} onChange={(e) => setShowKasir(e.target.checked)} className="rounded text-[#FF6B1A] focus:ring-[#FF6B1A] w-4 h-4" />
                      <span className="text-xs font-medium text-[#1E293B]">Tampilkan Nama Kasir di Nota</span>
                    </label>

                    <div className="space-y-1 pt-3 border-t border-[#E2E8F0]">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-xs font-bold text-[#1E293B]">Nomor Invoice Manual</label>
                          <p className="text-[9px] text-[#64748B]">Izinkan kasir memasukkan nomor invoice secara manual.</p>
                        </div>
                        <button 
                          onClick={() => setEnableManualInvoice(!enableManualInvoice)}
                          className={`w-9 h-5 rounded-full relative transition-all ${enableManualInvoice ? 'bg-[#2ECC71]' : 'bg-[#CBD5E1]'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${enableManualInvoice ? 'right-0.5' : 'left-0.5'}`} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E2E8F0]">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Prefix Invoice</label>
                        <input 
                          type="text" 
                          value={autoInvoicePrefix}
                          onChange={(e) => setAutoInvoicePrefix(e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:border-[#FF6B1A] outline-none transition-all" 
                          placeholder="Contoh: ORD-"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Mulai dari Nomor</label>
                        <input 
                          type="number" 
                          value={autoInvoiceCounter}
                          onChange={(e) => setAutoInvoiceCounter(e.target.value)}
                          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:border-[#FF6B1A] outline-none transition-all" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={() => {
                  saveReceiptSettings();
                  localStorage.setItem("enableManualInvoice", enableManualInvoice.toString());
                  localStorage.setItem("autoInvoicePrefix", autoInvoicePrefix);
                  localStorage.setItem("currentInvoiceCounter", autoInvoiceCounter);
                }} className="flex items-center gap-2 px-5 py-2 bg-[#FF6B1A] text-[#FFFFFF] rounded-xl font-bold text-xs hover:bg-[#FFB347] transition-all shadow-md shadow-orange-500/20">
                  <Save size={16} /> Simpan Konfigurasi
                </button>
              </motion.div>
            )}
            
            {activeTab === "payments" && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl space-y-4"
              >
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-[#1E293B]">Pengaturan Pembayaran</h3>
                  
                  {/* QRIS Configuration */}
                  <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E2E8F0] space-y-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-[#FF6B1A]">
                        <QrCode size={16} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#1E293B]">Konfigurasi QRIS</h4>
                        <p className="text-[9px] text-[#64748B]">Metode pembayaran non-tunai via kode QR</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Nama Merchant</label>
                        <input type="text" defaultValue="BANNERPOS PRINTING" className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:border-[#FF6B1A] outline-none transition-all" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">ID Merchant (NMID)</label>
                        <input type="text" defaultValue="ID1020304050607" className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#1E293B] focus:border-[#FF6B1A] outline-none transition-all" />
                      </div>
                    </div>
                    
                    <div className="p-3 border-2 border-dashed border-[#E2E8F0] rounded-xl flex flex-col items-center justify-center gap-1 hover:border-[#FF6B1A]/40 transition-all cursor-pointer bg-[#F8FAFC]">
                      <Upload className="text-[#94A3B8]" size={20} />
                      <p className="text-[10px] font-bold text-[#64748B] uppercase">Unggah Gambar QRIS</p>
                      <p className="text-[9px] text-[#94A3B8]">Format JPG/PNG, Maks 2MB</p>
                    </div>
                  </div>

                  {/* Bank Transfer */}
                  <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E2E8F0] space-y-3 shadow-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Landmark size={16} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#1E293B]">Rekening Bank</h4>
                        <p className="text-[9px] text-[#64748B]">Daftar rekening untuk transfer bank</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-2 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                        <div className="w-8 h-8 rounded-md bg-white border border-[#E2E8F0] flex items-center justify-center font-bold text-[10px] text-blue-600">BCA</div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-[#1E293B]">8820991234</p>
                          <p className="text-[9px] text-[#64748B]">a.n. PT BANNER PRATAMA</p>
                        </div>
                        <button className="text-[#94A3B8] hover:text-red-500 transition-colors"><Trash2 size={12}/></button>
                      </div>
                      
                      <div className="flex items-center gap-3 p-2 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                        <div className="w-8 h-8 rounded-md bg-white border border-[#E2E8F0] flex items-center justify-center font-bold text-[10px] text-[#FF6B1A]">MDR</div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-[#1E293B]">1230009988776</p>
                          <p className="text-[9px] text-[#64748B]">a.n. BANNERPOS PRINTING</p>
                        </div>
                        <button className="text-[#94A3B8] hover:text-red-500 transition-colors"><Trash2 size={12}/></button>
                      </div>
                    </div>
                    
                    <button className="w-full py-2 rounded-lg border border-dashed border-[#E2E8F0] text-[#64748B] text-[10px] font-bold uppercase hover:bg-[#F8FAFC] transition-all">
                      + Tambah Rekening
                    </button>
                  </div>

                  {/* Payment Method Toggle */}
                  <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E2E8F0] space-y-3 shadow-sm">
                    <h4 className="font-bold text-[#1E293B] text-xs">Aktivasi Metode Pembayaran</h4>
                    <div className="space-y-2">
                      {[
                        { name: "Tunai / Cash", enabled: true },
                        { name: "QRIS Dinamis", enabled: true },
                        { name: "Transfer Bank", enabled: true },
                        { name: "Down Payment (DP)", enabled: true },
                        { name: "Piutang Pelanggan", enabled: false }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-[#F8FAFC] rounded-lg">
                          <span className="text-[11px] font-medium text-[#1E293B]">{item.name}</span>
                          <button className={`w-9 h-5 rounded-full relative transition-all ${item.enabled ? 'bg-[#2ECC71]' : 'bg-[#CBD5E1]'}`}>
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${item.enabled ? 'right-0.5' : 'left-0.5'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <button onClick={() => toast.success("Pengaturan pembayaran berhasil disimpan")} className="flex items-center gap-2 px-5 py-2 bg-[#FF6B1A] text-[#FFFFFF] rounded-xl font-bold text-xs hover:bg-[#FFB347] transition-all shadow-md shadow-orange-500/20">
                  <Save size={16} /> Simpan Pengaturan
                </button>
              </motion.div>
            )}

            {activeTab === "database" && (
              <motion.div
                key="database"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-2xl space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E2E8F0] space-y-3 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                      <Download size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1E293B]">Backup Data</h4>
                      <p className="text-[10px] text-[#64748B] mt-1">Ekspor seluruh data ke file JSON untuk cadangan lokal.</p>
                    </div>
                    <button onClick={() => toast.info("Memulai proses backup...")} className="w-full py-2 rounded-lg border border-[#E2E8F0] text-[#1E293B] text-[11px] font-bold hover:bg-[#F8FAFC] transition-all flex items-center justify-center gap-2">
                      Unduh Cadangan
                    </button>
                  </div>

                  <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E2E8F0] space-y-3 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                      <Upload size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#1E293B]">Restore Data</h4>
                      <p className="text-[10px] text-[#64748B] mt-1">Impor data dari file backup sebelumnya.</p>
                    </div>
                    <button onClick={() => toast.info("Pilih file backup untuk restore")} className="w-full py-2 rounded-lg border border-[#E2E8F0] text-[#1E293B] text-[11px] font-bold hover:bg-[#F8FAFC] transition-all flex items-center justify-center gap-2">
                      Unggah File
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/20 space-y-3">
                  <div className="flex items-center gap-2 text-red-500">
                    <ShieldCheck size={18} />
                    <h4 className="font-bold text-sm">Pemeliharaan Sistem</h4>
                  </div>
                  <p className="text-[10px] text-[#64748B]">Tindakan di bawah ini bersifat permanen. Harap berhati-hati sebelum memproses.</p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => window.confirm("Bersihkan cache?")} className="px-3 py-1.5 rounded-lg border border-red-500/20 text-red-500 text-[11px] font-bold hover:bg-red-500/10">
                      Bersihkan Cache
                    </button>
                    <button onClick={() => window.confirm("Reset Database ke awal?")} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-[11px] font-bold hover:bg-red-600">
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
                className="max-w-2xl space-y-4"
              >
                <div className="space-y-3">
                  <h3 className="text-base font-bold text-[#1E293B]">Pengaturan Layanan</h3>
                  <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E2E8F0] space-y-3 shadow-sm">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Biaya Desain Standar (IDR)</label>
                      <input type="text" defaultValue="25.000" className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs text-[#FF6B1A] font-bold focus:border-[#FF6B1A] outline-none transition-all" />
                      <p className="text-[9px] text-[#94A3B8]">Biaya ini akan menjadi nilai default saat opsi permintaan desain diaktifkan di kasir.</p>
                    </div>

                    <div className="pt-4 border-t border-[#E2E8F0] space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#1E293B]">Skema Biaya Berbasis Waktu</h4>
                        <span className="px-2 py-0.5 rounded bg-green-50 text-[8px] font-bold text-green-600 uppercase border border-green-100">Otomatis Aktif</span>
                      </div>
                      
                      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg overflow-hidden">
                        <table className="w-full text-left text-[10px]">
                          <thead className="bg-[#FFFFFF] border-b border-[#E2E8F0]">
                            <tr>
                              <th className="px-3 py-2 font-bold text-[#64748B]">Durasi (Menit)</th>
                              <th className="px-3 py-2 font-bold text-[#64748B]">Biaya Jasa (IDR)</th>
                              <th className="px-3 py-2"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#E2E8F0]">
                            <tr>
                              <td className="px-3 py-2 text-[#1E293B]">0 - 30 Menit</td>
                              <td className="px-3 py-2 font-bold text-[#FF6B1A]">Rp 10.000</td>
                              <td className="px-3 py-2 text-right"><button className="text-[#94A3B8] hover:text-red-500 transition-colors"><Trash2 size={12}/></button></td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-[#1E293B]">31 - 60 Menit</td>
                              <td className="px-3 py-2 font-bold text-[#FF6B1A]">Rp 20.000</td>
                              <td className="px-3 py-2 text-right"><button className="text-[#94A3B8] hover:text-red-500 transition-colors"><Trash2 size={12}/></button></td>
                            </tr>
                            <tr>
                              <td className="px-3 py-2 text-[#1E293B]">61 - 120 Menit</td>
                              <td className="px-3 py-2 font-bold text-[#FF6B1A]">Rp 35.000</td>
                              <td className="px-3 py-2 text-right"><button className="text-[#94A3B8] hover:text-red-500 transition-colors"><Trash2 size={12}/></button></td>
                            </tr>
                          </tbody>
                        </table>
                        <div className="p-2 bg-[#FFFFFF] flex items-center gap-2">
                           <div className="flex-1 flex gap-1">
                             <input placeholder="Menit" className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md px-2 py-1 text-[9px] outline-none focus:border-[#FF6B1A]" />
                             <input placeholder="Harga" className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-md px-2 py-1 text-[9px] outline-none focus:border-[#FF6B1A]" />
                           </div>
                           <button className="px-2 py-1 bg-[#FF6B1A] text-white rounded-md text-[9px] font-bold hover:bg-[#FFB347] transition-all">Tambah</button>
                        </div>
                      </div>
                      <p className="text-[9px] text-[#94A3B8] italic">* Sistem akan menyarankan biaya berdasarkan durasi timer di halaman intake desain.</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => toast.success("Pengaturan layanan disimpan")} className="flex items-center gap-2 px-5 py-2 bg-[#FF6B1A] text-[#FFFFFF] rounded-xl font-bold text-xs hover:bg-[#FFB347] transition-all shadow-md shadow-orange-500/20">
                  <Save size={16} /> Simpan Pengaturan
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
