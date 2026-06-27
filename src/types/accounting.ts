export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
export type AccountNormalBalance = 'Debit' | 'Credit';

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  normalBalance: AccountNormalBalance;
  description?: string;
}

export interface JournalItem {
  id: string;
  accountId: string;
  accountName: string;
  accountCode: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  reference: string;
  items: JournalItem[];
}

// Default Chart of Accounts Standar Indonesia
export const DEFAULT_ACCOUNTS: Account[] = [
  // Aset (Assets)
  { id: '111', code: '111', name: 'Kas & Bank', type: 'Asset', normalBalance: 'Debit' },
  { id: '112', code: '112', name: 'Piutang Usaha', type: 'Asset', normalBalance: 'Debit' },
  { id: '113', code: '113', name: 'Persediaan Barang', type: 'Asset', normalBalance: 'Debit' },
  { id: '121', code: '121', name: 'Aset Tetap (Mesin & Peralatan)', type: 'Asset', normalBalance: 'Debit' },
  { id: '122', code: '122', name: 'Akumulasi Penyusutan', type: 'Asset', normalBalance: 'Credit' },
  
  // Kewajiban (Liabilities)
  { id: '211', code: '211', name: 'Hutang Usaha', type: 'Liability', normalBalance: 'Credit' },
  { id: '212', code: '212', name: 'Hutang Gaji', type: 'Liability', normalBalance: 'Credit' },
  { id: '221', code: '221', name: 'Hutang Bank (Jangka Panjang)', type: 'Liability', normalBalance: 'Credit' },
  
  // Ekuitas (Equity)
  { id: '311', code: '311', name: 'Modal Pemilik', type: 'Equity', normalBalance: 'Credit' },
  { id: '312', code: '312', name: 'Prive (Penarikan Pribadi)', type: 'Equity', normalBalance: 'Debit' },
  { id: '313', code: '313', name: 'Laba Ditahan', type: 'Equity', normalBalance: 'Credit' },

  // Pendapatan (Revenue)
  { id: '411', code: '411', name: 'Pendapatan Jasa Cetak', type: 'Revenue', normalBalance: 'Credit' },
  { id: '412', code: '412', name: 'Pendapatan Lain-lain', type: 'Revenue', normalBalance: 'Credit' },

  // Beban (Expenses)
  { id: '511', code: '511', name: 'Harga Pokok Penjualan (HPP)', type: 'Expense', normalBalance: 'Debit' },
  { id: '512', code: '512', name: 'Beban Pembelian Bahan', type: 'Expense', normalBalance: 'Debit' },
  { id: '611', code: '611', name: 'Beban Gaji Karyawan', type: 'Expense', normalBalance: 'Debit' },
  { id: '612', code: '612', name: 'Beban Listrik & Air', type: 'Expense', normalBalance: 'Debit' },
  { id: '613', code: '613', name: 'Beban Maintenance Mesin', type: 'Expense', normalBalance: 'Debit' },
  { id: '614', code: '614', name: 'Beban Sewa Tempat', type: 'Expense', normalBalance: 'Debit' },
  { id: '615', code: '615', name: 'Beban Penyusutan Aset', type: 'Expense', normalBalance: 'Debit' },
];
