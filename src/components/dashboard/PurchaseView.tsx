import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Plus, Calendar, Truck, Box, DollarSign, 
  Trash2, Filter, ArrowUpRight, ArrowDownRight, RefreshCw, 
  FileText, CheckCircle2, XCircle, Save, Edit
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
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Purchase | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    materialId: "",
    supplierId: "",
    quantity: 0,
    unitPrice: 0,
    paidAmount: 0,
    paymentStatus: "lunas" as "lunas" | "hutang",
    note: ""
  });
  
  const [payOffConfirm, setPayOffConfirm] = useState<Purchase | null>(null);
  const [payOffAmount, setPayOffAmount] = useState<number>(0);

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
          paidAmount: p.paid_amount || 0,
          remainingAmount: p.remaining_amount || 0,
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

  const openEditModal = (purchase: Purchase) => {
    setEditingPurchase(purchase);
    setFormData({
      materialId: purchase.materialId || "",
      supplierId: purchase.supplierId || "",
      quantity: purchase.quantity || 0,
      unitPrice: purchase.unitPrice || 0,
      paidAmount: purchase.paidAmount || 0,
      paymentStatus: purchase.paymentStatus as "lunas" | "hutang",
      note: purchase.note || ""
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPurchase(null);
    setFormData({
      materialId: "",
      supplierId: "",
      quantity: 0,
      unitPrice: 0,
      paidAmount: 0,
      paymentStatus: "lunas",
      note: ""
    });
  };

  const handleSubmitPurchase = async () => {
    if (!formData.materialId || !formData.supplierId || formData.quantity <= 0) {
      toast.error("Harap isi semua data dengan benar");
      return;
    }

    const totalPrice = formData.quantity * formData.unitPrice;
    let paidAmount = formData.paidAmount;
    if (formData.paymentStatus === "lunas") {
      paidAmount = totalPrice;
    }
    const remainingAmount = Math.max(0, totalPrice - paidAmount);
    const finalPaymentStatus = remainingAmount <= 0 ? "lunas" : "hutang";

    try {
      setLoading(true);

      if (editingPurchase) {
        // Rollback stok lama
        const oldMaterial = materials.find(m => m.id === editingPurchase.materialId);
        const newMaterial = materials.find(m => m.id === formData.materialId);

        if (oldMaterial && newMaterial) {
           if (oldMaterial.id === newMaterial.id) {
              const diff = formData.quantity - editingPurchase.quantity;
              const newStock = oldMaterial.stock + diff;
              await supabase.from("ingredients").update({ stock: newStock }).eq("id", oldMaterial.id);
           } else {
              const rbStock = oldMaterial.stock - editingPurchase.quantity;
              await supabase.from("ingredients").update({ stock: rbStock }).eq("id", oldMaterial.id);
              const addStock = newMaterial.stock + formData.quantity;
              await supabase.from("ingredients").update({ stock: addStock }).eq("id", newMaterial.id);
           }
        }

        const { error } = await supabase
          .from("purchases")
          .update({
            ingredient_id: formData.materialId,
            supplier_id: formData.supplierId,
            quantity: formData.quantity,
            unit_price: formData.unitPrice,
            total_price: totalPrice,
            paid_amount: paidAmount,
            remaining_amount: remainingAmount,
            payment_status: finalPaymentStatus,
            note: formData.note
          })
          .eq("id", editingPurchase.id);

        if (error) throw error;
        toast.success("Pembelian berhasil diperbarui!");
      } else {
        const purchaseNo = `PRC-${Date.now().toString().slice(-6)}`;
        const { error } = await supabase
          .from("purchases")
          .insert([{
            purchase_no: purchaseNo,
            ingredient_id: formData.materialId,
            supplier_id: formData.supplierId,
            quantity: formData.quantity,
            unit_price: formData.unitPrice,
            total_price: totalPrice,
            paid_amount: paidAmount,
            remaining_amount: remainingAmount,
            payment_status: finalPaymentStatus,
            note: formData.note,
            purchase_date: new Date().toISOString()
          }]);

        if (error) throw error;

        const material = materials.find(m => m.id === formData.materialId);
        if (material) {
          const newStock = material.stock + formData.quantity;
          await supabase.from("ingredients").update({ stock: newStock }).eq("id", formData.materialId);
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
      }

      handleCloseModal();
      fetchPurchases();
      onRefreshMaterials();
    } catch (error) {
      console.error("Error saving purchase:", error);
      toast.error("Gagal menyimpan pembelian");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePurchase = async () => {
    if (!deleteConfirm) return;
    try {
      setLoading(true);
      const material = materials.find(m => m.id === deleteConfirm.materialId);
      if (material) {
        const newStock = material.stock - deleteConfirm.quantity;
        await supabase.from("ingredients").update({ stock: newStock }).eq("id", material.id);
      }
      
      const { error } = await supabase.from("purchases").delete().eq("id", deleteConfirm.id);
      if (error) throw error;

      toast.success("Pembelian berhasil dihapus!");
      setDeleteConfirm(null);
      fetchPurchases();
      onRefreshMaterials();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus pembelian");
    } finally {
      setLoading(false);
    }
  };

  const handlePayOff = async () => {
    if (!payOffConfirm || payOffAmount <= 0) return;
    try {
      setLoading(true);
      const newPaid = (payOffConfirm.paidAmount || 0) + payOffAmount;
      const newRemaining = payOffConfirm.totalPrice - newPaid;
      const newStatus = newRemaining <= 0 ? "lunas" : "hutang";

      const { error } = await supabase.from("purchases").update({
        paid_amount: newPaid,
        remaining_amount: Math.max(0, newRemaining),
        payment_status: newStatus
      }).eq("id", payOffConfirm.id);

      if (error) throw error;
      toast.success("Pembayaran cicilan berhasil dicatat!");
      setPayOffConfirm(null);
      setPayOffAmount(0);
      fetchPurchases();
    } catch (err) {
      console.error(err);
      toast.error("Gagal mencatat pembayaran");
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
          onClick={() => {
            handleCloseModal(); // Reset form & state
            setIsModalOpen(true);
          }}
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
              <th className="px-4 py-2 text-[9px] font-bold text-[#64748B] uppercase tracking-widest">Tagihan & Sisa</th>
              <th className="px-4 py-2 text-[9px] font-bold text-[#64748B] uppercase tracking-widest">Status</th>
              <th className="px-4 py-2 text-[9px] font-bold text-[#64748B] uppercase tracking-widest text-right">Aksi</th>
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
                <td className="px-4 py-2">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-[#1E293B]">Tot: {formatCurrency(item.totalPrice)}</span>
                    <span className="text-[10px] text-green-600 font-bold">DP: {formatCurrency(item.paidAmount || 0)}</span>
                    {item.remainingAmount !== undefined && item.remainingAmount > 0 && (
                      <span className="text-[10px] text-red-500 font-bold">Sisa: {formatCurrency(item.remainingAmount)}</span>
                    )}
                  </div>
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
                <td className="px-4 py-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    {item.paymentStatus === 'hutang' && (
                      <button
                        onClick={() => {
                          setPayOffConfirm(item);
                          setPayOffAmount(item.remainingAmount || 0);
                        }}
                        className="p-1.5 text-white bg-[#FF6B1A] hover:bg-[#FFB347] rounded-md transition-colors mr-1"
                        title="Bayar Cicilan/Lunas"
                      >
                        <DollarSign size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 text-[#64748B] hover:text-[#0EA5E9] hover:bg-[#F8FAFC] rounded transition-colors"
                      title="Edit Pembelian"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(item)}
                      className="p-1.5 text-[#64748B] hover:text-red-500 hover:bg-[#F8FAFC] rounded transition-colors"
                      title="Hapus Pembelian"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
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
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#FFFFFF] rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
                <h3 className="text-base font-bold text-[#1E293B]">{editingPurchase ? "Edit Pembelian" : "Form Pembelian Baru"}</h3>
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

                {formData.paymentStatus === "hutang" && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Jumlah Dibayar (DP/Cicilan)</label>
                    <input 
                      type="number" 
                      value={formData.paidAmount}
                      onChange={(e) => setFormData({...formData, paidAmount: Number(e.target.value)})}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#FF6B1A]"
                    />
                    {formData.quantity > 0 && formData.unitPrice > 0 && (
                      <p className="text-[10px] text-red-500 font-bold mt-1">
                        Sisa Hutang: {formatCurrency((formData.quantity * formData.unitPrice) - formData.paidAmount)}
                      </p>
                    )}
                  </div>
                )}

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
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-xs font-bold text-[#64748B] hover:bg-gray-50 rounded-xl"
                    >
                      Batal
                    </button>
                    <button 
                      onClick={handleSubmitPurchase}
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[#FFFFFF] rounded-2xl shadow-2xl p-6"
            >
              <h3 className="text-lg font-bold text-red-600 mb-2">Hapus Pembelian?</h3>
              <p className="text-sm text-[#64748B] mb-6">
                Data pembelian <span className="font-bold text-[#1E293B]">{deleteConfirm.purchaseNo}</span> akan dihapus. Stok bahan {deleteConfirm.materialName} juga akan dikurangi sebanyak {deleteConfirm.quantity}.
                <br /><br />Tindakan ini tidak dapat dibatalkan.
              </p>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#1E293B] text-xs font-bold rounded-xl transition-colors border border-[#E2E8F0]"
                >
                  Batal
                </button>
                <button 
                  onClick={handleDeletePurchase}
                  disabled={loading}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw size={14} className="animate-spin" /> : "Hapus Permanen"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pay Off / Cicilan Modal */}
      <AnimatePresence>
        {payOffConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setPayOffConfirm(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-sm bg-[#FFFFFF] rounded-2xl shadow-2xl p-6"
            >
              <h3 className="text-lg font-bold text-[#1E293B] mb-2">Bayar Cicilan Supplier</h3>
              <p className="text-xs text-[#64748B] mb-4">
                Pembelian <span className="font-bold text-[#1E293B]">{payOffConfirm.purchaseNo}</span> memiliki sisa hutang sebesar <span className="font-bold text-red-500">{formatCurrency(payOffConfirm.remainingAmount || 0)}</span>.
              </p>
              <div className="space-y-2 mb-6">
                <label className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">Nominal Pembayaran Sekarang</label>
                <input 
                  type="number" 
                  value={payOffAmount}
                  onChange={(e) => setPayOffAmount(Number(e.target.value))}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#FF6B1A]"
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setPayOffConfirm(null)}
                  className="flex-1 py-2.5 bg-[#F8FAFC] hover:bg-[#E2E8F0] text-[#1E293B] text-xs font-bold rounded-xl transition-colors border border-[#E2E8F0]"
                >
                  Batal
                </button>
                <button 
                  onClick={handlePayOff}
                  disabled={loading || payOffAmount <= 0}
                  className="flex-1 py-2.5 bg-[#2ECC71] hover:bg-[#27AE60] text-white text-xs font-bold rounded-xl transition-colors shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                >
                  {loading ? <RefreshCw size={14} className="animate-spin" /> : "Bayar"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
