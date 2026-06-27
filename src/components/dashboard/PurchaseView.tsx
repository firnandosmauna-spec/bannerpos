import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Plus, Calendar, Truck, Box, DollarSign, 
  Trash2, Filter, ArrowUpRight, ArrowDownRight, RefreshCw, 
  FileText, CheckCircle2, XCircle, Save
} from "lucide-react";
import { Purchase, Material, Supplier } from "@/types/pos";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface PurchaseViewProps {
  materials: Material[];
  suppliers: Supplier[];
  onRefreshMaterials: () => void;
}

export default function PurchaseView({ materials, suppliers, onRefreshMaterials }: PurchaseViewProps) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  // Form State
  const [formData, setFormData] = useState({
    materialId: "",
    supplierId: "",
    quantity: 0,
    unitPrice: 0,
    paymentStatus: "lunas" as "lunas" | "hutang",
    note: ""
  });

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("purchases")
        .select(`
          *,
          ingredients (name),
          contacts (name)
        `)
        .order("purchase_date", { ascending: false });

      if (error) throw error;

      if (data) {
        setPurchases(data.map((p: any) => ({
          id: p.id,
          purchaseNo: p.purchase_no,
          materialId: p.ingredient_id,
          materialName: p.ingredients?.name || "Bahan Terhapus",
          supplierId: p.supplier_id,
          supplierName: p.contacts?.name || "Supplier Terhapus",
          quantity: p.quantity,
          unitPrice: p.unit_price,
          totalPrice: p.total_price,
          paymentStatus: p.payment_status,
          purchaseDate: p.purchase_date,
          note: p.note || ""
        })));
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
      // Fallback mock data
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, []);

  const handleSavePurchase = async () => {
    if (!formData.materialId || !formData.supplierId || formData.quantity <= 0) {
      toast.error("Harap isi semua data dengan benar");
      return;
    }

    const totalPrice = formData.quantity * formData.unitPrice;
    const purchaseNo = `PRC-${Date.now().toString().slice(-6)}`;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("purchases")
        .insert([{
          purchase_no: purchaseNo,
          ingredient_id: formData.materialId,
          supplier_id: formData.supplierId,
          quantity: formData.quantity,
          unit_price: formData.unitPrice,
          total_price: totalPrice,
          payment_status: formData.paymentStatus,
          note: formData.note,
          purchase_date: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      // Update Stock in ingredients table
      const material = materials.find(m => m.id === formData.materialId);
      if (material) {
        const newStock = material.stock + formData.quantity;
        const { error: stockError } = await supabase
          .from("ingredients")
          .update({ stock: newStock })
          .eq("id", formData.materialId);
        
        if (stockError) throw stockError;
        
        // Log the movement
        await supabase.from("inventory_logs").insert([{
          ingredient_id: formData.materialId,
          type: "in",
          quantity: formData.quantity,
          previous_stock: material.stock,
          current_stock: newStock,
          note: `Pembelian: ${purchaseNo}`
        }]);
      }

      toast.success("Pembelian berhasil dicatat!");
      setIsModalOpen(false);
      fetchPurchases();
      onRefreshMaterials();
      
      // Reset form
      setFormData({
        materialId: "",
        supplierId: "",
        quantity: 0,
        unitPrice: 0,
        paymentStatus: "lunas",
        note: ""
      });
    } catch (error) {
      console.error("Error saving purchase:", error);
      toast.error("Gagal mencatat pembelian");
    } finally {
      setLoading(false);
    }
  };

  const filtered = purchases.filter(p => 
    p.purchaseNo.toLowerCase().includes(search.toLowerCase()) ||
    p.materialName?.toLowerCase().includes(search.toLowerCase()) ||
    p.supplierName?.toLowerCase().includes(search.toLowerCase())
  );

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] p-3 lg:p-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h2 className="text-lg lg:text-xl font-bold text-[#1E293B]" style={{ fontFamily: "Syne, sans-serif" }}>Pembelian Bahan</h2>
          <p className="text-[11px] lg:text-xs text-[#64748B]" style={{ fontFamily: "Space Grotesk, sans-serif" }}>Catat pengadaan bahan baku dari supplier</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-[#FF6B1A] text-[#FFFFFF] hover:bg-[#FFB347] transition-all shadow-lg shadow-orange-500/20"
        >
          <span className="text-lg">🛒</span> Tambah Pembelian
        </button>
      </div>

      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
        <input
          type="text"
          placeholder="Cari nomor pembelian, bahan, atau supplier..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2 text-xs text-[#1E293B] outline-none focus:border-[#FF6B1A] transition-all shadow-sm"
        />
      </div>

      <div className="flex-1 overflow-y-auto rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead className="sticky top-0 bg-[#F8FAFC] z-10 border-b border-[#E2E8F0]">
            <tr>
              <th className="px-4 py-2 text-[9px] font-bold text-[#64748B] uppercase tracking-widest">Tgl / No.</th>
              <th className="px-4 py-2 text-[9px] font-bold text-[#64748B] uppercase tracking-widest">Bahan & Supplier</th>
              <th className="px-4 py-2 text-[9px] font-bold text-[#64748B] uppercase tracking-widest">Qty</th>
              <th className="px-4 py-2 text-[9px] font-bold text-[#64748B] uppercase tracking-widest">Harga Satuan</th>
              <th className="px-4 py-2 text-[9px] font-bold text-[#64748B] uppercase tracking-widest">Total</th>
              <th className="px-4 py-2 text-[9px] font-bold text-[#64748B] uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors group">
                <td className="px-4 py-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-[#FF6B1A]">{item.purchaseNo}</span>
                    <span className="text-[9px] text-[#64748B]">{new Date(item.purchaseDate).toLocaleDateString("id-ID")}</span>
                  </div>
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-[#1E293B]">{item.materialName}</span>
                    <span className="text-[9px] text-[#64748B] flex items-center gap-1">
                      <Truck size={10} /> {item.supplierName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2 text-xs font-bold text-[#1E293B]">
                  {item.quantity}
                </td>
                <td className="px-4 py-2 text-xs text-[#1E293B]">
                  {formatCurrency(item.unitPrice)}
                </td>
                <td className="px-4 py-2 text-xs font-black text-[#1E293B]">
                  {formatCurrency(item.totalPrice)}
                </td>
                <td className="px-4 py-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    item.paymentStatus === 'lunas' 
                      ? 'bg-green-500/10 text-green-600' 
                      : 'bg-yellow-500/10 text-yellow-600'
                  }`}>
                    {item.paymentStatus === 'lunas' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                    {item.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Box size={48} className="text-[#E2E8F0] mb-4" />
            <p className="text-sm text-[#64748B] font-medium">Belum ada data pembelian.</p>
          </div>
        )}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="animate-spin text-[#FF6B1A]" size={24} />
          </div>
        )}
      </div>

      {/* Modal Tambah Pembelian */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#FFFFFF] rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <h3 className="text-base font-bold text-[#1E293B]">Form Pembelian Baru</h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Pilih Bahan</label>
                  <select 
                    value={formData.materialId}
                    onChange={(e) => setFormData({...formData, materialId: e.target.value})}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#FF6B1A] transition-all"
                  >
                    <option value="">-- Pilih Bahan --</option>
                    {materials.map(m => <option key={m.id} value={m.id}>{m.name} (Stok: {m.stock})</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Pilih Supplier</label>
                  <select 
                    value={formData.supplierId}
                    onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#FF6B1A] transition-all"
                  >
                    <option value="">-- Pilih Supplier --</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Jumlah (Qty)</label>
                    <input 
                      type="number" 
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: Number(e.target.value)})}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#FF6B1A]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Harga Satuan</label>
                    <input 
                      type="number" 
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({...formData, unitPrice: Number(e.target.value)})}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#FF6B1A]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Status Pembayaran</label>
                  <div className="flex gap-2">
                    {["lunas", "hutang"].map(s => (
                      <button
                        key={s}
                        onClick={() => setFormData({...formData, paymentStatus: s as any})}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                          formData.paymentStatus === s 
                            ? 'bg-[#FF6B1A] text-white' 
                            : 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Catatan</label>
                  <textarea 
                    value={formData.note}
                    onChange={(e) => setFormData({...formData, note: e.target.value})}
                    rows={2}
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#FF6B1A] resize-none"
                  />
                </div>

                <div className="pt-4 flex justify-between items-center border-t border-[#E2E8F0]">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#64748B] uppercase font-bold">Total Tagihan</span>
                    <span className="text-lg font-black text-[#FF6B1A]">{formatCurrency(formData.quantity * formData.unitPrice)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 text-xs font-bold text-[#64748B] hover:bg-gray-50 rounded-xl"
                    >
                      Batal
                    </button>
                    <button 
                      onClick={handleSavePurchase}
                      disabled={loading}
                      className="px-6 py-2 bg-[#FF6B1A] text-white text-xs font-bold rounded-xl hover:bg-[#FFB347] transition-all flex items-center gap-2"
                    >
                      {loading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
