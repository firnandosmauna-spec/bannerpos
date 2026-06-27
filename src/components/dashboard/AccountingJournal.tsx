import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, X, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { JournalEntry, JournalItem, Account, DEFAULT_ACCOUNTS } from "@/types/accounting";

export default function AccountingJournal() {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [showModal, setShowModal] = useState(false);
  const [newJournal, setNewJournal] = useState<Partial<JournalEntry>>({
    date: new Date().toISOString().slice(0, 10),
    reference: "",
    description: "",
    items: []
  });

  useEffect(() => {
    const saved = localStorage.getItem("accounting_journals");
    if (saved) {
      setJournals(JSON.parse(saved));
    } else {
      const dummyJournals: JournalEntry[] = [
        {
          id: "J-001",
          date: new Date().toISOString(),
          reference: "INV-2024-001",
          description: "Setoran Modal Awal Pemilik",
          items: [
            { id: "ji-1", accountId: "111", accountCode: "111", accountName: "Kas & Bank", debit: 50000000, credit: 0 },
            { id: "ji-2", accountId: "311", accountCode: "311", accountName: "Modal Pemilik", debit: 0, credit: 50000000 },
          ]
        },
        {
          id: "J-002",
          date: new Date().toISOString(),
          reference: "BYR-001",
          description: "Pembayaran Sewa Ruko Bulan Ini",
          items: [
            { id: "ji-3", accountId: "614", accountCode: "614", accountName: "Beban Sewa Tempat", debit: 2000000, credit: 0 },
            { id: "ji-4", accountId: "111", accountCode: "111", accountName: "Kas & Bank", debit: 0, credit: 2000000 },
          ]
        },
        {
          id: "J-003",
          date: new Date().toISOString(),
          reference: "SLS-001",
          description: "Pendapatan Jasa Cetak Spanduk",
          items: [
            { id: "ji-5", accountId: "111", accountCode: "111", accountName: "Kas & Bank", debit: 500000, credit: 0 },
            { id: "ji-6", accountId: "411", accountCode: "411", accountName: "Pendapatan Jasa Cetak", debit: 0, credit: 500000 },
          ]
        }
      ];
      setJournals(dummyJournals);
      localStorage.setItem("accounting_journals", JSON.stringify(dummyJournals));
    }

    const savedAccounts = localStorage.getItem("accounting_coa");
    if (savedAccounts) {
      setAccounts(JSON.parse(savedAccounts));
    } else {
      setAccounts(DEFAULT_ACCOUNTS);
    }
  }, []);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  const filteredJournals = journals.filter(j => 
    j.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
    j.reference.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleAddItem = () => {
    const items = newJournal.items || [];
    setNewJournal({
      ...newJournal,
      items: [
        ...items,
        { id: Date.now().toString(), accountId: "", accountCode: "", accountName: "", debit: 0, credit: 0 }
      ]
    });
  };

  const handleUpdateItem = (id: string, field: keyof JournalItem, value: any) => {
    const items = newJournal.items?.map(item => {
      if (item.id === id) {
        if (field === 'accountId') {
          const acc = accounts.find(a => a.id === value);
          return { ...item, accountId: value, accountCode: acc?.code || "", accountName: acc?.name || "" };
        }
        return { ...item, [field]: value };
      }
      return item;
    }) || [];
    setNewJournal({ ...newJournal, items });
  };

  const handleRemoveItem = (id: string) => {
    const items = newJournal.items?.filter(item => item.id !== id) || [];
    setNewJournal({ ...newJournal, items });
  };

  const totalDebit = newJournal.items?.reduce((sum, item) => sum + (item.debit || 0), 0) || 0;
  const totalCredit = newJournal.items?.reduce((sum, item) => sum + (item.credit || 0), 0) || 0;

  const handleSaveJournal = () => {
    if (!newJournal.date || !newJournal.reference || !newJournal.description) {
      toast.error("Tanggal, Referensi, dan Keterangan harus diisi!");
      return;
    }

    if (!newJournal.items || newJournal.items.length < 2) {
      toast.error("Minimal harus ada 2 akun (Debit dan Kredit)!");
      return;
    }

    if (totalDebit !== totalCredit) {
      toast.error("Total Debit dan Kredit tidak seimbang (Unbalanced)!");
      return;
    }

    if (totalDebit === 0) {
      toast.error("Total Debit/Kredit tidak boleh 0!");
      return;
    }

    for (let item of newJournal.items) {
      if (!item.accountId) {
        toast.error("Ada baris akun yang kosong!");
        return;
      }
    }

    const journalToSave: JournalEntry = {
      id: "J-" + Date.now().toString().slice(-6),
      date: new Date(newJournal.date).toISOString(),
      reference: newJournal.reference,
      description: newJournal.description,
      items: newJournal.items
    };

    const updated = [...journals, journalToSave];
    setJournals(updated);
    localStorage.setItem("accounting_journals", JSON.stringify(updated));
    toast.success("Jurnal berhasil disimpan!");
    
    setShowModal(false);
    setNewJournal({
      date: new Date().toISOString().slice(0, 10),
      reference: "",
      description: "",
      items: []
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      <div className="p-6 border-b border-[#E2E8F0] bg-[#FFFFFF] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-[#1E293B]" style={{ fontFamily: "Syne, sans-serif" }}>Jurnal Umum</h2>
          <p className="text-xs lg:text-sm text-[#64748B]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            Pencatatan riwayat transaksi debit dan kredit
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={() => {
              setNewJournal({
                date: new Date().toISOString().slice(0, 10),
                reference: "",
                description: "",
                items: [
                  { id: Date.now().toString() + "-1", accountId: "", accountCode: "", accountName: "", debit: 0, credit: 0 },
                  { id: Date.now().toString() + "-2", accountId: "", accountCode: "", accountName: "", debit: 0, credit: 0 }
                ]
              });
              setShowModal(true);
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6B1A] text-white hover:bg-[#FFB347] transition-all shadow-lg shadow-orange-500/20"
          >
            <Plus size={14} /> Tambah Jurnal Baru
          </button>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col">
          <div className="p-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row gap-4 justify-between items-center bg-[#F8FAFC]">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
              <input
                type="text"
                placeholder="Cari referensi atau deskripsi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl text-xs focus:border-[#FF6B1A] outline-none"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={16} className="text-[#94A3B8]" />
              <input type="date" className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#FF6B1A] w-full sm:w-auto" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F8FAFC]">
                  <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest w-32">Tanggal</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest w-32">Referensi</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Akun / Keterangan</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest text-right w-40">Debit</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest text-right w-40">Kredit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredJournals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-[#64748B]">
                      Belum ada data jurnal.
                    </td>
                  </tr>
                ) : (
                  filteredJournals.map((journal) => (
                    <React.Fragment key={journal.id}>
                      {/* Header Jurnal */}
                      <tr className="bg-slate-50/50">
                        <td className="px-6 py-3 text-sm font-bold text-[#1E293B] align-top" rowSpan={journal.items.length}>
                          {new Date(journal.date).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-3 text-xs font-bold text-[#FF6B1A] align-top" rowSpan={journal.items.length}>
                          {journal.reference}
                        </td>
                        <td colSpan={3} className="px-6 py-2 text-xs font-semibold text-[#64748B] italic bg-[#F8FAFC]">
                          {journal.description}
                        </td>
                      </tr>
                      {/* Baris Akun Debit/Kredit */}
                      {journal.items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-2 text-sm text-[#1E293B]">
                            <div className={`flex flex-col ${item.credit > 0 ? 'ml-6' : ''}`}>
                              <span className="font-bold">{item.accountCode} - {item.accountName}</span>
                            </div>
                          </td>
                          <td className="px-6 py-2 text-sm font-bold text-[#1E293B] text-right">
                            {item.debit > 0 ? formatCurrency(item.debit) : '-'}
                          </td>
                          <td className="px-6 py-2 text-sm font-bold text-[#1E293B] text-right">
                            {item.credit > 0 ? formatCurrency(item.credit) : '-'}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
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
              className="bg-[#FFFFFF] w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <h3 className="text-sm font-bold text-[#1E293B]" style={{ fontFamily: "Syne, sans-serif" }}>
                  Tambah Jurnal Baru
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-slate-200 text-slate-500 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-4 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Tanggal</label>
                    <input
                      type="date"
                      value={newJournal.date}
                      onChange={(e) => setNewJournal({ ...newJournal, date: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs text-[#1E293B] focus:border-[#FF6B1A] outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Referensi</label>
                    <input
                      type="text"
                      placeholder="Contoh: INV-001"
                      value={newJournal.reference}
                      onChange={(e) => setNewJournal({ ...newJournal, reference: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs text-[#1E293B] focus:border-[#FF6B1A] outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Keterangan</label>
                    <input
                      type="text"
                      placeholder="Contoh: Pembelian Bahan Baku"
                      value={newJournal.description}
                      onChange={(e) => setNewJournal({ ...newJournal, description: e.target.value })}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs text-[#1E293B] focus:border-[#FF6B1A] outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                        <th className="px-3 py-2 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Akun</th>
                        <th className="px-3 py-2 text-[10px] font-bold text-[#64748B] uppercase tracking-widest text-right w-32">Debit</th>
                        <th className="px-3 py-2 text-[10px] font-bold text-[#64748B] uppercase tracking-widest text-right w-32">Kredit</th>
                        <th className="px-3 py-2 text-[10px] font-bold text-[#64748B] uppercase tracking-widest text-center w-12">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {newJournal.items?.map((item) => (
                        <tr key={item.id} className="bg-white hover:bg-slate-50 transition-colors">
                          <td className="p-1.5">
                            <select
                              value={item.accountId}
                              onChange={(e) => handleUpdateItem(item.id, 'accountId', e.target.value)}
                              className="w-full bg-transparent border-none px-2 py-1 text-xs font-medium text-[#1E293B] outline-none cursor-pointer"
                            >
                              <option value="">-- Pilih Akun --</option>
                              {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-1.5">
                            <input
                              type="number"
                              min="0"
                              value={item.debit || ""}
                              onChange={(e) => handleUpdateItem(item.id, 'debit', Number(e.target.value))}
                              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2 py-1 text-xs font-bold text-[#1E293B] text-right focus:border-[#FF6B1A] outline-none"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="number"
                              min="0"
                              value={item.credit || ""}
                              onChange={(e) => handleUpdateItem(item.id, 'credit', Number(e.target.value))}
                              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-2 py-1 text-xs font-bold text-[#1E293B] text-right focus:border-[#FF6B1A] outline-none"
                            />
                          </td>
                          <td className="p-1.5 text-center">
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors mx-auto"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-[#F8FAFC] border-t border-[#E2E8F0]">
                      <tr>
                        <td className="p-2.5">
                          <button
                            onClick={handleAddItem}
                            className="flex items-center gap-1 text-[10px] font-bold text-[#FF6B1A] hover:underline uppercase tracking-wider"
                          >
                            <Plus size={12} /> Tambah Baris
                          </button>
                        </td>
                        <td className="p-2.5 text-right">
                          <span className="text-xs font-bold text-[#1E293B]">{formatCurrency(totalDebit)}</span>
                        </td>
                        <td className="p-2.5 text-right">
                          <span className="text-xs font-bold text-[#1E293B]">{formatCurrency(totalCredit)}</span>
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className={`p-2.5 rounded-xl flex items-center justify-center gap-2 border ${totalDebit === totalCredit && totalDebit > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <span className={`text-[10px] uppercase tracking-wider font-bold ${totalDebit === totalCredit && totalDebit > 0 ? 'text-[#2ECC71]' : 'text-red-500'}`}>
                    {totalDebit === totalCredit && totalDebit > 0 ? 'Neraca Seimbang (BALANCE)' : 'Neraca Tidak Seimbang (UNBALANCED)'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 border-t border-[#E2E8F0] bg-[#F8FAFC] flex justify-end gap-2.5 rounded-b-2xl">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] bg-white border border-[#E2E8F0] hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveJournal}
                  disabled={totalDebit !== totalCredit || totalDebit === 0}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF6B1A] hover:bg-[#FFB347] transition-all shadow-md shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Simpan Jurnal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
