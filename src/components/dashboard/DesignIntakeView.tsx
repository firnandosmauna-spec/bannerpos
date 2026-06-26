import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Paintbrush, Printer, ArrowRight, Info, Play, Square, Clock } from "lucide-react";

interface DesignIntakeViewProps {
  onProceed: (designData: { hasDesign: boolean; fee: number; note: string } | null) => void;
}

export default function DesignIntakeView({ onProceed }: DesignIntakeViewProps) {
  const [selectedType, setSelectedType] = useState<"print" | "design" | null>(null);
  const [designFee, setDesignFee] = useState(25000);
  const [designNote, setDesignNote] = useState("");
  const [timerRunning, setTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);

  const pricingRules = [
    { label: "0-30 Menit", maxMinutes: 30, fee: 10000 },
    { label: "31-60 Menit", maxMinutes: 60, fee: 20000 },
    { label: "61-120 Menit", maxMinutes: 120, fee: 35000 },
  ];

  const calculateSuggestedFee = (secs: number) => {
    const mins = Math.ceil(secs / 60);
    const rule = pricingRules.find(r => mins <= r.maxMinutes) || pricingRules[pricingRules.length - 1];
    return rule ? rule.fee : 25000;
  };

  useEffect(() => {
    let interval: any;
    if (timerRunning) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 bg-[#F8FAFC]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-[#1E293B] mb-2" style={{ fontFamily: "Syne, sans-serif" }}>Pilih Layanan</h2>
          <p className="text-[#64748B]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Tentukan jenis layanan sebelum memulai transaksi</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Option 1: Print Only */}
          <motion.div
            whileHover={{ y: -5 }}
            onClick={() => setSelectedType("print")}
            className={`cursor-pointer p-8 rounded-3xl border-2 transition-all flex flex-col items-center text-center gap-4 ${
              selectedType === "print" 
                ? "bg-[#FFFFFF] border-[#FF6B1A] shadow-xl shadow-orange-500/10" 
                : "bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#FF6B1A]/30 shadow-sm"
            }`}
          >
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-4xl shadow-inner transition-transform group-hover:scale-110 ${selectedType === 'print' ? 'bg-[#FF6B1A] text-white shadow-orange-700/20' : 'bg-[#F8FAFC] text-[#64748B]'}`}>
              🖨️
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1E293B] mb-1" style={{ fontFamily: "Syne, sans-serif" }}>Cetak Saja</h3>
              <p className="text-sm text-[#64748B]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Konsumen sudah memiliki file desain</p>
            </div>
            {selectedType === "print" && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-2 w-6 h-6 bg-[#FF6B1A] rounded-full flex items-center justify-center text-white">
                <ArrowRight size={14} />
              </motion.div>
            )}
          </motion.div>

          {/* Option 2: Design Service */}
          <motion.div
            whileHover={{ y: -5 }}
            onClick={() => setSelectedType("design")}
            className={`cursor-pointer p-8 rounded-3xl border-2 transition-all flex flex-col items-center text-center gap-4 ${
              selectedType === "design" 
                ? "bg-[#FFFFFF] border-[#FF6B1A] shadow-xl shadow-orange-500/10" 
                : "bg-[#FFFFFF] border-[#E2E8F0] hover:border-[#FF6B1A]/30 shadow-sm"
            }`}
          >
            <div className={`w-24 h-24 rounded-3xl flex items-center justify-center text-4xl shadow-inner transition-transform group-hover:scale-110 ${selectedType === 'design' ? 'bg-[#FF6B1A] text-white shadow-orange-700/20' : 'bg-[#F8FAFC] text-[#64748B]'}`}>
              🎨
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1E293B] mb-1" style={{ fontFamily: "Syne, sans-serif" }}>Layanan Desain</h3>
              <p className="text-sm text-[#64748B]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Konsumen butuh jasa desain operator</p>
            </div>
            {selectedType === "design" && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mt-2 w-6 h-6 bg-[#FF6B1A] rounded-full flex items-center justify-center text-white">
                <ArrowRight size={14} />
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Conditional Form for Design Service */}
        <AnimatePresence>
          {selectedType === "design" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-3xl border border-[#E2E8F0] p-8 mb-10 shadow-sm overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-6 text-[#FF6B1A]">
                <Info size={20} />
                <h4 className="font-bold uppercase tracking-wider text-xs">Detail Layanan Desain</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 flex flex-col items-center gap-3">
                    <div className="flex items-center gap-2 text-[#64748B]">
                      <Clock size={16} />
                      <span className="text-[10px] font-bold uppercase tracking-widest">Waktu Pengerjaan</span>
                    </div>
                    <div className="text-3xl font-black text-[#1E293B]" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                      {formatTime(seconds)}
                    </div>
                    <div className="flex gap-2 w-full">
                      {!timerRunning ? (
                        <button 
                          onClick={() => setTimerRunning(true)}
                          className="flex-1 bg-[#2ECC71] text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#27AE60] transition-all"
                        >
                          <Play size={14} /> Start Timer
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            setTimerRunning(false);
                            setDesignFee(calculateSuggestedFee(seconds));
                          }}
                          className="flex-1 bg-[#E74C3C] text-white py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#C0392B] transition-all"
                        >
                          <Square size={14} /> Stop Timer
                        </button>
                      )}
                      <button 
                        onClick={() => { setSeconds(0); setTimerRunning(false); }}
                        className="px-3 bg-[#E2E8F0] text-[#64748B] rounded-xl hover:bg-[#CBD5E1] transition-all"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#64748B] uppercase tracking-widest">Biaya Desain (IDR)</label>
                    <input 
                      type="text" 
                      value={new Intl.NumberFormat("id-ID").format(designFee)}
                      onChange={(e) => setDesignFee(parseInt(e.target.value.replace(/\./g, "")) || 0)}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-5 py-3 text-lg font-bold text-[#FF6B1A] focus:border-[#FF6B1A] outline-none transition-all" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#64748B] uppercase tracking-widest">Konsep Desain</label>
                  <textarea 
                    rows={8}
                    value={designNote}
                    onChange={(e) => setDesignNote(e.target.value)}
                    placeholder="Contoh: Banner warung, tema ceria..."
                    className="w-full h-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-5 py-3 text-sm text-[#1E293B] focus:border-[#FF6B1A] outline-none resize-none transition-all"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center">
          <button
            disabled={!selectedType}
            onClick={() => {
              if (selectedType === 'print') onProceed(null);
              else onProceed({ hasDesign: true, fee: designFee, note: designNote });
            }}
            className={`px-12 py-4 rounded-2xl font-bold text-lg transition-all flex items-center gap-3 shadow-lg ${
              selectedType 
                ? "bg-[#FF6B1A] text-white hover:bg-[#FFB347] shadow-orange-500/30" 
                : "bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed"
            }`}
          >
            Lanjut ke Transaksi <ArrowRight size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
