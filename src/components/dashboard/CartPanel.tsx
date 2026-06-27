import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ChevronDown, ChevronUp, Plus, Minus, ShoppingBag, Play, Pause, Square } from "lucide-react";
import { CartItem, MATERIALS, FINISHINGS } from "@/types/pos";

interface CartPanelProps {
  items: CartItem[];
  onUpdateItem: (id: string, updates: Partial<CartItem>) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: (paymentMethod: string, paidAmount: number, manualInvoiceNo: string) => void;
  onPreviewInvoice?: (paymentMethod: string, paidAmount: number) => void;
}

export default function CartPanel({
  items,
  onUpdateItem,
  onRemoveItem,
  onCheckout,
  onPreviewInvoice,
}: CartPanelProps) {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"Tunai" | "QRIS" | "DP" | "Piutang">("Tunai");
  const [paidAmount, setPaidAmount] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [manualInvoiceNo, setManualInvoiceNo] = useState("");

  const designRatePerMinute = parseInt(localStorage.getItem("designRatePerMinute") || "1000"); // Default 1000/menit

  const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
  const discountAmount = (subtotal * discount) / 100;
  const total = subtotal - discountAmount;
  const paid = parseFloat(paidAmount.replace(/\./g, "")) || 0;
  const change = paid - total;

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID").format(Math.round(price));

  const formatCurrency = (price: number) =>
    "Rp " + new Intl.NumberFormat("id-ID").format(Math.round(price));

  const calcItemTotal = (item: CartItem) => {
    const area = (item.width / 100) * (item.height / 100);
    const basePrice = area * item.pricePerM2 * item.quantity;
    const designFee = item.hasDesignRequest ? (item.designFee || 0) : 0;
    return basePrice + designFee;
  };

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const hasRunningTimer = items.some(i => i.isDesignTimerRunning);
    if (!hasRunningTimer) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [items]);

  const updateItemAndRecalc = (id: string, updates: Partial<CartItem>) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    const updated = { ...item, ...updates };
    const area = (updated.width / 100) * (updated.height / 100);
    const basePrice = area * updated.pricePerM2 * updated.quantity;
    const designFee = updated.hasDesignRequest ? (updated.designFee || 0) : 0;
    const newTotal = basePrice + designFee;
    onUpdateItem(id, { ...updates, totalPrice: newTotal });
  };

  const handleCheckout = () => {
    if (items.length === 0) return;
    
    if ((paymentMethod === "Tunai" || paymentMethod === "QRIS") && paid < total) {
      setPaymentError(`Nominal ${paymentMethod} kurang dari total tagihan.`);
      return;
    }

    if (paymentMethod === "DP" && (paid <= 0 || paid >= total)) {
      setPaymentError("Untuk DP, nominal harus lebih dari 0 dan kurang dari total.");
      return;
    }

    setPaymentError("");
    onCheckout(paymentMethod, paid, manualInvoiceNo);
    setPaidAmount("");
    setDiscount(0);
    setManualInvoiceNo("");
  };

  const paymentMethods = ["Tunai", "QRIS", "DP", "Piutang"] as const;

  const prefix = localStorage.getItem("autoInvoicePrefix") || "ORD-";
  let counter = parseInt(localStorage.getItem("currentInvoiceCounter") || "1");
  if (isNaN(counter)) counter = 1;
  const nextInvoiceNo = `${prefix}${String(counter).padStart(4, "0")}`;

  return (
    <div
      className="flex flex-col h-full bg-[#FFFFFF] border-t lg:border-t-0 lg:border-l border-[#E2E8F0]"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-[#E2E8F0]"
      >
        <div className="flex flex-col">
          <h2
            className="text-base font-bold leading-tight"
            style={{
              fontFamily: "Syne, sans-serif",
              color: "#1E293B",
              letterSpacing: "-0.01em",
            }}
          >
            Keranjang Order
          </h2>
          <span 
            className="text-[10px] font-bold text-[#FF6B1A] mt-0.5"
            style={{ fontFamily: "JetBrains Mono, monospace" }}
          >
            #{manualInvoiceNo.trim() || nextInvoiceNo}
          </span>
        </div>
        <span
          className="text-xs font-semibold rounded-full px-2.5 py-1"
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            backgroundColor:
              items.length > 0 ? "rgba(255,107,26,0.15)" : "rgba(255,255,255,0.05)",
            color: items.length > 0 ? "#FF6B1A" : "#8A8A95",
          }}
        >
          {items.length} item
        </span>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 custom-scrollbar">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40 py-10">
            <div className="w-16 h-16 rounded-full bg-[#F8FAFC] flex items-center justify-center mb-3">
              <ShoppingBag size={24} className="text-[#64748B]" />
            </div>
            <p
              className="text-sm"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                color: "#64748B",
              }}
            >
              Pilih produk dari katalog
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="rounded-lg overflow-hidden shadow-sm"
                  style={{
                    backgroundColor: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  {/* Item Header */}
                  <div className="px-2 py-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[10px] font-bold truncate"
                          style={{
                            fontFamily: "Space Grotesk, sans-serif",
                            color: "#1E293B",
                          }}
                        >
                          {item.productName}
                        </p>
                        <p
                          className="text-[9px] mt-0.5"
                          style={{
                            fontFamily: "JetBrains Mono, monospace",
                            color: "#64748B",
                          }}
                        >
                          {item.width}×{item.height}cm · {item.finishing}
                          {item.hasDesignRequest && (
                            <span className="ml-1.5 px-1 py-[1px] rounded bg-[#FF6B1A]/10 text-[#FF6B1A] text-[7px] font-bold uppercase border border-[#FF6B1A]/20">
                              +Desain
                            </span>
                          )}
                        </p>
                      </div>
                      
                      {/* Price & Actions */}
                      <div className="flex flex-col items-end justify-between h-full gap-1.5">
                        <div className="flex items-center gap-1.5">
                          {/* Compact Qty Controls */}
                          <div className="flex items-center gap-1 bg-[#FFFFFF] border border-[#E2E8F0] rounded p-0.5">
                            <button
                              onClick={() => updateItemAndRecalc(item.id, { quantity: Math.max(1, item.quantity - 1) })}
                              className="w-3.5 h-3.5 rounded-sm flex items-center justify-center text-[#8A8A95] hover:bg-[#F8FAFC]"
                            >
                              <Minus size={8} />
                            </button>
                            <span className="text-[9px] font-bold w-3 text-center" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateItemAndRecalc(item.id, { quantity: item.quantity + 1 })}
                              className="w-3.5 h-3.5 rounded-sm flex items-center justify-center bg-[#FF6B1A]/10 text-[#FF6B1A] hover:bg-[#FF6B1A]/20"
                            >
                              <Plus size={8} />
                            </button>
                          </div>
                          
                          <p
                            className="text-[10px] font-bold w-[60px] text-right"
                            style={{ fontFamily: "JetBrains Mono, monospace", color: "#FF6B1A" }}
                          >
                            {formatCurrency(item.totalPrice)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              setExpandedItem(
                                expandedItem === item.id ? null : item.id
                              )
                            }
                            className="w-4 h-4 rounded flex items-center justify-center transition-colors duration-150"
                            style={{
                              color: "#8A8A95",
                              backgroundColor: "rgba(255,255,255,0.04)",
                              border: "1px solid #E2E8F0",
                            }}
                          >
                            {expandedItem === item.id ? (
                              <ChevronUp size={8} />
                            ) : (
                              <ChevronDown size={8} />
                            )}
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(item.id)}
                            className="w-4 h-4 rounded flex items-center justify-center transition-colors duration-150"
                            style={{
                              color: "#E74C3C",
                              backgroundColor: "rgba(231,76,60,0.08)",
                            }}
                          >
                            <Trash2 size={8} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Edit Form */}
                  <AnimatePresence>
                    {expandedItem === item.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                        style={{ borderTop: "1px solid #E2E8F0" }}
                      >
                        <div className="p-2 space-y-2">
                          {/* Size inputs */}
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label
                                className="block text-[10px] mb-1"
                                style={{
                                  fontFamily: "Space Grotesk, sans-serif",
                                  color: "#8A8A95",
                                }}
                              >
                                Lebar (cm)
                              </label>
                              <input
                                type="number"
                                value={item.width}
                                onChange={(e) =>
                                  updateItemAndRecalc(item.id, {
                                    width: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-full rounded-lg px-3 py-2 text-[10px] outline-none"
                                style={{
                                  backgroundColor: "#FFFFFF",
                                  border: "1px solid #E2E8F0",
                                  color: "#1E293B",
                                  fontFamily: "JetBrains Mono, monospace",
                                }}
                              />
                            </div>
                            <div>
                              <label
                                className="block text-[10px] mb-1"
                                style={{
                                  fontFamily: "Space Grotesk, sans-serif",
                                  color: "#8A8A95",
                                }}
                              >
                                Tinggi (cm)
                              </label>
                              <input
                                type="number"
                                value={item.height}
                                onChange={(e) =>
                                  updateItemAndRecalc(item.id, {
                                    height: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-full rounded-lg px-3 py-2 text-[10px] outline-none"
                                style={{
                                  backgroundColor: "#FFFFFF",
                                  border: "1px solid #E2E8F0",
                                  color: "#1E293B",
                                  fontFamily: "JetBrains Mono, monospace",
                                }}
                              />
                            </div>
                          </div>

                          {/* Material */}
                          <div>
                            <label
                              className="block text-[10px] mb-1"
                              style={{
                                fontFamily: "Space Grotesk, sans-serif",
                                color: "#8A8A95",
                              }}
                            >
                              Material
                            </label>
                            <select
                              value={item.material}
                              onChange={(e) =>
                                onUpdateItem(item.id, {
                                  material: e.target.value,
                                })
                              }
                              className="w-full rounded-lg px-3 py-2 text-[10px] outline-none"
                              style={{
                                backgroundColor: "#FFFFFF",
                                border: "1px solid #E2E8F0",
                                color: "#1E293B",
                                fontFamily: "Space Grotesk, sans-serif",
                              }}
                            >
                              {MATERIALS.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Finishing */}
                          <div>
                            <label
                              className="block text-[10px] mb-1"
                              style={{
                                fontFamily: "Space Grotesk, sans-serif",
                                color: "#8A8A95",
                              }}
                            >
                              Finishing
                            </label>
                            <select
                              value={item.finishing}
                              onChange={(e) =>
                                onUpdateItem(item.id, {
                                  finishing: e.target.value,
                                })
                              }
                              className="w-full rounded-lg px-3 py-2 text-[10px] outline-none"
                              style={{
                                backgroundColor: "#FFFFFF",
                                border: "1px solid #E2E8F0",
                                color: "#1E293B",
                                fontFamily: "Space Grotesk, sans-serif",
                              }}
                            >
                              {FINISHINGS.map((f) => (
                                <option key={f} value={f}>
                                  {f}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Design Request & Fee */}
                          <div className="pt-3 border-t border-[#E2E8F0] space-y-3">
                            <div className="flex items-center justify-between">
                              <label 
                                onClick={(e) => {
                                  e.preventDefault();
                                  updateItemAndRecalc(item.id, { 
                                    hasDesignRequest: !item.hasDesignRequest, 
                                    designFee: !item.hasDesignRequest ? 25000 : 0,
                                    isDesignTimerRunning: false,
                                    designTimerElapsed: 0,
                                    designTimerStart: null
                                  });
                                }}
                                className="flex items-center gap-2 cursor-pointer group"
                              >
                                <div 
                                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                    item.hasDesignRequest 
                                      ? 'bg-[#FF6B1A] border-[#FF6B1A]' 
                                      : 'bg-white border-[#E2E8F0] group-hover:border-[#FF6B1A]'
                                  }`}
                                >
                                  {item.hasDesignRequest && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                </div>
                                <span className="text-[10px] font-bold text-[#1E293B]">Permintaan Desain</span>
                              </label>
                            </div>

                            {item.hasDesignRequest && (
                              <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                  <label className="block text-[9px] text-[#8A8A95] uppercase tracking-wider font-bold">Biaya Desain (IDR)</label>
                                  {/* Timer Controls */}
                                  <div className="flex items-center gap-2">
                                    {(() => {
                                      const elapsed = item.isDesignTimerRunning && item.designTimerStart
                                        ? Math.floor((now - item.designTimerStart) / 1000) + (item.designTimerElapsed || 0)
                                        : (item.designTimerElapsed || 0);
                                      const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
                                      const secs = (elapsed % 60).toString().padStart(2, '0');
                                      const currentFee = elapsed > 0 ? Math.max(10000, Math.ceil(elapsed / 60) * designRatePerMinute) : (item.designFee || 0);
                                      
                                      return (
                                        <>
                                          <span className="text-[10px] font-black text-[#1E293B] font-mono tracking-wider w-10 text-center">
                                            {mins}:{secs}
                                          </span>
                                          {!item.isDesignTimerRunning ? (
                                            <button 
                                              onClick={(e) => {
                                                e.preventDefault();
                                                updateItemAndRecalc(item.id, { isDesignTimerRunning: true, designTimerStart: Date.now() });
                                              }}
                                              className="w-6 h-6 flex items-center justify-center rounded bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white transition-colors"
                                              title="Mulai Timer"
                                            >
                                              <Play size={12} className="ml-0.5" />
                                            </button>
                                          ) : (
                                            <button 
                                              onClick={(e) => {
                                                e.preventDefault();
                                                updateItemAndRecalc(item.id, { 
                                                  isDesignTimerRunning: false, 
                                                  designTimerElapsed: elapsed,
                                                  designFee: currentFee
                                                });
                                              }}
                                              className="w-6 h-6 flex items-center justify-center rounded bg-orange-500/10 text-orange-600 hover:bg-orange-500 hover:text-white transition-colors"
                                              title="Jeda Timer"
                                            >
                                              <Pause size={12} />
                                            </button>
                                          )}
                                        </>
                                      );
                                    })()}
                                  </div>
                                </div>
                                
                                <input
                                  type="text"
                                  value={(() => {
                                      const elapsed = item.isDesignTimerRunning && item.designTimerStart
                                        ? Math.floor((now - item.designTimerStart) / 1000) + (item.designTimerElapsed || 0)
                                        : (item.designTimerElapsed || 0);
                                      const currentFee = item.isDesignTimerRunning && elapsed > 0 
                                        ? Math.max(10000, Math.ceil(elapsed / 60) * designRatePerMinute) 
                                        : (item.designFee || 0);
                                      return currentFee > 0 ? new Intl.NumberFormat("id-ID").format(currentFee) : "";
                                  })()}
                                  readOnly={item.isDesignTimerRunning}
                                  onChange={(e) => {
                                    if (item.isDesignTimerRunning) return;
                                    const val = parseInt(e.target.value.replace(/\./g, "")) || 0;
                                    updateItemAndRecalc(item.id, { designFee: val });
                                  }}
                                  className={`w-full rounded-[4px] px-2 py-1.5 text-[10px] outline-none ${item.isDesignTimerRunning ? 'bg-[#FF6B1A]/5 border-transparent cursor-not-allowed text-[#FF6B1A]' : 'bg-[#F8FAFC] border-[#E2E8F0] focus:border-[#FF6B1A] text-[#1E293B]'}`}
                                  style={{
                                    borderWidth: "1px",
                                    fontWeight: "bold",
                                    fontFamily: "JetBrains Mono, monospace",
                                  }}
                                  placeholder="0"
                                />
                              </div>
                            )}
                          </div>

                          {/* Design note */}
                          <div>
                            <label
                              className="block text-[10px] mb-1"
                              style={{
                                fontFamily: "Space Grotesk, sans-serif",
                                color: "#8A8A95",
                              }}
                            >
                              Catatan Desain
                            </label>
                            <textarea
                              value={item.designNote}
                              onChange={(e) =>
                                onUpdateItem(item.id, {
                                  designNote: e.target.value,
                                })
                              }
                              placeholder="Masukkan catatan desain..."
                              rows={2}
                              className="w-full rounded-lg px-3 py-2 text-[10px] outline-none resize-none"
                              style={{
                                backgroundColor: "#FFFFFF",
                                border: "1px solid #E2E8F0",
                                color: "#1E293B",
                                fontFamily: "Space Grotesk, sans-serif",
                              }}
                            />
                          </div>

                          {/* Area info */}
                          <div
                            className="rounded-lg px-3 py-2 flex items-center justify-between"
                            style={{ backgroundColor: "rgba(255,107,26,0.06)" }}
                          >
                            <span
                              className="text-[10px]"
                              style={{
                                fontFamily: "Space Grotesk, sans-serif",
                                color: "#8A8A95",
                              }}
                            >
                              Luas:{" "}
                              <span style={{ color: "#FFB347" }}>
                                {(
                                  ((item.width / 100) * item.height) /
                                  100
                                ).toFixed(2)}{" "}
                                m²
                              </span>
                            </span>
                            <span
                              className="text-[10px] font-bold"
                              style={{
                                fontFamily: "JetBrains Mono, monospace",
                                color: "#FF6B1A",
                              }}
                            >
                              Rp {formatPrice(item.totalPrice)}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Summary & Payment */}
      {items.length > 0 && (
        <div className="p-2 bg-[#FFFFFF] border-t border-[#E2E8F0] space-y-1.5">
          {/* Summary */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span
                className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                Subtotal
              </span>
              <span
                className="text-xs font-semibold"
                style={{ fontFamily: "JetBrains Mono, monospace", color: "#FF6B1A" }}
              >
                {formatCurrency(subtotal)}
              </span>
            </div>

            {/* Discount */}
            <div className="flex justify-between items-center">
              <span
                className="text-[9px] font-bold text-[#64748B] uppercase tracking-wider"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                Potongan (%)
              </span>
              <div className="flex items-center gap-2">
                {discount > 0 && (
                  <span className="text-[9px] font-semibold text-[#2ECC71]" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                    -{formatCurrency(discountAmount)}
                  </span>
                )}
                <input
                  type="number"
                  value={discount || ""}
                  onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                  placeholder="0"
                  className="w-12 rounded px-1.5 py-0.5 text-[10px] text-right outline-none"
                  style={{
                    backgroundColor: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    color: "#FF6B1A",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                />
              </div>
            </div>

            <div className="h-px" style={{ backgroundColor: "#E2E8F0" }} />

            <div className="flex justify-between items-center">
              <span
                className="text-[11px] font-bold text-[#1E293B]"
                style={{ fontFamily: "Space Grotesk, sans-serif" }}
              >
                Total
              </span>
              <span
                className="text-sm font-bold"
                style={{ fontFamily: "JetBrains Mono, monospace", color: "#FF6B1A" }}
              >
                {formatCurrency(total)}
              </span>
            </div>
          </div>

          {/* Manual Invoice Number Input */}
          {localStorage.getItem("enableManualInvoice") === "true" && (
            <div>
              <label
                className="block text-xs mb-1.5"
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  color: "#8A8A95",
                }}
              >
                No. Invoice (Opsional)
              </label>
              <input
                type="text"
                value={manualInvoiceNo}
                onChange={(e) => setManualInvoiceNo(e.target.value)}
                placeholder="Auto-generate jika kosong"
                className="w-full rounded-xl px-4 py-2 text-sm outline-none transition-all duration-200"
                style={{
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                  color: "#1E293B",
                  fontFamily: "JetBrains Mono, monospace",
                }}
              />
            </div>
          )}

          {/* Payment Method */}
          <div>
            <div className="grid grid-cols-4 gap-1">
              {paymentMethods.map((method) => (
                <button
                  key={method}
                  onClick={() => {
                    setPaymentMethod(method);
                    if (method === "QRIS") setPaidAmount(total.toString());
                    else if (method === "Piutang") setPaidAmount("0");
                  }}
                  className="rounded py-1 text-[9px] font-bold transition-all duration-200 flex items-center justify-center gap-1"
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    backgroundColor: paymentMethod === method ? "rgba(255,107,26,0.15)" : "#F8FAFC",
                    color: paymentMethod === method ? "#FF6B1A" : "#64748B",
                    border: paymentMethod === method ? "1px solid #FF6B1A" : "1px solid #E2E8F0",
                  }}
                >
                  {method === "Tunai" && "💵"}
                  {method === "QRIS" && "📱"}
                  {method === "DP" && "💰"}
                  {method === "Piutang" && "📝"}
                  <span className="hidden xl:inline">{method}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Paid Amount Input */}
          {(paymentMethod === "Tunai" || paymentMethod === "DP" || paymentMethod === "QRIS") && (
            <div>
              <div className="relative">
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => {
                    setPaidAmount(e.target.value);
                    setPaymentError("");
                  }}
                  placeholder={paymentMethod === "Tunai" ? "Nominal Dibayar" : paymentMethod === "QRIS" ? "Konfirmasi Nominal" : "Bayar DP"}
                  className="w-full rounded px-2 py-1 text-xs outline-none transition-all duration-200"
                  style={{
                    backgroundColor: "#F8FAFC",
                    border: `1px solid ${paymentError ? "#E74C3C" : "#E2E8F0"}`,
                    color: "#1E293B",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                />
              </div>
              {paymentError && (
                <p className="text-[9px] mt-0.5 text-[#E74C3C]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  {paymentError}
                </p>
              )}
              
              {/* Summary for Tunai/DP */}
              <div className="mt-1.5 space-y-1">
                {paymentMethod === "Tunai" && paid >= total && paid > 0 && (
                  <div className="flex justify-between items-center bg-[#2ECC71]/10 rounded px-2 py-1">
                    <span className="text-[9px] text-[#8A8A95]">Kembalian</span>
                    <span className="text-[10px] font-bold text-[#2ECC71]" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                      {formatCurrency(change)}
                    </span>
                  </div>
                )}
                {paymentMethod === "DP" && paid > 0 && paid < total && (
                  <div className="flex justify-between items-center bg-yellow-500/10 rounded px-2 py-1">
                    <span className="text-[9px] text-[#8A8A95]">Sisa Tagihan</span>
                    <span className="text-[10px] font-bold text-yellow-500" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                      {formatCurrency(total - paid)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Credit Method Info */}
          {(paymentMethod === "Piutang" || paymentMethod === "Angsuran") && (
            <div className="bg-[#FF6B1A]/5 border border-[#FF6B1A]/20 rounded p-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-[#64748B]">Total Hutang:</span>
                <span className="text-[10px] font-bold text-[#1E293B]">{formatCurrency(total)}</span>
              </div>
            </div>
          )}

          {/* Checkout Button */}
          <div className="flex gap-1.5">
            <motion.button
              onClick={() => onPreviewInvoice && onPreviewInvoice(paymentMethod, paid)}
              whileTap={{ scale: 0.97 }}
              className="flex-1 rounded py-2 text-[10px] font-bold flex items-center justify-center gap-1 transition-all duration-200 border border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC] bg-[#FFFFFF]"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              👁️ Preview
            </motion.button>
            <motion.button
              onClick={handleCheckout}
              whileTap={{ scale: 0.97 }}
              className="flex-[2] rounded py-2 text-[10px] font-bold flex items-center justify-center gap-1 transition-all duration-200"
              style={{
                fontFamily: "Syne, sans-serif",
                backgroundColor: "#FF6B1A",
                color: "#FFFFFF",
                letterSpacing: "0.01em",
              }}
              whileHover={{ backgroundColor: "#FFB347" }}
            >
              🖨️ Cetak & Bayar
            </motion.button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          >
            <motion.div
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              className="rounded-2xl p-5 w-72"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
              }}
            >
              <p
                className="text-sm font-bold mb-1"
                style={{
                  fontFamily: "Syne, sans-serif",
                  color: "#1E293B",
                }}
              >
                Hapus item ini?
              </p>
              <p
                className="text-[11px] mb-4"
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  color: "#64748B",
                }}
              >
                Item akan dihapus dari keranjang.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 rounded-xl py-2 text-xs font-bold"
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    color: "#1E293B",
                    border: "1px solid #E2E8F0",
                    backgroundColor: "#F8FAFC",
                  }}
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    onRemoveItem(deleteConfirm);
                    setDeleteConfirm(null);
                    if (expandedItem === deleteConfirm) setExpandedItem(null);
                  }}
                  className="flex-1 rounded-xl py-2 text-xs font-bold"
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    backgroundColor: "#E74C3C",
                    color: "#fff",
                  }}
                >
                  Hapus
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
