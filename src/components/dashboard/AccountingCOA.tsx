import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, Filter, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Account, AccountType, AccountNormalBalance, DEFAULT_ACCOUNTS } from "@/types/accounting";

export default function AccountingCOA() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("All");
  
  const [showModal, setShowModal] = useState(false);
  const [newAccount, setNewAccount] = useState<Partial<Account>>({
    code: "",
    name: "",
    type: "Asset",
    normalBalance: "Debit"
  });

  useEffect(() => {
    const saved = localStorage.getItem("accounting_coa");
    if (saved) {
      setAccounts(JSON.parse(saved));
    } else {
      setAccounts(DEFAULT_ACCOUNTS);
      localStorage.setItem("accounting_coa", JSON.stringify(DEFAULT_ACCOUNTS));
    }
  }, []);

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'Asset': return 'bg-blue-100 text-blue-700';
      case 'Liability': return 'bg-red-100 text-red-700';
      case 'Equity': return 'bg-purple-100 text-purple-700';
      case 'Revenue': return 'bg-green-100 text-green-700';
      case 'Expense': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getNormalBalanceIndo = (bal: string) => bal === 'Debit' ? 'Debit' : 'Kredit';
  const getTypeIndo = (type: string) => {
    switch(type) {
      case 'Asset': return 'Harta / Aset';
      case 'Liability': return 'Hutang / Kewajiban';
      case 'Equity': return 'Modal / Ekuitas';
      case 'Revenue': return 'Pendapatan';
      case 'Expense': return 'Beban / Biaya';
      default: return type;
    }
  };

  const filteredAccounts = accounts.filter(a => {
    const matchSearch = a.code.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        a.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === "All" || a.type === filterType;
    return matchSearch && matchType;
  }).sort((a, b) => a.code.localeCompare(b.code));

  const handleSaveAccount = () => {
    if (!newAccount.code || !newAccount.name) {
      toast.error("Kode dan Nama Akun wajib diisi!");
      return;
    }
    
    // Cek duplikasi kode
    if (accounts.some(a => a.code === newAccount.code)) {
      toast.error("Kode Akun sudah digunakan!");
      return;
    }

    const accountToSave: Account = {
      id: Date.now().toString(),
      code: newAccount.code,
      name: newAccount.name,
      type: newAccount.type as AccountType,
      normalBalance: newAccount.normalBalance as AccountNormalBalance
    };

    const updatedAccounts = [...accounts, accountToSave];
    setAccounts(updatedAccounts);
    localStorage.setItem("accounting_coa", JSON.stringify(updatedAccounts));
    toast.success("Akun baru berhasil ditambahkan!");
    
    setShowModal(false);
    setNewAccount({ code: "", name: "", type: "Asset", normalBalance: "Debit" });
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      <div className="p-6 border-b border-[#E2E8F0] bg-[#FFFFFF] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-[#1E293B]" style={{ fontFamily: "Syne, sans-serif" }}>Kode Akun (COA)</h2>
          <p className="text-xs lg:text-sm text-[#64748B]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            Bagan akun standar akuntansi Indonesia (Chart of Accounts)
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => setShowModal(true)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6B1A] text-white hover:bg-[#FFB347] transition-all shadow-lg shadow-orange-500/20"
          >
            <Plus size={14} /> Tambah Akun Baru
          </button>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col">
          {/* Header & Filter */}
          <div className="p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#F8FAFC]">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
              <input
                type="text"
                placeholder="Cari kode atau nama akun..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-xs focus:border-[#FF6B1A] outline-none"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={16} className="text-[#94A3B8]" />
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#FF6B1A] w-full sm:w-auto"
              >
                <option value="All">Semua Kategori</option>
                <option value="Asset">Harta / Aset</option>
                <option value="Liability">Hutang / Kewajiban</option>
                <option value="Equity">Modal / Ekuitas</option>
                <option value="Revenue">Pendapatan</option>
                <option value="Expense">Beban / Biaya</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F8FAFC]">
                  <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Kode</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Nama Akun</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Kategori</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Saldo Normal</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredAccounts.map((account) => (
                  <tr key={account.id} className="hover:bg-[#F8FAFC] transition-colors group">
                    <td className="px-6 py-3 text-sm font-bold text-[#1E293B]" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                      {account.code}
                    </td>
                    <td className="px-6 py-3 text-sm text-[#1E293B] font-medium">
                      {account.name}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${getTypeColor(account.type)}`}>
                        {getTypeIndo(account.type)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-[#64748B] font-medium">
                      {getNormalBalanceIndo(account.normalBalance)}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAccounts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-[#64748B]">
                      Tidak ada data akun yang ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#FFFFFF] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <h3 className="font-bold text-[#1E293B]" style={{ fontFamily: "Syne, sans-serif" }}>
                  Tambah Akun Baru
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-200 text-slate-500 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Kode Akun</label>
                  <input
                    type="text"
                    placeholder="Contoh: 114"
                    value={newAccount.code}
                    onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2 text-sm text-[#1E293B] focus:border-[#FF6B1A] outline-none transition-all"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Nama Akun</label>
                  <input
                    type="text"
                    placeholder="Contoh: Piutang Karyawan"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2 text-sm text-[#1E293B] focus:border-[#FF6B1A] outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Kategori</label>
                    <select
                      value={newAccount.type}
                      onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value as AccountType })}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2 text-sm text-[#1E293B] focus:border-[#FF6B1A] outline-none transition-all"
                    >
                      <option value="Asset">Harta / Aset</option>
                      <option value="Liability">Hutang / Kewajiban</option>
                      <option value="Equity">Modal / Ekuitas</option>
                      <option value="Revenue">Pendapatan</option>
                      <option value="Expense">Beban / Biaya</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">Saldo Normal</label>
                    <select
                      value={newAccount.normalBalance}
                      onChange={(e) => setNewAccount({ ...newAccount, normalBalance: e.target.value as AccountNormalBalance })}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2 text-sm text-[#1E293B] focus:border-[#FF6B1A] outline-none transition-all"
                    >
                      <option value="Debit">Debit</option>
                      <option value="Credit">Kredit</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-[#64748B] bg-white border border-[#E2E8F0] hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveAccount}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#FF6B1A] hover:bg-[#FFB347] transition-all shadow-md shadow-orange-500/20"
                >
                  Simpan Akun
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
