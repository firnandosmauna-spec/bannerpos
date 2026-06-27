import { useState, useEffect } from "react";
import { JournalEntry, Account, DEFAULT_ACCOUNTS } from "@/types/accounting";
import { Printer } from "lucide-react";

export default function AccountingStatements() {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeTab, setActiveTab] = useState<"labarugi" | "neraca">("labarugi");

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

  // Hitung Saldo Tiap Akun
  const getAccountBalance = (accountId: string, normalBalance: string) => {
    let balance = 0;
    journals.forEach(j => {
      j.items.forEach(item => {
        if (item.accountId === accountId) {
          if (normalBalance === "Debit") {
            balance += item.debit - item.credit;
          } else {
            balance += item.credit - item.debit;
          }
        }
      });
    });
    return balance;
  };

  const getAccountsByType = (type: string) => {
    return accounts
      .filter(a => a.type === type)
      .map(a => ({ ...a, balance: getAccountBalance(a.id, a.normalBalance) }))
      .filter(a => a.balance !== 0); // Sembunyikan akun bersaldo 0 untuk kerapian
  };

  // Data Laba Rugi
  const revenues = getAccountsByType('Revenue');
  const expenses = getAccountsByType('Expense');
  
  const totalRevenue = revenues.reduce((sum, a) => sum + a.balance, 0);
  const totalExpense = expenses.reduce((sum, a) => sum + a.balance, 0);
  const netIncome = totalRevenue - totalExpense;

  // Data Neraca
  const assets = getAccountsByType('Asset');
  const liabilities = getAccountsByType('Liability');
  const equities = getAccountsByType('Equity');

  const totalAssets = assets.reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = liabilities.reduce((sum, a) => sum + a.balance, 0);
  // Tambahkan Laba Bersih ke Total Ekuitas
  const totalEquity = equities.reduce((sum, a) => sum + a.balance, 0) + netIncome; 
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] overflow-hidden">
      <div className="p-6 border-b border-[#E2E8F0] bg-[#FFFFFF] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl lg:text-2xl font-bold text-[#1E293B]" style={{ fontFamily: "Syne, sans-serif" }}>Laporan Keuangan</h2>
          <p className="text-xs lg:text-sm text-[#64748B]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            Laba/Rugi dan Neraca (Balance Sheet)
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#FF6B1A] text-white hover:bg-[#FFB347] transition-all shadow-lg shadow-orange-500/20">
            <Printer size={14} /> Cetak Laporan
          </button>
        </div>
      </div>

      <div className="p-4 sm:px-6 bg-[#FFFFFF] border-b border-[#E2E8F0] flex gap-6">
        <button 
          onClick={() => setActiveTab("labarugi")}
          className={`text-sm font-bold pb-4 border-b-2 transition-colors ${activeTab === 'labarugi' ? 'border-[#FF6B1A] text-[#FF6B1A]' : 'border-transparent text-[#64748B] hover:text-[#1E293B]'}`}
        >
          Laba Rugi (Income Statement)
        </button>
        <button 
          onClick={() => setActiveTab("neraca")}
          className={`text-sm font-bold pb-4 border-b-2 transition-colors ${activeTab === 'neraca' ? 'border-[#FF6B1A] text-[#FF6B1A]' : 'border-transparent text-[#64748B] hover:text-[#1E293B]'}`}
        >
          Neraca (Balance Sheet)
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex justify-center">
        {activeTab === "labarugi" && (
          <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-[#E2E8F0] shadow-sm w-full max-w-3xl">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-[#1E293B] uppercase tracking-wider" style={{ fontFamily: "Syne, sans-serif" }}>Laporan Laba Rugi</h3>
              <p className="text-sm text-[#64748B]">Untuk periode berjalan</p>
            </div>

            <div className="space-y-6">
              {/* Pendapatan */}
              <div>
                <h4 className="text-sm font-bold text-[#FF6B1A] uppercase tracking-widest border-b border-[#E2E8F0] pb-2 mb-3">Pendapatan (Revenue)</h4>
                {revenues.length === 0 && <p className="text-xs text-[#64748B] italic">Tidak ada transaksi</p>}
                {revenues.map(acc => (
                  <div key={acc.id} className="flex justify-between py-1.5 text-sm">
                    <span className="text-[#1E293B]">{acc.code} - {acc.name}</span>
                    <span className="font-medium text-[#1E293B]">{formatCurrency(acc.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 mt-2 border-t border-dashed border-[#E2E8F0] font-bold">
                  <span className="text-[#1E293B]">Total Pendapatan</span>
                  <span className="text-[#1E293B]">{formatCurrency(totalRevenue)}</span>
                </div>
              </div>

              {/* Beban */}
              <div>
                <h4 className="text-sm font-bold text-[#FF6B1A] uppercase tracking-widest border-b border-[#E2E8F0] pb-2 mb-3">Beban & Biaya (Expenses)</h4>
                {expenses.length === 0 && <p className="text-xs text-[#64748B] italic">Tidak ada transaksi</p>}
                {expenses.map(acc => (
                  <div key={acc.id} className="flex justify-between py-1.5 text-sm">
                    <span className="text-[#1E293B]">{acc.code} - {acc.name}</span>
                    <span className="font-medium text-[#1E293B]">{formatCurrency(acc.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 mt-2 border-t border-dashed border-[#E2E8F0] font-bold">
                  <span className="text-[#1E293B]">Total Beban</span>
                  <span className="text-[#1E293B]">{formatCurrency(totalExpense)}</span>
                </div>
              </div>

              {/* Laba Bersih */}
              <div className="flex justify-between py-4 mt-6 border-y-2 border-[#1E293B]">
                <span className="text-lg font-black uppercase text-[#1E293B]">Laba Bersih (Net Income)</span>
                <span className={`text-lg font-black ${netIncome >= 0 ? 'text-[#2ECC71]' : 'text-red-500'}`}>
                  {formatCurrency(netIncome)}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "neraca" && (
          <div className="bg-[#FFFFFF] p-8 rounded-2xl border border-[#E2E8F0] shadow-sm w-full max-w-4xl">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-[#1E293B] uppercase tracking-wider" style={{ fontFamily: "Syne, sans-serif" }}>Neraca (Balance Sheet)</h3>
              <p className="text-sm text-[#64748B]">Per posisi saat ini</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Aktiva / Asset */}
              <div>
                <h4 className="text-sm font-bold text-[#2ECC71] uppercase tracking-widest border-b-2 border-[#2ECC71] pb-2 mb-3">Aktiva (Assets)</h4>
                {assets.length === 0 && <p className="text-xs text-[#64748B] italic">Tidak ada transaksi</p>}
                {assets.map(acc => (
                  <div key={acc.id} className="flex justify-between py-1.5 text-sm">
                    <span className="text-[#1E293B]">{acc.code} - {acc.name}</span>
                    <span className="font-medium text-[#1E293B]">{formatCurrency(acc.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-3 mt-4 border-t-2 border-[#1E293B] font-bold">
                  <span className="text-[#1E293B]">Total Aktiva</span>
                  <span className="text-[#1E293B]">{formatCurrency(totalAssets)}</span>
                </div>
              </div>

              {/* Pasiva (Liabilities & Equity) */}
              <div>
                <h4 className="text-sm font-bold text-red-500 uppercase tracking-widest border-b-2 border-red-500 pb-2 mb-3">Kewajiban (Liabilities)</h4>
                {liabilities.length === 0 && <p className="text-xs text-[#64748B] italic mb-4">Tidak ada transaksi</p>}
                {liabilities.map(acc => (
                  <div key={acc.id} className="flex justify-between py-1.5 text-sm">
                    <span className="text-[#1E293B]">{acc.code} - {acc.name}</span>
                    <span className="font-medium text-[#1E293B]">{formatCurrency(acc.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 mt-2 border-t border-dashed border-[#E2E8F0] font-bold mb-6">
                  <span className="text-[#1E293B]">Total Kewajiban</span>
                  <span className="text-[#1E293B]">{formatCurrency(totalLiabilities)}</span>
                </div>

                <h4 className="text-sm font-bold text-purple-600 uppercase tracking-widest border-b-2 border-purple-600 pb-2 mb-3">Ekuitas (Equity)</h4>
                {equities.map(acc => (
                  <div key={acc.id} className="flex justify-between py-1.5 text-sm">
                    <span className="text-[#1E293B]">{acc.code} - {acc.name}</span>
                    <span className="font-medium text-[#1E293B]">{formatCurrency(acc.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-1.5 text-sm text-[#FF6B1A]">
                  <span>Laba Bersih Tahun Berjalan</span>
                  <span className="font-bold">{formatCurrency(netIncome)}</span>
                </div>
                <div className="flex justify-between py-2 mt-2 border-t border-dashed border-[#E2E8F0] font-bold">
                  <span className="text-[#1E293B]">Total Ekuitas</span>
                  <span className="text-[#1E293B]">{formatCurrency(totalEquity)}</span>
                </div>

                <div className="flex justify-between py-3 mt-4 border-t-2 border-[#1E293B] font-bold bg-slate-50">
                  <span className="text-[#1E293B]">Total Pasiva</span>
                  <span className="text-[#1E293B]">{formatCurrency(totalLiabilitiesAndEquity)}</span>
                </div>
              </div>
            </div>

            {/* Check Balance */}
            <div className={`mt-8 p-4 rounded-xl flex items-center justify-center gap-3 border ${totalAssets === totalLiabilitiesAndEquity ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className={`w-3 h-3 rounded-full ${totalAssets === totalLiabilitiesAndEquity ? 'bg-[#2ECC71]' : 'bg-red-500 animate-pulse'}`}></div>
              <span className={`text-sm font-bold ${totalAssets === totalLiabilitiesAndEquity ? 'text-[#2ECC71]' : 'text-red-500'}`}>
                {totalAssets === totalLiabilitiesAndEquity ? 'Neraca Seimbang (BALANCE)' : 'Neraca Tidak Seimbang (UNBALANCED)'}
              </span>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
