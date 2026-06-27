import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Printer, Clock, LogOut, ChevronDown, User } from "lucide-react";

interface TopNavProps {
  kasirName: string;
  onLogout: () => void;
  currentView: string;
  onViewChange: (view: any) => void;
}

export default function TopNav({ 
  kasirName, 
  onLogout, 
  currentView, 
  onViewChange 
}: TopNavProps) {
  const [time, setTime] = useState(new Date());
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Time update
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const formatDate = (d: Date) =>
    d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <>
      <header
        className="flex items-center justify-between px-4 lg:px-5 py-2 border-b shadow-sm"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: "#E2E8F0",
          height: 52,
        }}
      >
        {/* Logo */}
        <div className="hidden items-center gap-2 lg:gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: "#FF6B1A" }}
          >
            <Printer size={16} color="#1A1A1F" />
          </div>
          <span
            className="text-sm lg:text-base font-bold truncate hidden sm:inline-block"
            style={{
              fontFamily: "Syne, sans-serif",
              color: "#1E293B",
              letterSpacing: "-0.02em",
            }}
          >
            BANNER<span style={{ color: "#FF6B1A" }}>POS</span>
          </span>
        </div>

        {currentView !== "pos" && (
          <div className="flex-1 px-5 hidden lg:block">
            <h2 
              className="text-[10px] font-bold uppercase tracking-[0.2em]" 
              style={{ fontFamily: "Syne, sans-serif", color: "#64748B" }}
            >
              {currentView === "stock-card" 
                ? "Kartu Stok" 
                : currentView === "purchase-materials"
                ? "Pembelian Bahan"
                : currentView.replace("master-", "Master ").replace("report-", "Laporan ").replace("-", " ")}
            </h2>
          </div>
        )}

        {/* Clock - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-3 border-l border-[#E2E8F0] pl-5 ml-auto mr-5">
          <Clock size={13} style={{ color: "#64748B" }} />
          <div className="text-right">
            <p
              className="text-xs font-bold leading-tight"
              style={{
                fontFamily: "JetBrains Mono, monospace",
                color: "#1E293B",
              }}
            >
              {formatTime(time)}
            </p>
            <p
              className="text-[10px] leading-tight"
              style={{
                fontFamily: "Space Grotesk, sans-serif",
                color: "#64748B",
              }}
            >
              {formatDate(time)}
            </p>
          </div>
        </div>

        {/* Kasir + Logout */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDropdown(!showDropdown);
            }}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-all duration-150"
            style={{
              border: "1px solid #E2E8F0",
              backgroundColor: showDropdown ? "#F8FAFC" : "transparent",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#F8FAFC")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = showDropdown
                ? "#F8FAFC"
                : "transparent")
            }
          >
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,107,26,0.1)" }}
            >
              <User size={12} style={{ color: "#FF6B1A" }} />
            </div>
            <div className="text-left">
              <p
                className="text-[11px] font-semibold leading-tight"
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  color: "#1E293B",
                }}
              >
                {kasirName}
              </p>
              <p
                className="text-[9px] leading-tight"
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  color: "#64748B",
                }}
              >
                Kasir Aktif
              </p>
            </div>
            <ChevronDown
              size={12}
              style={{
                color: "#64748B",
                transform: showDropdown ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            />
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden z-50 shadow-xl border border-[#E2E8F0]"
                style={{
                  width: 180,
                  backgroundColor: "#FFFFFF",
                }}
              >
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-sm transition-colors duration-150"
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    color: "#E74C3C",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "rgba(231,76,60,0.08)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ backgroundColor: "rgba(0,0,0,0.7)" }}
            onClick={() => setShowLogoutConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="rounded-2xl p-6 w-80 shadow-2xl border border-[#E2E8F0]"
              style={{
                backgroundColor: "#FFFFFF",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "rgba(231,76,60,0.1)" }}
              >
                <LogOut size={20} style={{ color: "#E74C3C" }} />
              </div>
              <h3
                className="text-center text-lg font-bold mb-2"
                style={{
                  fontFamily: "Syne, sans-serif",
                  color: "#1E293B",
                }}
              >
                Konfirmasi Logout
              </h3>
              <p
                className="text-center text-sm mb-6"
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  color: "#64748B",
                }}
              >
                Yakin ingin keluar dari sistem POS?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-all duration-150"
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    color: "#F0EDE8",
                    border: "1px solid #2E2E36",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#1A1A1F")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  Batal
                </button>
                <button
                  onClick={() => {
                    onLogout();
                  }}
                  className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-all duration-150"
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    backgroundColor: "#E74C3C",
                    color: "#fff",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.opacity = "0.85")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Ya, Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
