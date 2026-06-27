

interface InvoicePrintProps {
  orderNo: string;
  kasirName: string;
  items: Array<{
    name: string;
    qty: number;
    price: number;
    total: number;
    note?: string;
  }>;
  total: number;
  paidAmount: number;
  paymentMethod: string;
  date: Date;
  isSPK?: boolean;
  customerName?: string;
}

export default function InvoicePrint({
  orderNo,
  kasirName,
  items,
  total,
  paidAmount,
  paymentMethod,
  date,
  isSPK,
  customerName,
}: InvoicePrintProps) {
  // Ambil pengaturan dari localStorage
  const storeName = localStorage.getItem("receiptStoreName") || "BANNERPOS PERCETAKAN";
  const storeAddress = localStorage.getItem("receiptStoreAddress") || "Jl. Raya Percetakan No. 123\nJakarta Pusat";
  const storeContact = localStorage.getItem("receiptStoreContact") || "WA: 0812-3456-7890";
  const footerMessage = localStorage.getItem("receiptFooterMessage") || "Barang yang sudah dicetak\ntidak dapat dikembalikan.\nTerima Kasih!";
  const showKasir = localStorage.getItem("receiptShowKasir") !== "false"; // Default true

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val).replace("Rp", "").trim();

  return (
    <div className="hidden print:block fixed inset-0 bg-white z-[99999] text-black font-mono text-[11px] leading-tight w-[80mm] max-w-[80mm] mx-auto p-2">
      {/* Header */}
      <div className="text-center mb-4">
        {isSPK ? (
          <>
            <h2 className="font-bold text-sm mb-1 uppercase">SURAT PERINTAH KERJA</h2>
            <div className="whitespace-pre-line text-[10px] uppercase font-bold text-black border border-black inline-block px-2 py-0.5 mt-1">PRODUKSI</div>
          </>
        ) : (
          <>
            <h2 className="font-bold text-sm mb-1 uppercase">{storeName}</h2>
            <div className="whitespace-pre-line text-[10px]">{storeAddress}</div>
            <div className="text-[10px] mt-0.5">{storeContact}</div>
          </>
        )}
      </div>

      <div className="border-t border-dashed border-black my-2"></div>

      {/* Info Transaksi */}
      <div className="mb-2">
        <div className="flex justify-between">
          <span>No:</span>
          <span className="font-bold">{orderNo}</span>
        </div>
        <div className="flex justify-between">
          <span>Tgl:</span>
          <span>{date.toLocaleString("id-ID", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        {showKasir && (
          <div className="flex justify-between">
            <span>Ksr:</span>
            <span>{kasirName}</span>
          </div>
        )}
        {customerName && (
          <div className="flex justify-between font-bold">
            <span>Plg:</span>
            <span>{customerName}</span>
          </div>
        )}
      </div>

      <div className="border-t border-dashed border-black my-2"></div>

      {/* Daftar Item */}
      <div className="mb-2">
        {items.map((item, idx) => (
          <div key={idx} className="mb-2 border-b border-gray-300 pb-2 last:border-0">
            <div className="font-bold text-xs">{item.name}</div>
            <div className="flex justify-between">
              <span>Qty: {item.qty}</span>
              {!isSPK && <span>{formatCurrency(item.total)}</span>}
            </div>
            {item.note && (
              <div className="text-[11px] font-bold mt-1 bg-gray-100 p-1 rounded-md">NOTE: {item.note}</div>
            )}
            {/* Ruang kosong untuk checklist produksi */}
            {isSPK && (
              <div className="mt-2 flex gap-4 text-[9px] font-bold">
                <div className="border border-black px-2 py-1 rounded">Cetak [ ]</div>
                <div className="border border-black px-2 py-1 rounded">Finishing [ ]</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pembayaran (Hanya Invoice) */}
      {!isSPK && (
        <>
          <div className="border-t border-dashed border-black my-2"></div>
          <div className="mb-4">
            <div className="flex justify-between font-bold text-xs">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Bayar ({paymentMethod}):</span>
              <span>{formatCurrency(paidAmount)}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Kembali/Sisa:</span>
              <span>{formatCurrency(Math.abs(paidAmount - total))}</span>
            </div>
          </div>
          <div className="text-center text-[10px] whitespace-pre-line mt-6">
            {footerMessage}
          </div>
        </>
      )}
      
      {/* Footer SPK */}
      {isSPK && (
        <div className="mt-6 border-t border-dashed border-black pt-2 text-center text-[10px] font-bold">
          <p>DIPROSES OLEH TIM PRODUKSI</p>
          <p>Harap dicek kembali sebelum cetak!</p>
        </div>
      )}
    </div>
  );
}
