import { useState, useEffect } from "react";
import { Search, Filter, BookOpen } from "lucide-react";
import { JournalEntry, Account, DEFAULT_ACCOUNTS } from "@/types/accounting";

export default function AccountingLedger() {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>("111");

  useEffect(() => {
    const savedJournals = localStorage.getItem("accounting_journals");
    if (savedJournals) setJournals(JSON.parse(savedJournals));

    const savedAccounts = localStorage.getItem("accounting_coa");
    if (savedAccounts) {
      setAccounts(JSON.parse(savedAccounts));
    } else {
      setAccounts(DEFAULT_ACCOUNTS);
    }
  }, []);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  // Get mutations for selected account
  const mutations = journals.flatMap(j => 
    j.items.filter(item => item.accountId === selectedAccount).map(item => ({
      date: j.date,
      reference: j.reference,
      description: j.description,
      debit: item.debit,
      credit: item.credit
    }))
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let runningBalance = 0;
  const currentAcc = accounts.find(a => a.id === selectedAccount);
  const isDebitNormal = currentAcc?.normalBalance === "Debit";

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      <div className="p-6 border-b border-[#E2E8F0] bg-[#FFFFFF] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-[#1E293B]" style={{ fontFamily: "Syne, sans-serif" }}>Buku Besar</h2>
          <p className="text-xs lg:text-sm text-[#64748B]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            Rincian mutasi debit/kredit per akun
          </p>
        </div>
      </div>

      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-6">
        <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col sm:flex-row gap-4 items-center">
          <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Pilih Akun:</label>
          <select 
            value={selectedAccount}
            onChange={(e) => setSelectedAccount(e.target.value)}
            className="w-full sm:w-80 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-2 text-sm font-bold text-[#1E293B] focus:border-[#FF6B1A] outline-none transition-all"
          >
            {accounts.map(acc => (
              <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
            ))}
          </select>
        </div>

        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F8FAFC]">
                  <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest w-32">Tanggal</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest w-32">Referensi</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Keterangan</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest text-right w-32">Debit</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest text-right w-32">Kredit</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-[#64748B] uppercase tracking-widest text-right w-40">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {mutations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-[#64748B]">
                      Belum ada mutasi untuk akun ini.
                    </td>
                  </tr>
                ) : (
                  mutations.map((m, idx) => {
                    if (isDebitNormal) {
                      runningBalance += m.debit - m.credit;
                    } else {
                      runningBalance += m.credit - m.debit;
                    }

                    return (
                      <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="px-6 py-3 text-sm font-medium text-[#1E293B]">
                          {new Date(m.date).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-3 text-xs font-bold text-[#FF6B1A]">
                          {m.reference}
                        </td>
                        <td className="px-6 py-3 text-sm text-[#1E293B]">
                          {m.description}
                        </td>
                        <td className="px-6 py-3 text-sm font-bold text-[#1E293B] text-right">
                          {m.debit > 0 ? formatCurrency(m.debit) : '-'}
                        </td>
                        <td className="px-6 py-3 text-sm font-bold text-[#1E293B] text-right">
                          {m.credit > 0 ? formatCurrency(m.credit) : '-'}
                        </td>
                        <td className="px-6 py-3 text-sm font-black text-[#1E293B] text-right bg-slate-50">
                          {formatCurrency(runningBalance)}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
