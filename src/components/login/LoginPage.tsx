import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Printer, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface LoginPageProps {
  onLogin: (username: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Username dan password tidak boleh kosong.");
      return;
    }

    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 1200));

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setIsLoading(false);
      setError(authError.message === "Invalid login credentials" ? "Email atau password salah." : `Login gagal: ${authError.message}`);
      return;
    }

    if (data.user) {
      const { data: profile } = await supabase.from("profiles").select("name").eq("id", data.user.id).single();
      onLogin(profile?.name || email.split('@')[0]);
    }
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: "#1A1A1F" }}
    >
      {/* Background texture */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.4'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Accent glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl opacity-10"
        style={{ backgroundColor: "#FF6B1A" }}
      />

      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(255,107,26,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,26,0.3) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* Card */}
        <div
          className="rounded-2xl p-8 border"
          style={{
            backgroundColor: "#242429",
            borderColor: "#2E2E36",
            boxShadow:
              "0 0 0 1px rgba(255,107,26,0.08), 0 24px 64px rgba(0,0,0,0.6)",
          }}
        >
          {/* Logo */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: "#FF6B1A" }}
              >
                <Printer size={24} color="#1A1A1F" />
              </div>
              <div className="text-left">
                <h1
                  className="text-2xl font-bold leading-tight"
                  style={{
                    fontFamily: "Syne, sans-serif",
                    color: "#F0EDE8",
                    letterSpacing: "-0.02em",
                  }}
                >
                  BANNER<span style={{ color: "#FF6B1A" }}>POS</span>
                </h1>
                <p
                  className="text-xs"
                  style={{
                    fontFamily: "Space Grotesk, sans-serif",
                    color: "#8A8A95",
                  }}
                >
                  Sistem POS Percetakan
                </p>
              </div>
            </div>
            <div
              className="h-px w-16 mx-auto mt-4"
              style={{ backgroundColor: "#FF6B1A", opacity: 0.4 }}
            />
          </motion.div>

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div
                  className="flex items-start gap-3 rounded-xl p-3.5 border"
                  style={{
                    backgroundColor: "rgba(231,76,60,0.1)",
                    borderColor: "rgba(231,76,60,0.3)",
                  }}
                >
                  <AlertCircle
                    size={16}
                    style={{ color: "#E74C3C", flexShrink: 0, marginTop: 1 }}
                  />
                  <p
                    className="text-sm"
                    style={{
                      fontFamily: "Space Grotesk, sans-serif",
                      color: "#E74C3C",
                    }}
                  >
                    {error}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email/Username Field */}
            <motion.div variants={itemVariants}>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  color: "#8A8A95",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Username / Email
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin atau kasir@percetakan.com"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200"
                style={{
                  backgroundColor: "#1A1A1F",
                  border: `1px solid ${error ? "rgba(231,76,60,0.4)" : "#2E2E36"}`,
                  color: "#F0EDE8",
                  fontFamily: "Space Grotesk, sans-serif",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FF6B1A";
                  e.target.style.boxShadow = "0 0 0 3px rgba(255,107,26,0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = error
                    ? "rgba(231,76,60,0.4)"
                    : "#2E2E36";
                  e.target.style.boxShadow = "none";
                }}
              />
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants}>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  color: "#8A8A95",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all duration-200 pr-12"
                  style={{
                    backgroundColor: "#1A1A1F",
                    border: `1px solid ${error ? "rgba(231,76,60,0.4)" : "#2E2E36"}`,
                    color: "#F0EDE8",
                    fontFamily: "Space Grotesk, sans-serif",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#FF6B1A";
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(255,107,26,0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = error
                      ? "rgba(231,76,60,0.4)"
                      : "#2E2E36";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors duration-150"
                  style={{ color: "#8A8A95" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </motion.div>

            {/* Remember Me */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-2.5"
            >
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="w-4 h-4 rounded flex items-center justify-center transition-all duration-150 flex-shrink-0"
                style={{
                  backgroundColor: rememberMe ? "#FF6B1A" : "transparent",
                  border: `1.5px solid ${rememberMe ? "#FF6B1A" : "#2E2E36"}`,
                }}
              >
                {rememberMe && (
                  <svg
                    width="10"
                    height="8"
                    viewBox="0 0 10 8"
                    fill="none"
                  >
                    <path
                      d="M1 4L3.5 6.5L9 1"
                      stroke="#1A1A1F"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
              <span
                className="text-sm select-none cursor-pointer"
                style={{
                  fontFamily: "Space Grotesk, sans-serif",
                  color: "#8A8A95",
                }}
                onClick={() => setRememberMe(!rememberMe)}
              >
                Ingat saya
              </span>
            </motion.div>

            {/* Login Button */}
            <motion.div variants={itemVariants} className="pt-2">
              <motion.button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl py-3.5 font-semibold text-sm relative overflow-hidden transition-all duration-200"
                style={{
                  backgroundColor: "#FF6B1A",
                  color: "#1A1A1F",
                  fontFamily: "Space Grotesk, sans-serif",
                  letterSpacing: "0.02em",
                }}
                whileTap={{ scale: 0.97 }}
                whileHover={{ backgroundColor: "#FFB347" }}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Memverifikasi...
                  </span>
                ) : (
                  "Masuk ke Dashboard"
                )}
              </motion.button>
            </motion.div>
          </form>
        </div>

        {/* Bottom tagline */}
        <motion.p
          variants={itemVariants}
          className="text-center text-xs mt-6"
          style={{
            fontFamily: "Space Grotesk, sans-serif",
            color: "#8A8A95",
          }}
        >
          © 2024 BannerPOS · Sistem Percetakan Profesional
        </motion.p>
      </motion.div>
    </div>
  );
}
