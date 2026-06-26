import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import LoginPage from "@/components/login/LoginPage";
import Dashboard from "@/components/dashboard/Dashboard";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [kasirName, setKasirName] = useState<string | null>(null);
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
    const { data } = await supabase.from("profiles").select("name").eq("id", user.id).single();
    setKasirName(data?.name || user.email?.split('@')[0] || "User");
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
      <AnimatePresence mode="wait">
        {!kasirName ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <LoginPage onLogin={handleLogin} />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 1.01 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ height: "100vh" }}
          >
            <Dashboard kasirName={kasirName} onLogout={handleLogout} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
