import { motion, AnimatePresence } from "framer-motion";
import { OrderHistory } from "@/types/pos";

interface OrderHistoryTableProps {
  orders: OrderHistory[];
  onViewAll?: () => void;
}

export default function OrderHistoryTable({ orders, onViewAll }: OrderHistoryTableProps) {
  const formatCurrency = (price: number) =>
    "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(price));

  const statusConfig: any = {
    selesai: { label: "Selesai", color: "#2ECC71", bg: "rgba(46,204,113,0.1)" },
    proses: { label: "Proses", color: "#FFB347", bg: "rgba(255,179,71,0.1)" },
    antrian: { label: "Antrian", color: "#8A8A95", bg: "rgba(138,138,149,0.1)" },
    dp: { label: "DP / Piutang", color: "#FF6B1A", bg: "rgba(255,107,26,0.1)" },
    pending: { label: "Menunggu", color: "#8A8A95", bg: "rgba(138,138,149,0.1)" },
    processing: { label: "Proses Cetak", color: "#3498DB", bg: "rgba(52,152,219,0.1)" },
    ready: { label: "Siap Ambil", color: "#2ECC71", bg: "rgba(46,204,113,0.1)" },
  };

  return (
    <div
      className="border-t"
      style={{
        borderColor: "#E2E8F0",
        backgroundColor: "#FFFFFF",
      }}
    >
      {/* Header */}
      <div className="px-6 py-3 flex items-center justify-between">
        <h3
          className="text-sm font-bold"
          style={{
            fontFamily: "Syne, sans-serif",
            color: "#1E293B",
          }}
        >
          Riwayat Order Hari Ini
        </h3>
        <div className="flex items-center gap-4">
          <span
            className="text-xs"
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              color: "#64748B",
            }}
          >
            {orders.length} transaksi
          </span>
          {onViewAll && (
            <button 
              onClick={onViewAll}
              className="text-[10px] font-bold text-[#FF6B1A] hover:underline"
            >
              Lihat Semua →
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {orders.length === 0 ? (
        <div className="px-6 py-4 text-center">
          <p
            className="text-xs"
            style={{
              fontFamily: "Space Grotesk, sans-serif",
              color: "#64748B",
            }}
          >
            Belum ada transaksi hari ini
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid #E2E8F0" }}>
                {["No. Order", "Produk", "Total", "Pembayaran", "Waktu", "Status"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 text-left text-xs font-medium"
                    style={{
                      fontFamily: "Space Grotesk, sans-serif",
                      color: "#64748B",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {orders.map((order, i) => {
                  const status = statusConfig[order.status];
                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.05 }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "#F8FAFC")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                      onClick={onViewAll}
                      style={{ borderBottom: "1px solid #E2E8F0", cursor: onViewAll ? "pointer" : "default" }}
                    >
                      <td className="px-4 py-2.5">
                        <span
                          className="text-xs font-bold"
                          style={{
                            fontFamily: "JetBrains Mono, monospace",
                            color: "#FF6B1A",
                          }}
                        >
                          {order.orderNo}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className="text-xs"
                          style={{
                            fontFamily: "Space Grotesk, sans-serif",
                            color: "#1E293B",
                          }}
                        >
                          {order.items}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-col">
                          <span
                            className="text-xs font-semibold"
                            style={{
                              fontFamily: "JetBrains Mono, monospace",
                              color: "#1E293B",
                            }}
                          >
                            {formatCurrency(order.total)}
                          </span>
                          {order.remainingAmount > 0 && (
                            <span className="text-[9px] text-red-500 font-bold" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                              Sisa: {formatCurrency(order.remainingAmount)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className="text-xs"
                          style={{
                            fontFamily: "Space Grotesk, sans-serif",
                            color: "#64748B",
                          }}
                        >
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className="text-xs"
                          style={{
                            fontFamily: "JetBrains Mono, monospace",
                            color: "#64748B",
                          }}
                        >
                          {order.time}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className="text-xs font-medium rounded-full px-2 py-0.5"
                          style={{
                            fontFamily: "Space Grotesk, sans-serif",
                            color: status.color,
                            backgroundColor: status.bg,
                          }}
                        >
                          {status.label}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
