import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LoginPage from "@/components/login/LoginPage";
import Dashboard from "@/components/dashboard/Dashboard";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [kasirName, setKasirName] = useState<string | null>(null);
  const [kasirRole, setKasirRole] = useState<string>("kasir");
  const [kasirPermissions, setKasirPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setKasirName(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (user: any) => {
    // Gunakan select("*") agar tidak error 400 jika kolom permissions belum dibuat di database
    const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    
    if (error) {
      console.error("Gagal mengambil profil:", error);
    }
    // Jika profile tidak ditemukan (biasanya terjadi pada akun Admin Utama yang dibuat langsung dari Supabase Studio),
    // kita set otomatis sebagai 'admin'. Semua kasir yang dibuat via aplikasi PASTI memiliki profile.
    let role = data?.role?.toLowerCase();
    if (!role) {
      role = (data === null || user.email?.includes('admin')) ? 'admin' : 'kasir';
    }
    
    setKasirName(data?.name || user.email?.split('@')[0] || "Administrator");
    setKasirRole(role);
    
    // Jika permissions kosong atau belum ada, berikan akses dasar kasir agar menu tidak hilang semua
    const defaultKasirPerms = ["dashboard", "pos", "production-tracking", "report-transactions", "master-produk", "master-kategori", "master-bahan", "stock-card"];
    setKasirPermissions(data?.permissions || defaultKasirPerms);
    setLoading(false);
  };

  const handleLogin = (name: string) => {
    setKasirName(name);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setKasirName(null);
  };

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-[#1A1A1F] text-[#FFB347] font-bold">Memuat...</div>;
  }


  return (
    <div style={{ backgroundColor: "#1A1A1F", minHeight: "100vh" }}>
      {!kasirName ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <Dashboard kasirName={kasirName} kasirRole={kasirRole} kasirPermissions={kasirPermissions} onLogout={handleLogout} />
      )}
    </div>
  );
}
