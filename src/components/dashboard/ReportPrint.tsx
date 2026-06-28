import React from 'react';

interface ReportPrintProps {
  title: string;
  type: string;
  data: any[];
  summary: { total: number; count: number };
}

export default function ReportPrint({ title, type, data, summary }: ReportPrintProps) {
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  return (
    <div className="hidden print:block absolute inset-0 bg-white z-[9999] p-8 text-black">
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold uppercase tracking-widest">{title}</h1>
        <p className="text-sm mt-1">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
      </div>

      <div className="flex justify-between mb-6">
        <div>
          <p className="text-sm font-bold">Total Transaksi: {summary.count}</p>
        </div>
        <div>
          <p className="text-sm font-bold">Total Nilai: {formatCurrency(summary.total)}</p>
        </div>
      </div>

      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-black">
            <th className="py-2 text-sm font-bold">Tanggal</th>
            <th className="py-2 text-sm font-bold">Keterangan</th>
            <th className="py-2 text-sm font-bold text-right">Jumlah</th>
            <th className="py-2 text-sm font-bold text-center">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-300">
          {data.map((item, i) => (
            <tr key={i}>
              <td className="py-2 text-sm">{item.date}</td>
              <td className="py-2 text-sm">{item.desc}</td>
              <td className="py-2 text-sm text-right font-medium">
                {formatCurrency(item.amount)}
                {type === 'purchases' && item.paidAmount > 0 && (
                  <div className="text-[10px] text-green-700">Dibayar: {formatCurrency(item.paidAmount)}</div>
                )}
                {type === 'purchases' && item.remainingAmount > 0 && (
                  <div className="text-[10px] text-gray-600">Sisa: {formatCurrency(item.remainingAmount)}</div>
                )}
              </td>
              <td className="py-2 text-sm text-center uppercase text-xs">{item.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {data.length === 0 && (
        <div className="text-center py-10 italic text-gray-500">
          Tidak ada data transaksi.
        </div>
      )}
    </div>
  );
}
